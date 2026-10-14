import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildEmailDraft} from '../../lib/email-draft';

// Run against a server started with INQUIRY_DELIVERY_MODE=email:
// INQUIRY_DELIVERY_MODE=email npx playwright test
// This suite is skipped for server delivery mode. It never opens a mail application or sends email.
// website.spec.ts retains shared site coverage and skips only its five provider-response tests.
const emailDraftMode = process.env.INQUIRY_DELIVERY_MODE === 'email';
const locales = ['en', 'fr'] as const;
const kinds = ['quote', 'contact'] as const;
type Locale = typeof locales[number];
type Kind = typeof kinds[number];
const routeFor = (locale: Locale, kind: Kind) => `${locale === 'fr' ? '/fr' : ''}/${kind}`;
const prepare = (locale: Locale) => locale === 'fr' ? 'Préparer l’e-mail' : 'Prepare email request';
const copyLabel = (locale: Locale) => locale === 'fr' ? 'Copier la demande' : 'Copy request';

async function fillInquiry(page: Page, locale: Locale, kind: Kind, message?: string) {
  await page.locator('#name').fill('Draft Test Buyer');
  await page.locator('#email').fill('draft-test@example.com');
  await page.locator('#message').fill(message ?? (locale === 'fr' ? 'Je souhaite un véhicule à exporter au Sénégal.' : 'Please source a vehicle for export to Senegal.'));
  if (kind === 'quote') {
    await page.locator('#vehicleType').selectOption('suv');
    await page.locator('#makeModel').fill('Toyota 4Runner');
    await page.locator('#quantity').fill('2');
    await page.locator('#budget').fill('35000');
    await page.locator('#currency').selectOption('USD');
    await page.locator('#destinationCountry').fill('Senegal');
  }
  await page.locator('#privacy').check();
}

