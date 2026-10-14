import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// These browser tests use a mocked provider response only where explicitly stated.
// They do not verify Resend delivery or receipt in the commercial mailbox.
const publishedRoutes = [
  '', 'vehicles', 'vehicles/suv', 'vehicles/sedan', 'vehicles/pickup', 'vehicles/van',
  'services', 'services/vehicle-sourcing', 'services/export-shipping', 'how-it-works',
  'about', 'contact', 'quote', 'insights', 'insights/vehicle-request',
  'insights/vehicle-inspection', 'insights/export-preparation', 'privacy', 'terms',
];
const locales = ['en', 'fr'] as const;
// Email launch mode keeps shared page, navigation, validation, accessibility, and 3D coverage.
// Only provider-response journeys are skipped; email-draft.spec.ts covers their replacement.
// The environment flag must match the mode of the running server.
const emailDraftMode = process.env.INQUIRY_DELIVERY_MODE === 'email';
const urlFor = (locale: 'en' | 'fr', route = '') => `${locale === 'fr' ? '/fr' : ''}${route ? '/' + route : locale === 'fr' ? '' : '/'}`;

async function essentialOnly(page: Page) {
  await page.getByRole('button', {name: /^(Essential only|Essentiels uniquement)$/}).click();
  await expect(page.locator('.cookie-panel')).toHaveCount(0);
}

async function fillQuote(page: Page) {
  await page.locator('#vehicleType').selectOption('suv');
  await page.locator('#destinationCountry').fill('Ghana');
  await page.locator('#name').fill('Browser Test Buyer');
  await page.locator('#email').fill('browser-test@example.com');
  await page.locator('#phone').fill('+1 555 010 0420');
  await page.locator('#message').fill('A test-only request for a used SUV, not a real inquiry.');
  await page.locator('#privacy').check();
}

const dataLayer = (page: Page) => page.evaluate(() => (window as Window & {dataLayer?: Record<string, unknown>[]}).dataLayer ?? []);

