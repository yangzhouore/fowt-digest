// Route-owned styles. The prefix prevents changes to any other sector or the
// existing company catalogue. Keeping this a TS module also preserves the
// repository's framework-free server-render acceptance harness.
export const guideStyles = `
.uk-guide { max-width:1180px; margin:0 auto; color:var(--ink); }
.uk-guide * { min-width:0; }
.uk-guide .uk-zh { display:none; }
html[lang="zh-CN"] .uk-guide .uk-en { display:none; }
html[lang="zh-CN"] .uk-guide .uk-zh { display:block; }
.uk-guide span.uk-en { display:inline; }
html[lang="zh-CN"] .uk-guide span.uk-zh { display:inline; }
.uk-guide .uk-hero { padding:66px 24px 30px; border-bottom:1px solid var(--ink); }
.uk-guide .uk-eyebrow { margin:0 0 18px; color:var(--accent); font:700 .7rem/1.4 ui-sans-serif,system-ui,sans-serif; letter-spacing:.12em; text-transform:uppercase; }
.uk-guide h1 { max-width:940px; margin:0 0 26px; font-size:clamp(2.7rem,5.5vw,5.2rem); font-weight:500; line-height:1.02; letter-spacing:-.045em; }
.uk-guide .uk-lead { max-width:760px; font-size:1.19rem; line-height:1.65; }
.uk-guide .uk-hero-bottom { display:flex; justify-content:space-between; align-items:end; gap:24px; margin-top:32px; font:.78rem/1.65 ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-hero-bottom p { margin:0; color:var(--muted); }
.uk-guide .uk-chapter-nav { display:flex; flex-wrap:wrap; gap:10px 22px; padding:22px 24px; border-bottom:1px solid var(--border); font:.78rem/1.5 ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-chapter-nav a { color:var(--ink); text-decoration:none; }
.uk-guide .uk-chapter-nav a:hover { color:var(--accent); text-decoration:underline; }
.uk-guide .uk-chapter-nav span { color:var(--accent); }
.uk-guide .uk-lenses { display:grid; grid-template-columns:repeat(4,1fr); padding:32px 24px; gap:24px; }
.uk-guide .uk-lenses > div { padding-left:14px; border-left:2px solid var(--border); }
.uk-guide .uk-lenses span { color:var(--accent); font:.72rem ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-lenses h2 { margin:8px 0; font-size:1.15rem; }
.uk-guide .uk-lenses p { margin:0; font-size:.88rem; color:var(--muted); }
.uk-guide .uk-chain,.uk-guide .uk-chapter { padding:48px 24px; border-top:1px solid var(--border); scroll-margin-top:20px; }
.uk-guide .uk-section-intro { margin-bottom:28px; }
.uk-guide .uk-section-intro h2 { margin:0 0 16px; font-size:clamp(1.8rem,3.5vw,2.8rem); font-weight:500; letter-spacing:-.025em; }
.uk-guide .uk-section-intro > p:last-child { max-width:760px; margin:0; color:var(--muted); line-height:1.65; }
.uk-guide .uk-chain-lanes { display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:22px; align-items:start; }
.uk-guide .uk-chain-lane > h3 { min-height:40px; margin:0 0 14px; font:700 .75rem/1.5 ui-sans-serif,system-ui,sans-serif; color:var(--accent); }
.uk-guide .uk-tier { margin-bottom:9px; border:1px solid var(--border); background:var(--paper); }
.uk-guide .uk-tier > summary { display:flex; align-items:baseline; gap:12px; cursor:pointer; padding:16px; list-style:none; }
.uk-guide .uk-tier > summary::after { content:"+"; margin-left:auto; color:var(--accent); }
.uk-guide .uk-tier[open] > summary::after { content:"−"; }
.uk-guide .uk-tier-number { font:.7rem ui-sans-serif,system-ui,sans-serif; color:var(--accent); }
.uk-guide .uk-tier dl { padding:0 16px 16px; margin:0; }
.uk-guide .uk-tier dt { margin-top:14px; font:700 .68rem/1.5 ui-sans-serif,system-ui,sans-serif; color:var(--muted); }
.uk-guide .uk-tier dd { margin:5px 0 0; font-size:.87rem; line-height:1.6; overflow-wrap:anywhere; }
.uk-guide .uk-note { color:var(--muted); font-size:.82rem; line-height:1.65; }
.uk-guide .uk-topic { border-top:1px solid var(--border); scroll-margin-top:24px; }
.uk-guide .uk-topic:last-of-type { border-bottom:1px solid var(--border); }
.uk-guide .uk-topic > summary { display:flex; align-items:baseline; gap:20px; padding:23px 0; cursor:pointer; list-style:none; }
.uk-guide .uk-topic > summary h3 { margin:0; font-size:1.1rem; line-height:1.4; }
.uk-guide .uk-topic-number { color:var(--accent); font:.7rem ui-sans-serif,system-ui,sans-serif; flex-shrink:0; }
.uk-guide .uk-topic-summary { display:block; margin-top:8px; color:var(--muted); font-size:.88rem; line-height:1.6; max-width:850px; }
.uk-guide .uk-expand { color:var(--accent); font:1.3rem ui-sans-serif,system-ui,sans-serif; margin-left:auto; }
.uk-guide .uk-topic[open] > summary .uk-expand { transform:rotate(45deg); }
.uk-guide .uk-topic-body { padding:0 0 26px 45px; }
.uk-guide .uk-topic-body p,.uk-guide .uk-topic-body li { line-height:1.75; font-size:.94rem; overflow-wrap:anywhere; }
.uk-guide .uk-topic-body p { max-width:940px; margin:16px 0; }
.uk-guide .uk-kinds { display:flex; gap:7px; flex-wrap:wrap; margin:6px 0 18px; }
.uk-guide .uk-kinds span { padding:4px 8px; border:1px solid var(--border); border-radius:2px; color:var(--muted); font:.66rem/1.4 ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-flow-text { white-space:pre-wrap; overflow-wrap:anywhere; padding:24px; border-left:3px solid var(--accent); background:var(--paper); color:var(--ink); font:.79rem/1.9 ui-monospace,SFMono-Regular,Consolas,monospace; }
.uk-guide .uk-table-scroll { overflow-x:auto; margin:22px 0; border:1px solid var(--border); }
.uk-guide table { width:100%; min-width:760px; border-collapse:collapse; font-size:.82rem; line-height:1.65; }
.uk-guide caption { text-align:left; padding:12px 14px; color:var(--muted); font:.7rem/1.5 ui-sans-serif,system-ui,sans-serif; }
.uk-guide th,.uk-guide td { padding:14px; text-align:left; vertical-align:top; border-top:1px solid var(--border); overflow-wrap:break-word; }
.uk-guide thead { background:var(--paper); font:.7rem/1.6 ui-sans-serif,system-ui,sans-serif; }
.uk-guide tbody th { min-width:140px; font-weight:600; }
.uk-guide .uk-organisation-cards { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin:24px 0; }
.uk-guide .uk-organisation-card { padding:20px; border:1px solid var(--border); }
.uk-guide .uk-organisation-card h4 { margin:0; color:var(--accent); font-size:1.05rem; }
.uk-guide .uk-organisation-card p { margin:12px 0 0; font-size:.86rem; }
.uk-guide .uk-organisation-card .uk-role-boundary { padding-top:12px; border-top:1px solid var(--border); color:var(--muted); }
.uk-guide .uk-card-evidence { margin-top:16px; padding-top:12px; border-top:1px solid var(--border); font:.67rem/1.5 ui-sans-serif,system-ui,sans-serif; color:var(--muted); }
.uk-guide .uk-card-evidence > p { font:inherit; margin-top:10px; }
.uk-guide .uk-evidence { padding:16px 0; margin-top:22px; border-top:1px dashed var(--border); }
.uk-guide .uk-evidence > summary { cursor:pointer; color:var(--accent); font:.78rem/1.6 ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-evidence ul { padding-left:20px; }
.uk-guide .uk-evidence li { padding:12px 0; border-bottom:1px solid var(--border); }
.uk-guide .uk-evidence .uk-source-meta { margin:5px 0 0; color:var(--muted); font:.71rem/1.6 ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-machine { margin:28px 0 32px; border:1px solid var(--border); padding:20px; background:var(--paper); }
.uk-guide .uk-machine-scroll { overflow-x:auto; }
.uk-guide .uk-diagram-hint { display:none; }
.uk-guide .uk-machine svg { width:100%; height:auto; display:block; }
.uk-guide .uk-machine text { fill:var(--ink); font:15px ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-water { stroke:var(--border); stroke-dasharray:6 5; }
.uk-guide .uk-seabed { stroke:var(--muted); stroke-width:2; }
.uk-guide .uk-structure { fill:var(--page); stroke:var(--ink); stroke-width:2; }
.uk-guide .uk-hub { fill:var(--accent); }
.uk-guide .uk-blades { fill:none; stroke:var(--ink); stroke-width:7; stroke-linecap:round; }
.uk-guide .uk-mooring { fill:none; stroke:var(--accent); stroke-width:3; }
.uk-guide .uk-cable { fill:none; stroke:#527f88; stroke-width:4; }
.uk-guide .uk-buoy { fill:var(--paper); stroke:#527f88; stroke-width:3; }
.uk-guide .uk-anchor { fill:none; stroke:var(--accent); stroke-width:3; }
.uk-guide .uk-callout { fill:none; stroke:var(--muted); stroke-width:1; }
.uk-guide figcaption { margin-top:16px; color:var(--muted); font-size:.8rem; line-height:1.6; }
.uk-guide .uk-decision-map { border:1px solid var(--border); padding:24px; margin:24px 0; background:var(--paper); }
.uk-guide .uk-decision-map > div { display:flex; flex-wrap:wrap; gap:12px; margin:20px 0; }
.uk-guide .uk-decision-map span { padding:12px; border:1px solid var(--border); font-size:.88rem; }
.uk-guide .uk-decision-map > p:first-child { margin:0; color:var(--accent); font:.72rem ui-sans-serif,system-ui,sans-serif; }
.uk-guide .uk-power-lanes { display:grid; grid-template-columns:1fr 1fr; border:1px solid var(--border); margin-bottom:30px; }
.uk-guide .uk-power-lanes > div { padding:24px; }
.uk-guide .uk-power-lanes > div + div { border-left:1px solid var(--border); }
.uk-guide .uk-power-lanes p { line-height:1.8; }
.uk-guide .uk-power-lanes > .uk-note { grid-column:1/-1; border-top:1px solid var(--border); padding:16px 24px; margin:0; }
.uk-guide .uk-back { display:inline-block; margin-top:24px; font-size:.78rem; }
.uk-guide .uk-boundary { border-top:1px solid var(--ink); margin:0 24px; padding:28px 0 40px; }
.uk-guide .uk-boundary h2 { font-size:1.3rem; }
.uk-guide .uk-boundary p { max-width:900px; font-size:.88rem; line-height:1.7; color:var(--muted); }
.uk-guide :focus-visible { outline:2px solid var(--accent); outline-offset:4px; }
.uk-guide .uk-topic:target,.uk-guide .uk-chapter:target { outline:1px solid var(--accent); outline-offset:8px; }
@media(max-width:760px) {
 .uk-guide .uk-hero { padding:42px 18px 24px; }
 .uk-guide .uk-lead { font-size:1.03rem; }
 .uk-guide .uk-hero-bottom { display:block; }
 .uk-guide .uk-hero-bottom > a { display:inline-block; margin-top:20px; }
 .uk-guide .uk-lenses { grid-template-columns:1fr 1fr; padding:26px 18px; }
 .uk-guide .uk-chain,.uk-guide .uk-chapter { padding:34px 18px; }
 .uk-guide .uk-chain-lanes { grid-template-columns:1fr; }
 .uk-guide .uk-chain-lane > h3 { min-height:auto; }
 .uk-guide .uk-topic > summary { gap:12px; }
 .uk-guide .uk-topic-body { padding-left:0; }
 .uk-guide .uk-flow-text { padding:14px; font-size:.67rem; }
 .uk-guide .uk-machine { padding:8px; }
 .uk-guide .uk-machine svg { min-width:680px; }
 .uk-guide .uk-diagram-hint { display:block; margin-bottom:10px; color:var(--accent); }
 .uk-guide .uk-machine figcaption { padding:4px; }
 .uk-guide .uk-power-lanes { grid-template-columns:1fr; }
 .uk-guide .uk-organisation-cards { grid-template-columns:1fr; }
 .uk-guide .uk-power-lanes > div + div { border-left:0; border-top:1px solid var(--border); }
 .uk-guide .uk-chapter-nav { padding:20px 18px; gap:12px 18px; }
}
@media print {
 .uk-guide details > * { display:block; }
 .uk-guide .uk-chapter-nav,.uk-guide .uk-back { display:none; }
 .uk-guide .uk-table-scroll { overflow:visible; }
 .uk-guide table { min-width:0; font-size:8pt; }
}
`;
