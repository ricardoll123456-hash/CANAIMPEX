import Link from 'next/link';
export default function NotFound(){return <main id="main" className="container missing"><span className="eyebrow">404</span><h1>A different route.<br/>Une autre route.</h1><p>The page could not be found. / Cette page est introuvable.</p><Link className="button" href="/">Home / Accueil ↗</Link></main>;}