test.describe('published bilingual pages', () => {
  for (const locale of locales) {
    for (const route of publishedRoutes) {
      test(`${locale} /${route || 'home'} has an H1, locale, canonical, and car-export content`, async ({page}) => {
        const path = urlFor(locale, route);
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('main h1')).toHaveCount(1);
        await expect(page.locator('main h1')).toBeVisible();
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        expect(canonical).toBeTruthy();
        expect(new URL(canonical!).pathname.replace(/\/$/, '')).toBe(path.replace(/\/$/, ''));
        await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
        await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
        await expect(page.locator('main')).not.toContainText(/\b(cashews?|cocoa|natural rubber|commodities|commodity)\b/i);
      });
    }
  }

  test('home language switch preserves the corresponding public route', async ({page}) => {
    await page.goto('/');
    await essentialOnly(page);
    await expect(page.locator('h1')).toContainText('Your next car.');
    await page.getByRole('link', {name: 'Lire en français'}).click();
    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('h1')).toContainText('Votre prochain véhicule.');
    await page.getByRole('link', {name: 'Read in English'}).click();
    await expect(page).toHaveURL(/:\d+\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('legacy vehicle redirects, sitemap, robots, and a real 404 work', async ({request}) => {
    const redirect = await request.get('/Products.html', {maxRedirects: 0});
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toMatch(/\/vehicles$/);
    const frenchRedirect = await request.get('/fr/produits.html', {maxRedirects: 0});
    expect(frenchRedirect.status()).toBe(308);
    expect(frenchRedirect.headers().location).toMatch(/\/fr\/vehicles$/);
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain('/fr/vehicles/suv');
    expect((await request.get('/robots.txt')).status()).toBe(200);
    expect((await request.get('/definitely-missing-page')).status()).toBe(404);
  });
});

test.describe('vehicle quote journeys', () => {
  test('a real same-origin browser POST reaches validation through the public hostname', async ({page}) => {
    // Incomplete payload guarantees no email is sent, even when production services are configured.
    await page.goto('/quote');
    const result = await page.evaluate(async () => {
      const response = await fetch('/api/quote', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}'});
      return {status: response.status, body: await response.json()};
    });
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ok: false, code: 'validation'});
  });

  for (const locale of locales) {
    test(`${locale} vehicle CTA prefills quote and preserves the selection across languages`, async ({page}) => {
      await page.goto(urlFor(locale, 'vehicles/pickup'));
      await essentialOnly(page);
      await page.getByRole('link', {name: locale === 'fr' ? 'Demander ce type de véhicule' : 'Request this vehicle type'}).click();
      await expect(page).toHaveURL(/\/quote\?vehicle=pickup$/);
      await expect(page.locator('#vehicleType')).toHaveValue('pickup');
      await page.getByRole('link', {name: locale === 'fr' ? 'Read in English' : 'Lire en français'}).click();
      await expect(page).toHaveURL(/\/quote\?vehicle=pickup$/);
      await expect(page.locator('html')).toHaveAttribute('lang', locale === 'fr' ? 'en' : 'fr');
      await expect(page.locator('#vehicleType')).toHaveValue('pickup');
    });

    test(`${locale} missing required details show linked errors and focus the summary`, async ({page}) => {
      let requests = 0;
      await page.route('**/api/quote', route => { requests++; return route.abort(); });
      await page.goto(urlFor(locale, 'quote'));
      await essentialOnly(page);
      await page.getByRole('button', {name: emailDraftMode ? (locale === 'fr' ? 'Préparer l’e-mail' : 'Prepare email request') : (locale === 'fr' ? 'Envoyer la demande' : 'Send request')}).click();
      const alert = page.locator('main').getByRole('alert');
      await expect(alert).toContainText(locale === 'fr' ? 'Veuillez vérifier' : 'Please check');
      await expect(alert).toBeFocused();
      for (const key of ['vehicleType', 'destinationCountry', 'name', 'email', 'privacy']) {
        await expect(page.locator('#' + key)).toHaveAttribute('aria-invalid', 'true');
        await expect(alert.locator(`a[href="#${key}"]`)).toHaveCount(1);
      }
      expect(requests).toBe(0);
    });

    test(`${locale} mocked acceptance shows the server reference`, async ({page}) => {
      test.skip(emailDraftMode, 'Server-delivery response behavior is covered when INQUIRY_DELIVERY_MODE is not email.');
      let posted: Record<string, unknown> | undefined;
      await page.route('**/api/quote', async route => {
        posted = route.request().postDataJSON();
        await route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({ok: true, reference: 'CI-E2E123ABCD'})});
      });
      await page.goto(urlFor(locale, 'quote'));
      await essentialOnly(page);
      await fillQuote(page);
      await page.getByRole('button', {name: locale === 'fr' ? 'Envoyer la demande' : 'Send request'}).click();
      await expect(page.getByRole('status')).toContainText('CI-E2E123ABCD');
      expect(posted).toMatchObject({locale, vehicleType: 'suv', destinationCountry: 'Ghana', privacy: true});
      expect(posted?.submissionId).toMatch(/^[a-f0-9-]{36}$/);
    });

    test(`${locale} service failure keeps all entries and allows a retry`, async ({page}) => {
      test.skip(emailDraftMode, 'Email launch mode prepares a local draft and does not call the delivery API.');
      await page.route('**/api/quote', route => route.fulfill({status: 503, contentType: 'application/json', body: JSON.stringify({ok: false, code: 'unavailable'})}));
      await page.goto(urlFor(locale, 'quote'));
      await essentialOnly(page);
      await fillQuote(page);
      await page.locator('#budget').fill('25000');
      await page.getByRole('button', {name: locale === 'fr' ? 'Envoyer la demande' : 'Send request'}).click();
      await expect(page.locator('main').getByRole('alert')).toContainText(locale === 'fr' ? 'temporairement indisponible' : 'temporarily unavailable');
      await expect(page.locator('#name')).toHaveValue('Browser Test Buyer');
      await expect(page.locator('#email')).toHaveValue('browser-test@example.com');
      await expect(page.locator('#budget')).toHaveValue('25000');
      await expect(page.locator('#vehicleType')).toHaveValue('suv');
      await expect(page.locator('#privacy')).toBeChecked();
      await expect(page.getByRole('button', {name: locale === 'fr' ? 'Envoyer la demande' : 'Send request'})).toBeEnabled();
      await expect(page.locator('.reference')).toHaveCount(0);
    });
  }
});

