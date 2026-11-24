import { LocalizedCopy } from "./i18n/localized-copy";

export function BriefingVisual() {
  return (
    <figure className="briefing-visual" aria-labelledby="briefing-visual-caption">
      <svg viewBox="0 0 420 184" aria-hidden="true" focusable="false" fill="none">
        <g stroke="var(--accent)" opacity=".18">
          <path d="M0 20h420M0 44h420M0 68h420M0 92h420M0 116h420M0 140h420M0 164h420" />
          <path d="M18 0v184M54 0v184M90 0v184M126 0v184M162 0v184M198 0v184M234 0v184M270 0v184M306 0v184M342 0v184M378 0v184M414 0v184" />
        </g>
        <path d="M0 111h420v73H0z" fill="var(--accent)" opacity=".07" />
        <g stroke="var(--accent)" strokeLinecap="round" opacity=".45">
          <path d="M0 111h420" />
          <path d="M15 126h59m38 0h26m147 0h46m25 0h42M12 154h54m109 0h39m87 0h26m21 0h55" strokeDasharray="4 5" />
          <circle cx="214" cy="51" r="40" strokeDasharray="3 5" />
        </g>
        <g stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M170 126Q130 152 69 171m177-39q-4 22-35 39m55-45q45 30 91 45" />
          <path d="M60 171h18m124 0h18m128 0h18" />
        </g>
        <g stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--surface)">
          <path d="M208 57h9l6 47h-20z" />
          <path d="M172 103h94l-5 9h-82zM176 112h16v20h-16zM239 112h21v20h-21zM192 120h47v7h-47z" />
          <path d="M211 48l6-35 3 1-2 34m-1 5 33 13-2 3-33-11m-3-3-27 24-2-3 24-26" />
          <circle cx="214" cy="51" r="4" fill="var(--selected)" />
        </g>
      </svg>
      <figcaption id="briefing-visual-caption"><LocalizedCopy en="Floating wind schematic" zh="浮式风电示意图" /></figcaption>
    </figure>
  );
}
