type AnalyticsEvent = 'view_product'|'quote_start'|'quote_product_select'|'generate_lead';
export function track(event:AnalyticsEvent,parameters: {product?:string;locale?:string;form_type?:string}={}) {
 try {if(localStorage.getItem('cana-consent')!=='accepted')return;}catch{return;}
 const target=window as Window & {dataLayer?:Record<string,unknown>[]};
 target.dataLayer=target.dataLayer||[]; target.dataLayer.push({event,...parameters});
}
