import {handleLead} from '@/lib/leads';
export const runtime='nodejs';
export async function POST(request:Request){return handleLead(request,'contact');}
