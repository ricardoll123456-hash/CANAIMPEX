import {z} from 'zod';
const optionalText=(max:number)=>z.string().trim().max(max).optional().default('');
const base={locale:z.enum(['en','fr']).default('en'),name:z.string().trim().min(2).max(120),email:z.email().max(254),company:optionalText(160),phone:optionalText(40),message:optionalText(3000),privacy:z.literal(true),marketingConsent:z.boolean().default(false),website:optionalText(200),submissionId:z.uuid().optional(),sourcePage:optionalText(300)};
export const contactSchema=z.object({...base,message:z.string().trim().min(10).max(3000)});
export const quoteSchema=z.object({...base,vehicleType:z.enum(['suv','sedan','pickup','van','other']),makeModel:optionalText(160),yearRange:optionalText(50),condition:z.enum(['new','used','either']).default('either'),quantity:z.coerce.number().int().min(1).max(1000),budget:optionalText(80),currency:z.enum(['CAD','USD','EUR','other']).default('CAD'),destinationCountry:z.string().trim().min(2).max(100),destinationPort:optionalText(120),shipment:optionalText(120),shipping:z.enum(['discuss','container','roro']).default('discuss'),inspection:optionalText(500)});
export type LeadKind='quote'|'contact';
export const schemaFor=(kind:LeadKind)=>kind==='quote'?quoteSchema:contactSchema;
