import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {presentationTool} from 'sanity/presentation';
import {schemaTypes} from './sanity/schemaTypes';
export default defineConfig({name:'cana-impex',title:'Cana Impex — Vehicle exports',projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID||'unconfigured',dataset:process.env.NEXT_PUBLIC_SANITY_DATASET||'production',basePath:'/studio',plugins:[structureTool(),presentationTool({previewUrl:{initial:'/',previewMode:{enable:'/api/draft',disable:'/api/draft-disable'}},resolve:{locations:{page:{select:{title:'title',route:'route',locale:'locale'},resolve:doc=>doc?({locations:[{title:doc.title,href:(doc.locale==='fr'?'/fr/':'/')+doc.route}]}):null}}}})],schema:{types:schemaTypes}});
