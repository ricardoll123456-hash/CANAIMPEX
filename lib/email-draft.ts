import type {Locale} from './content';

const labels:Record<Locale,Record<string,string>>={
 en:{name:'Name',email:'Email',company:'Company',phone:'Phone',message:'Message',privacy:'Privacy acknowledged',marketingConsent:'Marketing consent',vehicleType:'Vehicle type',makeModel:'Make / model',yearRange:'Preferred years',condition:'Condition',quantity:'Quantity',budget:'Budget',currency:'Currency',destinationCountry:'Destination country',destinationPort:'Destination port',shipment:'Preferred timing',shipping:'Shipping preference',inspection:'Inspection requirements'},
 fr:{name:'Nom',email:'E-mail',company:'Entreprise',phone:'Téléphone',message:'Message',privacy:'Confidentialité confirmée',marketingConsent:'Consentement marketing',vehicleType:'Type de véhicule',makeModel:'Marque / modèle',yearRange:'Années souhaitées',condition:'État',quantity:'Quantité',budget:'Budget',currency:'Devise',destinationCountry:'Pays de destination',destinationPort:'Port de destination',shipment:'Période souhaitée',shipping:'Transport souhaité',inspection:'Inspection demandée'},
};
export function buildEmailDraft(data:Record<string,unknown>,recipient:string){
 const locale:Locale=data.locale==='fr'?'fr':'en';
 const text=Object.entries(data).filter(([key,value])=>labels[locale][key]&&value!=='').map(([key,value])=>`${labels[locale][key]}: ${typeof value==='boolean'?(value?(locale==='fr'?'Oui':'Yes'):(locale==='fr'?'Non':'No')):String(value)}`).join('\n');
 const subject=locale==='fr'?'Cana Impex — Demande automobile':'Cana Impex — Vehicle export inquiry';
 // Large requests are copied manually to avoid mail-client URL truncation.
 const base='mailto:'+recipient+'?subject='+encodeURIComponent(subject);
 const full=base+'&body='+encodeURIComponent(text);
 const requiresCopy=full.length>1800;
 return {uri:requiresCopy?base:full,text,requiresCopy};
}
