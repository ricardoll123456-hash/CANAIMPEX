# Origin Precision — automotive identity

The CI monogram combines an open circular C, vertical I and copper origin point. The wordmark is CANA IMPEX; the descriptor is VEHICLE EXPORTS. The identity is newly drawn for this automotive rebuild.

| Token | Value | Use |
| --- | --- | --- |
| Ink / deep forest | `#0b1f1a` | Navigation, hero, primary type |
| Green | `#0f6b4f` | Supporting green |
| Ivory | `#f5f0e6` | Main backgrounds and reversed type |
| Copper | `#c86b32` | Route and decorative accents |
| Graphite | `#1e2b27` | Secondary dark surfaces |
| Muted | `#526052` | Accessible secondary text on ivory |

Manrope Variable is the primary typeface; IBM Plex Mono 400 is used for labels, step numbers and technical details. Both are self-hosted via Fontsource under the SIL Open Font License; license copies accompany the project. Copper is mainly decorative; use the darker tested copper for small text.

## Exports

`public/brand` contains primary/reversed outlined SVG logos, the monogram, SVG favicon, 32/512 px favicon PNGs, a 180 px Apple touch icon, 420/840/1680 px PNG wordmarks and a 1200×630 social card. Rebuild them with `npm run brand:export`. Outlined wordmarks use the actual brand fonts and need no system font installation.

Keep at least the width of the monogram's copper point as clear space. Use the full logo at 210 px or wider; use the mark for small applications. Preserve proportions and colors. Reverse onto forest backgrounds. Avoid shadows, distortion, gradients inside the mark or placing it over busy vehicle details.

## Automotive visual direction

The homepage uses an original unbranded SUV concept image and a procedural live 3D car on a copper route. These are illustrative, with a visible caption; they are not a photographed company vehicle or current inventory. Category cards use newly drawn SVG silhouettes. Keep real listings separate from illustrative category artwork, and require authentic approved photos for company people, premises and stock.

Motion is optional and reversible. The desktop visitor explicitly activates 3D; mobile, reduced-motion and failed-WebGL paths keep the optimized poster. Headings, navigation, services and inquiry actions remain ordinary HTML.
