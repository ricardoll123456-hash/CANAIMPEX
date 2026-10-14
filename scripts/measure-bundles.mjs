import {chromium} from '@playwright/test';
import {gzipSync} from 'node:zlib';
import {readFile,stat} from 'node:fs/promises';
// Run against a built local production server; sizes exclude the nomodule legacy polyfill.
const origin=process.env.MEASURE_ORIGIN||'http://localhost:3010';
const browser=await chromium.launch(process.env.CI?{}:{channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),requests=new Set();
 page.on('request',request=>{const url=new URL(request.url());if(url.origin===origin&&url.pathname.endsWith('.js'))requests.add(url.pathname);});
 await page.addInitScript(()=>localStorage.setItem('cana-consent','rejected'));
 await page.goto(origin,{waitUntil:'networkidle'});
 const initial=new Set(requests);
 await page.getByRole('button',{name:/Explore in 3D/}).click();
 await page.locator('canvas').waitFor();
 await page.waitForLoadState('networkidle');
 async function bytes(paths){let total=0;for(const path of paths){if(path.includes('polyfills'))continue;const file='.next/'+path.replace('/_next/','');total+=gzipSync(await readFile(file)).byteLength;}return total;}
 const enhancement=[...requests].filter(path=>!initial.has(path));
 const result={initialModernJsGzip:await bytes(initial),threeEnhancementJsGzip:await bytes(enhancement),mobilePoster:(await stat('public/posters/car-mobile.webp')).size,desktopHero:(await stat('public/images/car-hero.webp')).size};
 console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
