# Verification record — 2026-10-14

Independent QA was performed separately from the builder against the built production application. The launch is automotive; all 38 public EN/FR routes are checked for vehicle content and the absence of obsolete commodity content.

| Check | Result |
| --- | --- |
| Strict TypeScript, ESLint, production build on Node 24 | Passed |
| Backend unit/integration boundary tests | 29 passed |
| Complete server-mode browser suite | 69 passed; provider acceptance is mocked in explicitly named tests |
| Latest complete email-draft browser run | 74 passed, 5 intentionally skipped server-only provider-response cases |
| Independent focused draft rerun | 10 passed, including Unicode mail-link limits and visible recipient |
| CMS published vs protected draft rendering | Passed with a temporary draft; cleaned up afterward |
| Invalid draft secret | 401; no draft cookie |
| Signed content revalidation | 200; unsigned request401 |
| EN/FR privacy content after cache refresh | Correct email-draft data flow verified independently |

Browser coverage includes category-to-quote selection, same-page language switching, required-field feedback, duplicate/concurrent requests, rate limits, provider failures, retained form entries, consent grant/revoke, no form PII in events, responsive layouts at 360/390/768/1024/1440 px, keyboard-accessible navigation, French text expansion, no-JavaScript readable navigation and direct email access, reduced motion and forced WebGL failure.

Axe checks cover homepage, French homepage, quote, French contact, the mobile menu and all four prepared-draft states. Prepared drafts are focused and scrolled into view, show that the inquiry is unsent, expose the destination address, support copy, invalidate after edits and never call the delivery API or emit `generate_lead`.

## Performance evidence

Measured from a local optimized build with `node scripts/measure-bundles.mjs`, using Chrome, no analytics container, no legacy nomodule polyfill and no preloaded 3D:

| Resource | Bytes | Budget assessment |
| --- | ---: | --- |
| Initial modern JavaScript, gzip | 191,093 (186.6 KiB) | Slightly above the approximate180 KB target; recorded variance, not represented as a strict pass |
| Additional user-activated 3D JavaScript, gzip | 287,288 (280.6 KiB) | Below1.8 MB |
| Mobile hero poster, original WebP | 28,110 | Below180 KB |
| Desktop artwork WebP | 67,704 | Optimized source; actual served image may be resized further |

The live model is procedural with no model/texture downloads, demand rendering and capped device pixel ratio. It is removed when outside the viewport. 3D requires explicit desktop activation; mobile/reduced-motion paths remain static.

## Limits

No owned sending domain or Resend credentials are available. **Automatic email delivery and actual mailbox receipt have not been verified.** Production uses explicit email drafts instead. The tested server-mode backend is ready for later service configuration and receipt testing; mocked acceptance does not establish delivery.

Chrome headless/viewport emulation is covered. Dedicated physical iPhone/Safari and screen-reader user testing are not complete. Automated accessibility checks are useful but not a full accessibility certification. Real-user LCP, INP and CLS require production traffic; no field-performance claim is made. Residual dependency-audit findings are described in `SECURITY.md`.