test('cookie grant/revoke controls lead analytics and excludes form PII', async ({page}) => {
  test.skip(emailDraftMode, 'Provider-accepted generate_lead is server-mode only; email-draft.spec.ts asserts its absence in email mode.');
  const optionalRequests: string[] = [];
  page.on('request', req => { if (/google-analytics\.com|googletagmanager\.com/.test(req.url())) optionalRequests.push(req.url()); });
  await page.route('**/api/quote', route => route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({ok: true, reference: 'CI-ANALYTICS'})}));
  await page.goto('/quote');
  await page.locator('#name').focus();
  expect(optionalRequests).toEqual([]);
  expect(await dataLayer(page)).toEqual([]);
  await page.getByRole('button', {name: 'Accept analytics', exact: true}).click();
  expect(await page.evaluate(() => localStorage.getItem('cana-consent'))).toBe('accepted');
  await fillQuote(page);
  await page.getByRole('button', {name: 'Send request', exact: true}).click();
  await expect(page.getByRole('status')).toContainText('CI-ANALYTICS');
  const events = await dataLayer(page);
  expect(events).toContainEqual({event: 'generate_lead', locale: 'en', form_type: 'quote', product: 'suv'});
  const serialized = JSON.stringify(events);
  for (const pii of ['Browser Test Buyer', 'browser-test@example.com', '+1 555 010 0420', 'A test-only request', 'Ghana']) expect(serialized).not.toContain(pii);
  await page.getByRole('button', {name: 'Cookie preferences', exact: true}).click();
  await page.getByRole('button', {name: 'Essential only', exact: true}).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cana-consent'))).toBe('rejected');
  await page.goto('/quote');
  await fillQuote(page);
  await page.getByRole('button', {name: 'Send request', exact: true}).click();
  await expect(page.getByRole('status')).toContainText('CI-ANALYTICS');
  expect(await dataLayer(page)).toEqual([]);
});

test('French mobile content and navigation remain usable without JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({baseURL, javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  try {
    const page = await context.newPage();
    expect((await page.goto('/fr'))?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Votre prochain véhicule.');
    await expect(page.locator('.noscript-nav')).toBeVisible();
    await page.locator('.noscript-nav').getByRole('link', {name: 'Véhicules', exact: true}).click();
    await expect(page).toHaveURL(/\/fr\/vehicles$/);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.vehicle-card')).toHaveCount(4);
    await expect(page.locator('.cookie-panel')).toBeHidden();
  } finally { await context.close(); }
});

test.describe('responsive visual layouts', () => {
  for (const locale of locales) {
    for (const width of [360, 390, 768, 1024, 1440]) {
      test(`${locale} home and quote fit a ${width}px viewport`, async ({page}, testInfo) => {
        await page.setViewportSize({width, height: 960});
        await page.addInitScript(() => localStorage.setItem('cana-consent', 'rejected'));
        for (const route of ['', 'quote']) {
          await page.goto(urlFor(locale, route));
          await expect(page.locator('main h1')).toBeVisible();
          const dimensions = await page.evaluate(() => ({viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth}));
          expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
          expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);
          await page.screenshot({path: testInfo.outputPath(`${locale}-${route || 'home'}-${width}.png`), fullPage: true});
        }
      });
    }
  }
});

