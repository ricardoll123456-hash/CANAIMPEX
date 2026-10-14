# Asset provenance and usage

All creative assets are new for the automotive rebuild. None came from the previous Cana Impex website.

| Asset group | Origin | Usage / rights record |
| --- | --- | --- |
| CI monogram and wordmark | Newly drawn SVG geometry and outlined Manrope/IBM Plex lettering; `scripts/export-brand.mjs` | Project-created identity. Fonts under SIL OFL; copies in `docs/licenses`. No claim of trademark clearance. |
| SUV hero and poster | OpenAI ImageGen output, generated 2026-10-14; original kept at `assets-source/car-hero.png` | AI-created illustrative concept provided for this project; no third-party stock-image license. No claim of authentic company stock, exclusive rights or trademark clearance. |
| Vehicle category illustrations | Original SVG drawings in `public/images` | Project-created unbranded category artwork, not stock listings. |
| Live vehicle scene | Original procedural Three.js geometry in `components/OriginScene.tsx` | No downloaded model, texture or external model license required. Three.js/R3F/GSAP remain third-party software dependencies. |
| Interface icons | Lucide React | ISC-licensed third-party icons; license notice included. |
| Fonts | Manrope and IBM Plex Mono via Fontsource | Self-hosted npm font files; SIL OFL notices included. |
| Social card | Composition of new SUV artwork and outlined brand lettering | Same provenance as artwork and fonts above. |

The generation brief requested a premium graphite/silver unbranded SUV in a dark forest studio, realistic materials, no logos, readable text, people, facilities or implied inventory. The mobile poster is 850 px wide; the source is retained so optimized variants can be regenerated. Visible website captions identify the concept as illustration. Authentic company people, facilities, evidence and inventory still require approved material.

## Reproducible file inventory

Bytes are uncompressed on-disk sizes. SHA-256 hashes identify the exact exported assets.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets-source/car-hero.png` | 1,913,542 | `287c8462f003ef7801e6d72d70685f22e6c562af904d03d0482a60c50e16a635` |
| `public/brand/apple-touch-icon.png` | 5,157 | `f20916eccd1fb0c25632aa9c9d1a148189068dc097ee5f3acfbad751d09ecf67` |
| `public/brand/favicon-32.png` | 831 | `0fdcd19fff0f6cc5da1fc8f82e3882d84b4d68ef7153a439f0ec5d544d18cc35` |
| `public/brand/favicon-512.png` | 19,974 | `0850d68949609a9c534441a3f9f71cc91ec39a4a4ca7f51dc961d387a14f19e6` |
| `public/brand/favicon.svg` | 301 | `7998c5492624c113f600604e14fb7e222e995041c1bf8a9d5e2d423cbef2a788` |
| `public/brand/logo-1680.png` | 23,824 | `73f94f371e87e0e9a5780f3e3b5b8d0779896b37fc015a57f9b7ce2b59d57d59` |
| `public/brand/logo-420.png` | 4,773 | `cb98ad2f4ee5db560e6a9d52138932dbc9927daca3268c9e42988c4638e840df` |
| `public/brand/logo-840.png` | 10,355 | `ac5f12ed949660b32b80faead5ed214d56caa9f9e2ab8e33a5a0b2c038ac9ae2` |
| `public/brand/logo-primary.svg` | 6,381 | `389e8acafd06bc2d9d40861c6a9fafddbd2324d3bd9463975ab74982cc232f52` |
| `public/brand/logo-reverse.svg` | 6,381 | `21c08bd7412356fc9b78a2b0239deff2df130033a4ffb155aa8f888555fa5f37` |
| `public/brand/mark.svg` | 298 | `347bcc7ab52ee20ebc60b59d8582b4fd4050e91b5d520513f4b4a60b1c17acec` |
| `public/brand/social-default.jpg` | 78,833 | `19447598cec943f1b6f1f84281be3861d04a160def63b6346187ad53a2db1488` |
| `public/images/car-hero.webp` | 67,704 | `1b59386d458043c99c4262a136d9925050f600501eeb0959e900a334e2a5cad3` |
| `public/images/pickup.svg` | 1,626 | `e4fb887854a3bf2d0c19db89b346e0bb0fe7d7ded9b9ce77736985f9e3337d28` |
| `public/images/sedan.svg` | 1,660 | `f8a5940ed41e5098a8388772b923f7f33285730ef9a655c543f9776455f86fde` |
| `public/images/suv.svg` | 1,676 | `f8e73abe17888cbaf51aa0c8f40dd34e0045f047833647554308a0708d179cf9` |
| `public/images/van.svg` | 1,633 | `904f99eefca5bcff504f8b0a272bf961f48397fe1a618a95c3c53ffeb713d9f7` |
| `public/posters/car-mobile.webp` | 28,110 | `add0ad9cb0282a9d1de4eec933ec43f674777545c7012fcce4ca5f4e102ef655` |
