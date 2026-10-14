import {afterEach, describe, expect, it, vi} from 'vitest';
import {handleLead, processLead, type LeadDependencies, type Store} from '../lib/leads';
import {contactSchema, quoteSchema} from '../lib/validation';

const ip = '203.0.113.42';
const validQuote = {
  locale: 'en',
  name: 'Test Buyer',
  email: 'buyer@example.com',
  vehicleType: 'suv',
  quantity: '2',
  destinationCountry: 'Ghana',
  privacy: true,
  submissionId: 'ad010253-8531-498d-b90b-c463fc3cb46e',
};
const validContact = {
  locale: 'fr',
  name: 'Test Buyer',
  email: 'buyer@example.com',
  message: 'Please discuss a vehicle export request with me.',
  privacy: true,
  submissionId: 'a5bbfbd4-cb5f-4ef5-83db-bb95228b406a',
};

function fixtures() {
  const records = new Map<string, {status: string; reference: string}>();
  const store: Store = {
    get: vi.fn(async (key: string) => records.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown, options: {nx?: boolean; ex: number}) => {
      if (options.nx && records.has(key)) return null;
      records.set(key, value as {status: string; reference: string});
      return 'OK';
    }),
    del: vi.fn(async (key: string) => Number(records.delete(key))),
  };
  const deps: LeadDependencies = {
    store,
    limit: vi.fn(async () => true),
    send: vi.fn(async () => true),
    salt: 'test-only-random-salt',
  };
  return {deps, records, store};
}

afterEach(() => vi.unstubAllEnvs());

describe('vehicle inquiry validation', () => {
  it('accepts a consumer vehicle brief, coerces quantity, and defaults optional choices', () => {
    const result = quoteSchema.parse(validQuote);
    expect(result.quantity).toBe(2);
    expect(result.company).toBe('');
    expect(result.currency).toBe('CAD');
    expect(result.marketingConsent).toBe(false);
  });

  it.each([
    ['unknown vehicle category', {vehicleType: 'cocoa'}],
    ['empty vehicle selection', {vehicleType: ''}],
    ['zero vehicles', {quantity: 0}],
    ['fractional quantity', {quantity: 1.5}],
    ['unbounded quantity', {quantity: 1001}],
    ['missing destination', {destinationCountry: ''}],
    ['invalid email', {email: 'not-an-email'}],
    ['missing privacy acknowledgement', {privacy: false}],
    ['unsupported currency', {currency: 'XYZ'}],
    ['oversized message', {message: 'x'.repeat(3001)}],
  ])('rejects %s before accessing services', async (_, change) => {
    const {deps} = fixtures();
    const response = await processLead('quote', {...validQuote, ...change}, ip, deps);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ok: false, code: 'validation'});
    expect(deps.store.get).not.toHaveBeenCalled();
    expect(deps.limit).not.toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
  });

  it('accepts a French contact inquiry without quote-specific fields', async () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
    const {deps} = fixtures();
    const response = await processLead('contact', validContact, ip, deps);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ok: true, reference: expect.stringMatching(/^CI-[A-F0-9]+$/)});
    expect(deps.send).toHaveBeenCalledWith(expect.objectContaining({
      replyTo: validContact.email,
      subject: expect.stringContaining('Contact inquiry'),
      text: expect.stringContaining('locale: fr'),
    }), expect.any(String));
  });

  it('rejects an empty contact message', async () => {
    const {deps} = fixtures();
    const response = await processLead('contact', {...validContact, message: ''}, ip, deps);
    expect(response.status).toBe(400);
    expect(response.body.fieldErrors).toHaveProperty('message');
    expect(deps.send).not.toHaveBeenCalled();
  });

  it('rejects honeypot submissions without sending or consuming rate limits', async () => {
    const {deps} = fixtures();
    const response = await processLead('quote', {...validQuote, website: 'https://spam.example'}, ip, deps);
    expect(response).toMatchObject({status: 400, body: {ok: false, code: 'invalid'}});
    expect(deps.store.get).not.toHaveBeenCalled();
    expect(deps.limit).not.toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
  });
});

