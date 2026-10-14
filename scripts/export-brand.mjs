import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {create as createFont} from 'fontkit';
// Outlined exports need no installed system fonts or remote font requests.
const manrope=createFont(await readFile('node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff2'));
const mono=createFont(await readFile('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'));
function lettering(text,font,size,x,y,color,spacing=0){const run=font.layout(text),scale=size/font.unitsPerEm;let cursor=x;return '<g fill="'+color+'">'+run.glyphs.map((glyph,index)=>{const position=run.positions[index];const path='<path transform="translate('+(cursor+position.xOffset*scale)+' '+(y-position.yOffset*scale)+') scale('+scale+' '+(-scale)+')" d="'+glyph.path.toSVG()+'"/>';cursor+=position.xAdvance*scale+spacing;return path;}).join('')+'</g>';}
await mkdir('public/brand',{recursive:true});
const mark=(color='#0b1f1a',bg='none')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="${bg}"/><path d="M42 14a23 23 0 1 0 0 36" fill="none" stroke="${color}" stroke-width="5"/><path d="M39 20v25" stroke="${color}" stroke-width="5"/><circle cx="51" cy="14" r="4" fill="#c86b32"/></svg>`;
const logo=color=>`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="80" viewBox="0 0 420 80" role="img" aria-label="Cana Impex — Vehicle exports"><g transform="translate(4,8)">${mark(color).replace(/<svg[^>]*>|<\/svg>/g,'')}</g>${lettering('CANA IMPEX',manrope,30,88,43,color,2)}${lettering('VEHICLE EXPORTS',mono,9,90,64,color,3)}</svg>`;
await writeFile('public/brand/logo-primary.svg',logo('#0b1f1a'));await writeFile('public/brand/logo-reverse.svg',logo('#f5f0e6'));await writeFile('public/brand/mark.svg',mark());await writeFile('public/brand/favicon.svg',mark('#f5f0e6','#0b1f1a'));
for(const size of [32,180,512])await sharp(Buffer.from(mark('#f5f0e6','#0b1f1a'))).resize(size,size).png().toFile(`public/brand/${size===180?'apple-touch-icon':`favicon-${size}`}.png`);
for(const size of [420,840,1680])await sharp(Buffer.from(logo('#0b1f1a'))).resize(size).png().toFile(`public/brand/logo-${size}.png`);
await sharp('assets-source/car-hero.png').resize(1400).webp({quality:82}).toFile('public/images/car-hero.webp');
await sharp('assets-source/car-hero.png').resize(850).webp({quality:80}).toFile('public/posters/car-mobile.webp');
const social=`<svg width="1200" height="630"><rect width="600" height="630" fill="#0b1f1a" fill-opacity=".9"/>${lettering('CANA IMPEX',manrope,23,60,95,'#f5f0e6',3)}${lettering('Your next car.',manrope,58,60,300,'#f5f0e6')}${lettering('Beyond borders.',manrope,56,60,375,'#c3ba9d')}${lettering('VEHICLE SOURCING & EXPORTS',mono,12,60,550,'#f5f0e6',1)}</svg>`;
await sharp('public/images/car-hero.webp').resize(1200,630,{fit:'cover'}).composite([{input:Buffer.from(social)}]).jpeg({quality:85}).toFile('public/brand/social-default.jpg');
console.log('Exported original CI identity and optimized automotive artwork.');
