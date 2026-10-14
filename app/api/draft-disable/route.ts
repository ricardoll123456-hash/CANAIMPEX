import {draftMode} from 'next/headers';
export async function GET(request:Request){(await draftMode()).disable();return Response.redirect(new URL('/',request.url),307);}