test.describe('explicit email-draft launch mode', () => {
  test.skip(!emailDraftMode, 'Requires INQUIRY_DELIVERY_MODE=email in both the test process and running website.');

  for (const locale of locales) {
    for (const kind of kinds) {
      test(`${locale} ${kind} validates, prepares an unsent draft, copies, and invalidates edited content`, async ({page}, testInfo) => {
        if (locale === 'fr') await page.setViewportSize({width: kind === 'quote' ? 360 : 390, height: 960});
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.addInitScript(() => localStorage.setItem('cana-consent', 'accepted'));
        let apiPosts = 0;
        await page.route(/\/api\/(quote|contact)(?:\?.*)?$/, route => {
          if (route.request().method() === 'POST') apiPosts++;
          return route.abort(); // Guard against accidental external delivery if the mode regresses.
        });
        await page.goto(routeFor(locale, kind));
        await expect(page.locator('.lead-form')).toHaveAttribute('data-delivery-mode', 'email');
        await expect(page.locator('.email-mode-note')).toContainText(locale === 'fr' ? 'prépare un e-mail' : 'prepares an email');
        await page.getByRole('button', {name: prepare(locale), exact: true}).click();
        await expect(page.locator('.form-status')).toContainText(locale === 'fr' ? 'Veuillez vérifier' : 'Please check');
        await expect(page.locator('.form-status')).toBeFocused();
        await expect(page.locator('.email-draft')).toHaveCount(0);

        await fillInquiry(page, locale, kind);
        await page.getByRole('button', {name: prepare(locale), exact: true}).click();
        const draft = page.locator('.email-draft');
        await expect(draft).toBeInViewport();
        await expect(draft).toBeFocused();
        await expect(draft).toContainText(locale === 'fr' ? 'n’a pas encore été envoyée' : 'has not been sent yet');
        const recipientLink = draft.locator('a[href^="mailto:"]');
        await expect(recipientLink).toBeVisible();
        const displayedRecipient = (await recipientLink.textContent())?.trim();
        expect(displayedRecipient).toContain('@');
        await expect(recipientLink).toHaveAttribute('href', 'mailto:' + displayedRecipient);
        const text = await page.locator('#draft-text').inputValue();
        expect(text).toContain('Draft Test Buyer');
        expect(text).toContain('draft-test@example.com');
        expect(text).toContain(locale === 'fr' ? 'véhicule à exporter' : 'vehicle for export');
        if (kind === 'quote') {
          expect(text).toContain('Toyota 4Runner');
          expect(text).toContain('suv');
          expect(text).toContain('35000');
          expect(text).toContain('USD');
        }
        const dimensions = await page.evaluate(() => ({viewport: innerWidth, content: document.documentElement.scrollWidth}));
        expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
        const accessibility = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(accessibility.violations.map(({id, nodes}) => ({id, targets: nodes.map(node => node.target)}))).toEqual([]);
        await draft.screenshot({path: testInfo.outputPath(`${locale}-${kind}-email-draft.png`)});
        expect(text).not.toContain('submissionId');
        expect(text).not.toContain('sourcePage');
        await expect(page.locator('.reference')).toHaveCount(0);

        await page.getByRole('button', {name: copyLabel(locale), exact: true}).click();
        await expect(page.getByRole('button', {name: locale === 'fr' ? 'Copié' : 'Copied', exact: true})).toBeVisible();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
        expect(apiPosts).toBe(0);
        const events = await page.evaluate(() => (window as Window & {dataLayer?: {event?: string}[]}).dataLayer ?? []);
        expect(events.some(event => event.event === 'generate_lead')).toBe(false);

        await page.locator('#name').fill('Updated Draft Buyer');
        await expect(draft).toHaveCount(0);
        await page.getByRole('button', {name: prepare(locale), exact: true}).click();
        await expect(page.locator('#draft-text')).toHaveValue(/Updated Draft Buyer/);
        await expect(page.getByRole('button', {name: copyLabel(locale), exact: true})).toBeVisible();
        expect(apiPosts).toBe(0);
      });
    }

    test(`${locale} long requests explicitly require manual copy and retain the complete text`, async ({page}) => {
      const kind = locale === 'en' ? 'quote' : 'contact';
      await page.addInitScript(() => localStorage.setItem('cana-consent', 'rejected'));
      await page.goto(routeFor(locale, kind));
      // French case stays below the old character-count cutoff but exceeds the encoded URI budget.
      const message = locale === 'fr' ? 'Un véhicule ' + 'é'.repeat(1200) : 'A detailed vehicle export request. '.repeat(60);
      await fillInquiry(page, locale, kind, message);
      await page.getByRole('button', {name: prepare(locale), exact: true}).click();
      await expect(page.locator('.email-draft')).toContainText(locale === 'fr' ? 'Votre demande est longue.' : 'Your request is long.');
      await expect(page.locator('.email-draft')).toContainText(locale === 'fr' ? 'collez-le dans votre e-mail' : 'paste it into your email');
      const text = await page.locator('#draft-text').inputValue();
      if (locale === 'fr') expect(text.length).toBeLessThan(1400);
      else expect(text.length).toBeGreaterThan(1400);
      expect(text).toContain(message.trim());
      // Check URL transport behavior without invoking an external mail application.
      const transport = buildEmailDraft({locale, message}, 'draft-test@example.com');
      const mailto = new URL(transport.uri);
      expect(mailto.protocol).toBe('mailto:');
      expect(mailto.searchParams.has('body')).toBe(false);
      expect(transport.requiresCopy).toBe(true);
      expect(transport.uri.length).toBeLessThanOrEqual(1800);
      expect(transport.text).toContain(message);
    });

    test(`${locale} no-JavaScript quote and contact pages offer a direct email link`, async ({browser, baseURL}) => {
      const context = await browser.newContext({baseURL, javaScriptEnabled: false, viewport: {width: 390, height: 844}});
      try {
        const page = await context.newPage();
        for (const kind of kinds) {
          await page.goto(routeFor(locale, kind));
          await expect(page.locator('main h1')).toBeVisible();
          const direct = page.locator('.email-mode-note').getByRole('link', {name: locale === 'fr' ? 'Contacter Cana Impex par e-mail' : 'Email Cana Impex directly'});
          await expect(direct).toBeVisible();
          await expect(direct).toHaveAttribute('href', /^mailto:[^?\s]+@[^?\s]+$/);
          await expect(page.locator('.lead-form button[type="submit"]')).toBeHidden();
          await expect(page.locator('.lead-form #name')).toBeHidden();
        }
      } finally { await context.close(); }
    });
  }

  test('Unicode mailto guard uses encoded URL length and preserves complete copy text', () => {
    for (const message of ['é'.repeat(1200), '🚗'.repeat(500)]) {
      const draft = buildEmailDraft({locale: 'fr', message}, 'draft-test@example.com');
      expect(draft.text.length).toBeLessThan(1400);
      expect(draft.requiresCopy).toBe(true);
      expect(draft.uri.length).toBeLessThanOrEqual(1800);
      expect(new URL(draft.uri).searchParams.has('body')).toBe(false);
      expect(draft.text).toContain(message);
    }
    const short = buildEmailDraft({locale: 'fr', message: 'Je cherche un VUS.'}, 'draft-test@example.com');
    expect(short.requiresCopy).toBe(false);
    expect(new URL(short.uri).searchParams.get('body')).toBe(short.text);
  });

  test('email mode rejects server delivery without claiming provider acceptance', async ({request}) => {
    const details = {locale: 'en', name: 'Draft Test Buyer', email: 'draft-test@example.com', privacy: true, message: 'A test-only inquiry, no email should be delivered.'};
    for (const kind of kinds) {
      const response = await request.post('/api/' + kind, {data: {...details, ...(kind === 'quote' ? {vehicleType: 'suv', quantity: 1, destinationCountry: 'Senegal'} : {})}});
      expect(response.status()).toBe(409);
      expect(await response.json()).toEqual({ok: false, code: 'email_required'});
    }
  });
});
