export function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return <span className={`brand ${light ? 'brand-light' : ''}`}><svg viewBox="0 0 44 44" aria-hidden="true"><path d="M30 9a17 17 0 1 0 0 26" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M28 13v18" stroke="currentColor" strokeWidth="4"/><circle cx="36" cy="9" r="3" fill="#c86b32"/></svg>{!compact && <span>CANA IMPEX<small>VEHICLE EXPORTS</small></span>}</span>;
}
