# Security and maintenance notes

Secrets are ignored by Git and stored in Vercel or local `.env.local`. Browser code never receives Sanity read/write tokens, Resend keys, Redis tokens, rate-limit salt or webhook secret. Private company evidence and inquiries are not placed in the public repository or public Sanity assets.

Lead APIs enforce shared schema validation, payload limits and same-origin checking. Server mode adds a honeypot, shared rate limits, concurrency locks and provider idempotency. Routine application logs do not contain inquiry payloads. The production email-draft mode does not submit form entries to these APIs. Email clients and providers process content only when the visitor chooses to open/send or copy it.

Responses include CSP, HSTS, nosniff, referrer and permissions policies. The current Next.js rendering requires inline scripts/styles; CSP therefore permits `unsafe-inline`, but not `unsafe-eval`. Studio has an authenticated editor, and published pages query the published perspective. Draft preview requires an official Sanity preview secret. Public-document uploads require approval; keep sensitive evidence out of public asset storage altogether.

At verification on 2026-10-14, `npm audit` reported **20 dependency findings: 11 high, 9 moderate, 0 critical**. These include transitive Sanity CLI/build tooling, globbing/config parsers, UUID tooling and ESLint dependencies. Current direct versions and compatible `npm audit fix` were evaluated; forced major-version replacement was not applied because it broke or worsened the supported dependency graph. The public form validation/mail/Redis path does not depend on the affected CLI globbing commands. This is not a claim that all findings are harmless: track upstream fixes, keep Studio limited to authorized editors and rerun the audit before future releases.

Update dependencies through a review branch, retain the lockfile and rerun the full build, CMS preview and browser suite. Do not apply `npm audit fix --force` to production without compatibility review. No service credentials are recorded in QA artifacts.
