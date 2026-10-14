# Deployment and rollback

## Current release configuration

Repository: `ricardoll123456-hash/CANAIMPEX`. Rebuild branch: `codex/cana-impex-rebuild`. Existing Vercel project: `canaimpex`. Production URL: `https://canaimpex.vercel.app`.

Vercel uses Next.js at the repository root, Node.js 24.x, `npm ci` and `npm run build`, with default Next.js output. Development, preview and production use the same Node major version. Previews remain protected by Vercel Authentication and carry noindex metadata.

Free Sanity and Upstash resources are attached to the existing Vercel project. Upstash automatic paid upgrade is disabled. Do not commit `.vercel`, environment downloads, account auth files or tokens.

## Environment

See `.env.example` for names. Sanity's Vercel integration supplies its project, dataset and scoped read/write tokens. The write token is used only for setup/seed commands; public rendering uses published content and authenticated draft rendering uses the read token server-side. Sanity Studio authenticates the editor through the account.

`INQUIRY_DELIVERY_MODE=email` is the launch setting. It creates a browser-side mail draft; visitors must send it from their own mail client. Large requests use the copy/paste path to avoid URL truncation. JavaScript-disabled visitors receive a direct email link. No delivered-lead reference or `generate_lead` event is produced for a draft. The direct POST APIs refuse delivery in this mode.

To activate automatic delivery later:

1. Obtain an owned domain and verify it with Resend, including required DNS records.
2. Set `RESEND_API_KEY`, verified `QUOTE_FROM_EMAIL`, `QUOTE_TO_EMAIL` and a random `RATE_LIMIT_SALT` in every intended Vercel environment.
3. Keep Upstash REST variables configured. The Vercel integration's `KV_REST_API_URL` and `KV_REST_API_TOKEN` aliases are supported.
4. Set `INQUIRY_DELIVERY_MODE=server`, rebuild and deploy a protected preview.
5. Test actual delivery and receipt in the approved mailbox, in both languages. Verify rate limits, retries and no duplicate emails. Only then promote.

Server mode keeps hashed abuse/idempotency keys in Redis, not the form payload. It accepts a submission only after Resend returns an accepted email ID. It uses stable retry references and provider idempotency. There is no lead database or CRM.

## CMS

Studio: `/studio`. CORS must allow credentials for localhost development, production and the project's Vercel preview origins. Never allow a blanket `*` credentialed origin. The Presentation tool uses the same origin and official Sanity preview-secret verification; unsigned requests cannot enable drafts.

Create a Sanity document webhook named `Cana Impex content revalidation` with POST destination `https://canaimpex.vercel.app/api/revalidate`, the production dataset, create/update/delete triggers, no drafts or versions, a projection containing only `_id` and `_type`, and a secret matching `SANITY_REVALIDATE_SECRET`. Limit its filter to public website content types. See [Sanity's webhook reference](https://www.sanity.io/docs/http-reference/webhooks). The signed route invalidates the `cms` cache; ordinary content also refreshes after one hour.

GTM is optional. Leave `NEXT_PUBLIC_GTM_ID` empty until there is a real container. Only consented sessions load the container. Do not configure automatic form-field capture, DOM scraping or user-provided-data collection. The event helper permits only non-PII fields. `generate_lead` is reserved for provider-accepted server delivery.

## Git rollout

The remote `main` base was `3fdd36a0dc4e2341a25174e1270260929158b9e7`. Its source was not checked out or inspected. The rebuild deletes the former tracked website tree and adds the new app. History is preserved through an ordinary commit/merge; no force push.

Rollback tag: `rollback/pre-rebuild-2026-10-14` points to that base. The previous production deployment is `dpl_AVnK6LvvMMDhQsotRAYZTpChDoMS` (`canaimpex-yfyub0s4s-ricardoll123456-3962s-projects.vercel.app`). Before rollback, restore the previous Vercel deployment via Vercel's rollback UI/CLI so production can return immediately without rebuilding the old static site under Next.js settings. Keep the current project settings recorded, then restore previous framework/build settings if rebuilding an old release. A Git rollback should use a new revert commit rather than rewriting `main`:

```sh
git revert <rebuild-commit>
git push origin main
```

If a merge commit is used, revert with `git revert -m 1 <merge-commit>` instead. The tag is an audit/recovery reference, not an instruction to hard-reset and force-push. Sanity content is separate from Git history; export a dataset backup before large content changes.

## Operations

Run the GitHub Actions quality workflow before merging. Inspect the Vercel deployment, public URLs, EN/FR routes, legacy redirects, CMS login, signed revalidation, consent and inquiry mode after launch. Track field LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 once real traffic exists; laboratory checks do not establish these field metrics.