test('reduced-motion visitors receive a static hero without an inactive 3D control', async ({browser, baseURL}) => {
  const context = await browser.newContext({baseURL, reducedMotion: 'reduce', viewport: {width: 1440, height: 960}});
  try {
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('cana-consent', 'rejected'));
    await page.goto('/');
    await expect(page.locator('.scene-poster')).toBeVisible();
    await expect(page.locator('.scene-poster')).toHaveCSS('opacity', '1');
    await expect(page.locator('.scene-canvas canvas')).toHaveCount(0);
    await expect(page.locator('.scene-toggle')).toBeHidden();
    await expect(page.locator('main h1')).toBeVisible();
  } finally { await context.close(); }
});

test('desktop visitors can enter a live 3D scene and return to the photo', async ({page}, testInfo) => {
  await page.setViewportSize({width: 1440, height: 960});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.addInitScript(() => localStorage.setItem('cana-consent', 'rejected'));
  await page.goto('/');
  await page.getByRole('button', {name: /Explore in 3D/}).click();
  await expect(page.locator('.hero-visual')).toHaveClass(/scene-ready/, {timeout: 15000});
  await expect(page.locator('.scene-canvas canvas')).toBeVisible();
  await expect(page.locator('.scene-poster')).toHaveCSS('opacity', '0');
  await page.screenshot({path: testInfo.outputPath('desktop-live-3d.png')});
  await page.getByRole('button', {name: /Photo view/}).click();
  await expect(page.locator('.scene-poster')).toHaveCSS('opacity', '1');
  await expect(page.locator('.scene-canvas canvas')).toHaveCount(0);
});

test('WebGL initialization failure keeps the poster and quote action available', async ({browser, baseURL}) => {
  const context = await browser.newContext({baseURL, viewport: {width: 1440, height: 960}, reducedMotion: 'no-preference'});
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('cana-consent', 'rejected');
      const original = HTMLCanvasElement.prototype.getContext;
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {value: function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) {
          const state = window as Window & {webglAttempts?: number};
          state.webglAttempts = (state.webglAttempts ?? 0) + 1;
          return null;
        }
        return Reflect.apply(original, this, [type, ...args]);
      }});
    });
    await page.goto('/');
    await page.getByRole('button', {name: /Explore in 3D/}).click();
    await expect.poll(() => page.evaluate(() => (window as Window & {webglAttempts?: number}).webglAttempts ?? 0), {timeout: 15000}).toBeGreaterThan(0);
    await expect(page.locator('.scene-poster')).toHaveCSS('opacity', '1');
    await expect(page.locator('.hero-actions').getByRole('link', {name: 'Request a quote'})).toBeVisible();
    await expect(page.locator('.hero-visual')).not.toHaveClass(/scene-ready/);
  } finally { await context.close(); }
});

test.describe('accessibility', () => {
  for (const path of ['/', '/fr', '/quote', '/fr/contact']) {
    test(`${path} meets automated WCAG A/AA checks`, async ({page}, testInfo) => {
      await page.goto(path);
      await essentialOnly(page);
      const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      await testInfo.attach('axe-results', {body: JSON.stringify(result.violations, null, 2), contentType: 'application/json'});
      expect(result.violations.map(({id, nodes}) => ({id, nodes: nodes.map(({target, failureSummary}) => ({target, failureSummary}))}))).toEqual([]);
    });
  }

  test('mobile navigation dialog is named and keyboard accessible', async ({page}, testInfo) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto('/');
    await essentialOnly(page);
    await page.getByRole('button', {name: 'Open navigation'}).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/navigation/i);
    const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('axe-dialog-results', {body: JSON.stringify(result.violations, null, 2), contentType: 'application/json'});
    expect(result.violations.map(({id, nodes}) => ({id, nodes: nodes.map(({target, failureSummary}) => ({target, failureSummary}))}))).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', {name: 'Open navigation'})).toBeFocused();
  });
});