describe('rate limiting, idempotency, and provider acceptance', () => {
  it('rejects over-limit requests before a lock or mail delivery', async () => {
    const {deps} = fixtures();
    vi.mocked(deps.limit).mockResolvedValue(false);
    const response = await processLead('quote', validQuote, ip, deps);
    expect(response).toMatchObject({status: 429, body: {ok: false, code: 'rate_limit'}});
    expect(response.body).not.toHaveProperty('reference');
    expect(deps.store.set).not.toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
  });

  it('hashes the rate-limit identity and retains no personal inquiry fields in Redis', async () => {
    const {deps, records} = fixtures();
    await processLead('quote', validQuote, ip, deps);
    const limiterIdentity = vi.mocked(deps.limit).mock.calls[0][0];
    expect(limiterIdentity).toMatch(/^[a-f0-9]{64}$/);
    const stored = JSON.stringify([...records.entries()]);
    for (const value of [ip, validQuote.name, validQuote.email, validQuote.destinationCountry]) {
      expect(stored).not.toContain(value);
    }
  });

  it('returns the same accepted reference for retries without delivering twice', async () => {
    const {deps} = fixtures();
    const first = await processLead('quote', validQuote, ip, deps);
    vi.mocked(deps.limit).mockResolvedValue(false);
    const retry = await processLead('quote', validQuote, ip, deps);
    expect(first.status).toBe(200);
    expect(retry).toEqual(first);
    expect(deps.send).toHaveBeenCalledTimes(1);
    expect(deps.limit).toHaveBeenCalledTimes(1);
  });

  it('blocks a retry while the same submission is awaiting provider acceptance', async () => {
    const {deps} = fixtures();
    let acknowledge!: (accepted: boolean) => void;
    let notifyStarted!: () => void;
    const started = new Promise<void>(resolve => { notifyStarted = resolve; });
    vi.mocked(deps.send).mockImplementation(() => {
      notifyStarted();
      return new Promise<boolean>(resolve => { acknowledge = resolve; });
    });
    const pending = processLead('quote', validQuote, ip, deps);
    await started;
    const retry = await processLead('quote', validQuote, ip, deps);
    expect(retry).toMatchObject({status: 409, body: {ok: false, code: 'pending'}});
    expect(retry.body).not.toHaveProperty('reference');
    expect(deps.send).toHaveBeenCalledTimes(1);
    acknowledge(true);
    expect((await pending).status).toBe(200);
  });

  it('uses an atomic lock for simultaneous submissions that both miss the initial cache', async () => {
    const {deps} = fixtures();
    const results = await Promise.all([
      processLead('quote', validQuote, ip, deps),
      processLead('quote', validQuote, ip, deps),
    ]);
    expect(results.map(result => result.status).sort()).toEqual([200, 409]);
    expect(deps.send).toHaveBeenCalledTimes(1);
  });

  it('releases a rejected delivery for a retry and never reports a premature reference', async () => {
    const {deps, records} = fixtures();
    vi.mocked(deps.send).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const failed = await processLead('quote', validQuote, ip, deps);
    expect(failed).toMatchObject({status: 502, body: {ok: false, code: 'delivery'}});
    expect(failed.body).not.toHaveProperty('reference');
    expect(records.size).toBe(0);
    const retry = await processLead('quote', validQuote, ip, deps);
    expect(retry.status).toBe(200);
    expect(deps.send).toHaveBeenCalledTimes(2);
  });

  it('handles a provider exception and allows recovery with the original submission', async () => {
    const {deps, records} = fixtures();
    vi.mocked(deps.send).mockRejectedValueOnce(new Error('Temporary provider outage')).mockResolvedValueOnce(true);
    const failed = await processLead('quote', validQuote, ip, deps);
    expect(failed).toMatchObject({status: 503, body: {ok: false, code: 'unavailable'}});
    expect(failed.body).not.toHaveProperty('reference');
    expect(records.size).toBe(0);
    expect((await processLead('quote', validQuote, ip, deps)).status).toBe(200);
  });

  it('preserves the emailed reference when Redis fails after mail acceptance and the client retries', async () => {
    const {deps, store, records} = fixtures();
    const delivered = new Map<string, {subject: string; text: string}>();
    vi.mocked(deps.send).mockImplementation(async (message, key) => {
      // The provider accepts a repeat idempotency key without sending a second email.
      if (!delivered.has(key)) delivered.set(key, message);
      return true;
    });
    const normalSet = store.set;
    let failPersistence = true;
    store.set = vi.fn(async (key, value, options) => {
      if ((value as {status: string}).status === 'sent' && failPersistence) {
        failPersistence = false;
        throw new Error('Redis unavailable after email acceptance');
      }
      return normalSet(key, value, options);
    });
    const failed = await processLead('quote', validQuote, ip, deps);
    expect(failed).toMatchObject({status: 503, body: {ok: false}});
    expect(failed.body).not.toHaveProperty('reference');
    expect(delivered.size).toBe(1);
    expect(records.size).toBe(0);

    const retry = await processLead('quote', validQuote, ip, deps);
    expect(retry.status).toBe(200);
    expect(retry.body.reference).toBeTruthy();
    const originalEmail = [...delivered.values()][0];
    expect(originalEmail.subject).toContain(retry.body.reference);
    expect(originalEmail.text).toContain(`Reference: ${retry.body.reference}`);
    expect(delivered.size).toBe(1);
    expect(deps.send).toHaveBeenCalledTimes(2);
    expect(await processLead('quote', validQuote, ip, deps)).toEqual(retry);
    expect(deps.send).toHaveBeenCalledTimes(2);
  });
});

