# Content scope and verification

The user's automotive correction supersedes the commodity assumptions in the research report and earlier plan. This release is exclusively about **vehicle sourcing and car exports**. No old website source or media was consulted. Old filenames were used only for redirects.

Confirmed inputs: the Cana Impex brand, automotive export business, English/French scope, repository and Vercel destination, and temporary receiving mailbox `ricardo.ll@protonmail.ch`.

Not confirmed and therefore omitted: legal registered company name, public phone/WhatsApp, address, company registration numbers, years of experience, source countries, export markets, facilities, partners, certificates, fleet capacity, actual inventory, prices, delivery guarantees and client testimonials. The recipient is used for requested inquiries; it is not automatically advertised as the company's permanent public contact identity.

## Public routes

Both locales contain Home, About, Vehicles, SUV, Sedan, Pickup, Van, Services, Vehicle Sourcing, Export & Shipping, How It Works, Quote, Contact, Insights and three guides, Privacy and Terms. Equivalent route slugs are kept stable between locales. Vehicle CTAs preserve category selection through the language switch.

Insights cover preparing a vehicle request, reviewing vehicle condition/inspection and preparing an export file. They are general buyer education, not promises that Cana Impex holds a specific authorization, handles every legal obligation or serves every destination. Buyers must confirm eligibility, documentation and responsibility for their particular transaction with appropriate local professionals. No country-specific legal advice is presented.

## Sanity workflow

- `homePage`: headline, accent and introduction.
- `vehicleCategory`: category title and introduction, linked by slug.
- `page`: About, service pages, guides, Privacy and Terms, with structured sections and optional SEO description.
- `siteSettings`: optional approved legal name and public contact email. Other preparatory settings do not imply that a market is publicly served.
- `vehicleListing`: structured actual stock fields and mandatory approval. Prepared for future inventory functionality; not rendered as public stock in this release.
- `proofItem`: approved claim registry with review/expiry dates. No unsupported proof items seeded or displayed.
- `publicDocument`: only approved, non-expired public files are exposed on How It Works.

Use shared `translationKey` values to link EN/FR documents. Schema validation requires the language, review date and mandatory content fields, and blocks unapproved stock/proof/documents from ordinary Studio publishing. API writers can bypass Studio validation, so limit write-token access and review imported documents.

The dataset stores website copy and approved public assets, not inquiry records, identity papers, titles, financial records or private operational evidence. Do not upload confidential evidence: a file asset may be publicly addressable even before a document is linked. Keep evidence in private storage outside this repository and public asset storage.

Review all company claims against authentic approved evidence before adding them. Update both translations and review dates together. Only publish real vehicle listings with confirmed availability and photography rights when the inventory extension is implemented.
