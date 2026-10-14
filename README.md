# Cana Impex — vehicle sourcing and exports

An original English/French automotive website built with Next.js App Router, strict TypeScript, React Three Fiber, GSAP and Sanity. English lives at `/`; French at `/fr`. The previous website's source and assets were not inspected or reused.

The first release uses **email-draft inquiries** because no owned sending domain is available. Visitors prepare, review and send an email themselves to `ricardo.ll@protonmail.ch`. Preparing a draft is never reported as a delivered lead. A Resend/Upstash direct-delivery implementation is included and tested, but is not activated in production.

## Run locally

Use Node.js 24 and npm (see `.nvmrc` and the committed lockfile):

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The site works with local content without Sanity credentials. Set `INQUIRY_DELIVERY_MODE=email` for the current launch experience. Server delivery requires every mail and Redis variable listed in `.env.example`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start -- --port 3010
INQUIRY_DELIVERY_MODE=email npm run test:e2e
```

Install Chromium with `npx playwright install chromium` in CI. Locally the test configuration uses installed Chrome; change the channel if needed. Server-delivery browser tests require a server built with `INQUIRY_DELIVERY_MODE=server` and the default test invocation. Those success responses are explicitly mocked; they do not establish mailbox receipt.

## Content editing

Open `/studio` and sign in with the existing Sanity/Vercel account. Home headlines, category descriptions, editorial pages, guides and approved public documents are connected to the frontend. Local fallbacks live in `lib/data.json` and `lib/pages.json`.

```sh
npm run cms:seed
```

Seeding uses `createIfNotExists` and preserves existing documents. A write token is needed only for this setup command; it is never sent to the browser. Publish both translations using the same `translationKey`, and keep review dates current. The Presentation tool enables authenticated draft preview. Published content revalidates through the signed `/api/revalidate` webhook, with a one-hour fallback refresh.

No actual vehicle stock is represented by the illustrations. The inventory schema is prepared for later verified listings; no public live inventory module or fabricated stock is included.

## Delivery and maintenance

- [Deployment, environment and rollback](docs/DEPLOYMENT.md)
- [Brand guidelines](docs/BRAND.md)
- [Asset provenance and rights](docs/ASSETS.md)
- [Content verification and CMS editing](docs/CONTENT.md)
- [QA evidence and limitations](docs/QA.md)
- [Selected skills and pinned revisions](docs/SKILLS.md)
- [Security notes](docs/SECURITY.md)

GitHub Actions runs lint, types, unit tests, a production build and browser journeys using Node.js 24. Keep secrets in Vercel/local ignored environment files; keep confidential operational evidence outside this public repository and Sanity public assets.