describe('public lead endpoint safeguards', () => {
  const request = (body: unknown, headers: Record<string, string> = {}) => new Request('https://example.test/api/quote', {
    method: 'POST',
    headers: {'content-type': 'application/json', ...headers},
    body: JSON.stringify(body),
  });

  it('fails closed when delivery services are not configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const response = await handleLead(request(validQuote), 'quote');
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ok: false, code: 'unavailable'});
  });

  it('rejects a cross-origin browser submission', async () => {
    const response = await handleLead(request(validQuote, {origin: 'https://untrusted.example'}), 'quote');
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ok: false, code: 'origin'});
  });

  it.each([
    ['http://localhost:3010', 400, 'validation'],
    ['https://foreign.example', 403, 'origin'],
  ])('validates Origin %s against the public Host behind an internal server address', async (origin, status, code) => {
    const response = await handleLead(new Request('http://0.0.0.0:3010/api/quote', {
      method: 'POST',
      headers: {'content-type': 'application/json', host: 'localhost:3010', 'x-forwarded-proto': 'http', origin},
      body: '{}',
    }), 'quote');
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject({ok: false, code});
  });

  it('rejects oversized content regardless of content-length', async () => {
    const response = await handleLead(request({...validQuote, message: 'x'.repeat(17000)}), 'quote');
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ok: false, code: 'size'});
  });

  it('rejects malformed JSON with a controlled response', async () => {
    const response = await handleLead(new Request('https://example.test/api/quote', {
      method: 'POST', headers: {'content-type': 'application/json'}, body: '{broken',
    }), 'quote');
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ok: false, code: 'invalid'});
  });

  it('provides field-specific errors for an incomplete no-JavaScript form post', async () => {
    const response = await handleLead(new Request('https://example.test/api/quote', {
      method: 'POST',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({name: validQuote.name, email: validQuote.email, locale: 'fr', privacy: 'on'}).toString(),
    }), 'quote');
    const result = await response.json();
    expect(response.status).toBe(400);
    expect(result).toMatchObject({ok: false, code: 'validation'});
    expect(result.fieldErrors).toHaveProperty('vehicleType');
    expect(result.fieldErrors).toHaveProperty('destinationCountry');
  });
});
