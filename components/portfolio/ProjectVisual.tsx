'use client';

import { useId } from 'react';

const palettes: Record<string, { background: string; wash: string; ink: string; dark?: boolean }> = {
  atelier: { background: '#dfe5f4', wash: '#b9c8ed', ink: '#294bcc' },
  vex: { background: '#20232b', wash: '#393852', ink: '#b9aff0', dark: true },
  brikto: { background: '#eee3d5', wash: '#dec3aa', ink: '#a23c24' },
  'vex-bridge': { background: '#e7e1f1', wash: '#c7bce5', ink: '#65538d' },
  'vex-atlas': { background: '#252937', wash: '#354668', ink: '#92a8e8', dark: true },
  portfolio: { background: '#e9e7df', wash: '#d7d5c9', ink: '#60646e' },
};

function Composition({ projectId }: { projectId: string }) {
  switch (projectId) {
    case 'atelier':
      return (
        <g>
          <circle cx="334" cy="193" r="127" fill="#f4f3f0" fillOpacity=".5" />
          <path d="M139 260 326 79l177 173" fill="none" stroke="#294bcc" strokeOpacity=".22" strokeWidth="1.5" />
          <g transform="rotate(-12 238 195)">
            <rect x="151" y="105" width="174" height="192" rx="20" fill="#294bcc" />
            <path d="M184 259v-80a53 53 0 0 1 108 0v80" fill="none" stroke="#e4e9ff" strokeWidth="2" />
            <path d="M184 210h108m-54-85v134" stroke="#e4e9ff" strokeOpacity=".5" strokeWidth="1.5" />
          </g>
          <g transform="rotate(11 405 196)">
            <rect x="322" y="108" width="166" height="181" rx="20" fill="#b7a8df" stroke="#f4f3f0" strokeWidth="2" />
            <circle cx="405" cy="184" r="43" fill="#e7e0f4" />
            <path d="M369 256c0-49 72-49 72 0" fill="#65538d" />
          </g>
          <path d="M274 204c37-26 55-26 91-8" fill="none" stroke="#f4f3f0" strokeWidth="3" strokeDasharray="5 7" />
          <rect x="292" y="174" width="44" height="44" rx="13" fill="#a23c24" transform="rotate(-8 314 196)" />
          <path d="m304 196 7 7 13-16" fill="none" stroke="#f4f3f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="505" cy="117" r="8" fill="#294bcc" />
          <circle cx="127" cy="229" r="5" fill="#a23c24" />
        </g>
      );
    case 'vex':
      return (
        <g strokeLinejoin="round">
          <path d="m112 264 207-119 209 119-207 119Z" fill="none" stroke="#b9aff0" strokeOpacity=".15" />
          <path d="m161 228 158-91 161 91-159 92Z" fill="#343748" stroke="#8077ae" />
          <path d="m161 185 158-91 161 91-159 92Z" fill="#5b537e" stroke="#a99cdd" />
          <path d="m161 142 158-91 161 91-159 92Z" fill="#b9aff0" stroke="#ddd5f9" />
          <path d="m214 143 105-61 108 61-106 61Z" fill="#20232b" fillOpacity=".12" stroke="#65538d" />
          <path d="M319 51v86m161 5v86m-319-86v86m160 6v86" stroke="#dfd8f6" strokeOpacity=".35" strokeDasharray="4 6" />
          <path d="m268 144 51-30 54 30-52 30Z" fill="#294bcc" stroke="#e2e8ff" />
          <path d="M319 114v60" stroke="#a6b9fc" />
          <path d="M480 185h45v78h-45" fill="none" stroke="#d6a678" strokeWidth="1.5" />
          <circle cx="525" cy="263" r="6" fill="#d6a678" />
          <circle cx="161" cy="185" r="5" fill="#d6a678" />
        </g>
      );
    case 'brikto':
      return (
        <g>
          <circle cx="330" cy="196" r="119" fill="#f4f3f0" fillOpacity=".4" />
          <g fill="none" stroke="#a23c24" strokeOpacity=".4" strokeWidth="1.5">
            <path d="M165 127h142v72h163M165 265h142v-66m0 0V95m98 170h-98" />
            <path d="M165 127v138h240V127H165" strokeDasharray="4 7" />
          </g>
          <rect x="112" y="93" width="107" height="68" rx="16" fill="#a23c24" transform="rotate(-8 165 127)" />
          <rect x="112" y="231" width="107" height="68" rx="16" fill="#c38d63" transform="rotate(6 165 265)" />
          <rect x="256" y="158" width="107" height="82" rx="18" fill="#294bcc" />
          <rect x="419" y="165" width="107" height="68" rx="16" fill="#b7a8df" transform="rotate(8 472 199)" />
          <rect x="358" y="231" width="95" height="68" rx="16" fill="#a23c24" transform="rotate(-5 405 265)" />
          <circle cx="307" cy="95" r="23" fill="#f4f3f0" stroke="#a23c24" strokeWidth="1.5" />
          <path d="m298 95 6 6 12-14" fill="none" stroke="#a23c24" strokeWidth="2" strokeLinecap="round" />
          <g fill="none" stroke="#f4f3f0" strokeWidth="1.5">
            <path d="m290 199 19-11 19 11-19 11Zm0 0v20l19 11 19-11v-20m-19 11v20" />
            <path d="M145 127h40m-20-15v30M391 265h28" />
          </g>
          <circle cx="472" cy="199" r="13" fill="#e8e1f4" />
        </g>
      );
    case 'vex-bridge':
      return (
        <g>
          <path d="M135 294 511 77" stroke="#65538d" strokeOpacity=".16" strokeWidth="1.5" />
          <g transform="rotate(-7 215 188)">
            <rect x="102" y="101" width="222" height="166" rx="18" fill="#f4f3f0" stroke="#b6abc9" strokeWidth="1.5" />
            <path d="M103 135h220" stroke="#b6abc9" />
            <circle cx="122" cy="119" r="3" fill="#a23c24" />
            <circle cx="134" cy="119" r="3" fill="#b7a8df" />
            <path d="m173 179-22 21 22 21m77-42 22 21-22 21m-28-50-13 58" fill="none" stroke="#65538d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g transform="rotate(7 432 204)">
            <rect x="345" y="123" width="192" height="174" rx="18" fill="#30364b" />
            <rect x="368" y="148" width="146" height="36" rx="9" fill="#4b526c" />
            <rect x="368" y="195" width="146" height="36" rx="9" fill="#4b526c" />
            <rect x="368" y="242" width="146" height="29" rx="9" fill="#4b526c" />
            <g fill="#b9aff0"><circle cx="386" cy="166" r="4" /><circle cx="386" cy="213" r="4" /><circle cx="386" cy="256" r="4" /></g>
            <path d="M401 166h90m-90 47h90m-90 43h90" stroke="#aab5d0" strokeOpacity=".5" />
          </g>
          <path d="M287 210h80" fill="none" stroke="#294bcc" strokeWidth="3" />
          <path d="m359 202 8 8-8 8m-64-16-8 8 8 8" fill="none" stroke="#294bcc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="326" cy="210" r="23" fill="#294bcc" stroke="#e7e1f1" strokeWidth="4" />
          <rect x="318" y="208" width="16" height="12" rx="3" fill="none" stroke="#f4f3f0" strokeWidth="1.5" />
          <path d="M321 208v-5a5 5 0 0 1 10 0v5" fill="none" stroke="#f4f3f0" strokeWidth="1.5" />
        </g>
      );
    case 'vex-atlas':
      return (
        <g>
          <g fill="none" stroke="#92a8e8">
            <ellipse cx="320" cy="190" rx="224" ry="98" strokeOpacity=".2" transform="rotate(-17 320 190)" />
            <ellipse cx="320" cy="190" rx="169" ry="123" strokeOpacity=".25" transform="rotate(22 320 190)" />
            <circle cx="320" cy="190" r="87" strokeOpacity=".2" strokeDasharray="3 7" />
            <path d="m173 121 147 69 148-77M320 190l134 88m-134-88-156 78m156-78 27-105" strokeOpacity=".6" strokeWidth="1.5" />
          </g>
          <rect x="275" y="145" width="90" height="90" rx="24" fill="#294bcc" stroke="#92a8e8" strokeWidth="1.5" transform="rotate(-12 320 190)" />
          <path d="m293 190 27-16 28 16-28 16Zm0 0v23l27 16 28-16v-23m-28 16v23" fill="none" stroke="#e3e8f8" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="173" cy="121" r="28" fill="#b9aff0" />
          <circle cx="173" cy="121" r="11" fill="none" stroke="#50466f" strokeWidth="1.5" />
          <rect x="445" y="90" width="46" height="46" rx="13" fill="#d6a678" transform="rotate(12 468 113)" />
          <circle cx="454" cy="278" r="24" fill="#4c649b" stroke="#92a8e8" />
          <rect x="143" y="247" width="42" height="42" rx="12" fill="#4c649b" stroke="#92a8e8" transform="rotate(-14 164 268)" />
          <circle cx="347" cy="85" r="9" fill="#d6a678" />
          <circle cx="532" cy="198" r="5" fill="#b9aff0" />
          <circle cx="283" cy="314" r="4" fill="#92a8e8" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="324" cy="193" r="124" fill="#f4f3f0" fillOpacity=".6" />
          <rect x="185" y="83" width="222" height="225" rx="17" fill="#b7a8df" transform="rotate(-13 296 195)" />
          <rect x="228" y="80" width="220" height="225" rx="17" fill="#f4f3f0" stroke="#bdbdb8" strokeWidth="1.5" transform="rotate(8 338 192)" />
          <g transform="rotate(8 338 192)">
            <path d="M255 107v171" stroke="#d5d5d4" />
            <rect x="274" y="107" width="148" height="87" rx="10" fill="#294bcc" />
            <circle cx="347" cy="151" r="29" fill="#b9aff0" />
            <path d="m347 122 29 29h-29Z" fill="#e5e9f9" />
            <path d="M274 216h147m-147 15h117m-117 15h133" stroke="#93979d" strokeWidth="1.5" />
            <rect x="274" y="262" width="45" height="15" rx="5" fill="#dedad0" />
            <rect x="327" y="262" width="65" height="15" rx="5" fill="#dedad0" />
          </g>
          <path d="m420 233 44 23-24 6-11 23Z" fill="#a23c24" stroke="#f4f3f0" strokeWidth="2" strokeLinejoin="round" />
          <path d="M147 158h26m-13-13v26" stroke="#a23c24" strokeWidth="1.5" />
          <circle cx="490" cy="119" r="7" fill="#294bcc" />
        </g>
      );
  }
}

export function ProjectVisual({ projectId }: { projectId: string }) {
  const id = useId().replace(/:/g, '');
  const palette = palettes[projectId] ?? palettes.portfolio;
  const washId = `project-wash-${id}`;
  const gridId = `project-grid-${id}`;

  return (
    <div
      aria-hidden="true"
      data-project-visual={projectId}
      className={`pointer-events-none overflow-hidden rounded-[18px] select-none ${palette.dark ? 'theme-dark' : ''}`}
    >
      <svg viewBox="0 0 640 360" fill="none" aria-hidden="true" focusable="false" className="block h-auto w-full">
        <defs>
          <radialGradient id={washId} cx=".6" cy=".5" r=".75">
            <stop stopColor={palette.wash} />
            <stop offset="1" stopColor={palette.background} />
          </radialGradient>
          <pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".8" fill={palette.ink} fillOpacity=".18" />
          </pattern>
        </defs>
        <path fill={`url(#${washId})`} d="M0 0h640v360H0z" />
        <path fill={`url(#${gridId})`} d="M0 0h640v360H0z" />
        <g data-visual-art="">
          <Composition projectId={projectId} />
        </g>
      </svg>
    </div>
  );
}
