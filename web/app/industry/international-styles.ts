// Industry-route styles only; shared site presentation is unchanged.
export const internationalStyles = `
.industry-international { max-width:1180px; margin:0 auto; color:var(--ink); }
.industry-international * { min-width:0; }
.industry-international .country-nav { display:flex; flex-wrap:wrap; gap:12px 24px; padding:22px 24px; border-bottom:1px solid var(--border); font:.78rem/1.5 ui-sans-serif,system-ui,sans-serif; }
.industry-international .country-nav a[aria-current=page] { color:var(--accent); font-weight:700; text-decoration-thickness:2px; text-underline-offset:6px; }
.industry-international .country-cards { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; margin:28px 0; }
.industry-international .country-card { display:flex; flex-direction:column; border:1px solid var(--border); padding:26px; background:var(--paper); }
.industry-international .country-card h2 { font-size:1.8rem; margin:10px 0 14px; font-weight:500; }
.industry-international .country-card p { font-size:.95rem; line-height:1.7; }
.industry-international .country-card > a { margin-top:auto; padding-top:18px; font-size:.85rem; }
.industry-international .country-card .country-card-boundary { padding-top:15px; border-top:1px solid var(--border); color:var(--muted); font-size:.84rem; }
.industry-international .country-review { font:.7rem/1.6 ui-sans-serif,system-ui,sans-serif; color:var(--muted); }
.industry-international .country-links { display:flex; gap:12px 24px; flex-wrap:wrap; }
.industry-international .country-schematic { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin:26px 0; }
.industry-international .country-schematic > div { border:1px solid var(--border); padding:20px; line-height:1.7; }
.industry-international .country-schematic strong { display:block; color:var(--accent); }
.industry-international .country-flow { padding:24px; background:var(--paper); border-left:3px solid var(--accent); line-height:1.9; overflow-wrap:anywhere; }
.industry-international .country-customer { font-size:.82rem; }
.industry-international .country-comparison table { min-width:950px; }
.industry-international .country-comparison th { min-width:100px; }
.industry-international .country-comparison td { width:27%; }
.industry-international .country-source-list { margin:0; padding-left:18px; }
.industry-international .country-source-list li { padding-bottom:12px; overflow-wrap:anywhere; }
.industry-international .country-source-list small { display:block; color:var(--muted); line-height:1.65; }
.industry-international .country-source-list .source-scope { margin-top:6px; }
.industry-international .country-org-source { margin-top:16px; border-top:1px solid var(--border); padding-top:12px; }
.industry-international .country-org-source > summary { cursor:pointer; color:var(--accent); font-size:.75rem; }
.industry-international .country-org-source .country-source-list { margin-top:12px; font-size:.78rem; }
.industry-international :focus-visible { outline:2px solid var(--accent); outline-offset:4px; }
@media(max-width:760px) {
 .industry-international .country-cards,.industry-international .country-schematic { grid-template-columns:1fr; }
 .industry-international .country-card { padding:20px; }
 .industry-international .country-nav { padding:20px 18px; gap:14px 20px; }
}
`;
