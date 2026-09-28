'use client';

import { useId, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useMotionPreference } from '@/components/motion/MotionProvider';
import type { WorkAreaId } from '@/data/work-areas';

gsap.registerPlugin(useGSAP);

const studies = {
  applications: { rotation: -8, fold: -18, stretch: 1, blue: '#8daaff', lavender: '#d1c2ff', coral: '#ffb29e' },
  backend: { rotation: 12, fold: 8, stretch: 0.92, blue: '#b7c7ff', lavender: '#a6a0f4', coral: '#efb8cf' },
  systems: { rotation: -22, fold: 24, stretch: 1.06, blue: '#7297f0', lavender: '#b7c7ff', coral: '#ffc4ac' },
  automation: { rotation: 20, fold: -34, stretch: 0.96, blue: '#a6b9ff', lavender: '#ddbdff', coral: '#ff9f91' },
} satisfies Record<WorkAreaId, { rotation: number; fold: number; stretch: number; blue: string; lavender: string; coral: string }>;

export function SignalSculpture({ selectedId }: { selectedId: WorkAreaId }) {
  const root = useRef<HTMLDivElement>(null);
  const previousId = useRef(selectedId);
  const { enabled } = useMotionPreference();
  const uid = useId().replace(/:/g, '');
  const study = studies[selectedId];
  const paint = (name: string) => `url(#${uid}-${name})`;

  useGSAP(() => {
    const previous = studies[previousId.current];
    const changed = previousId.current !== selectedId;
    previousId.current = selectedId;
    if (!enabled) return;

    if (changed) {
      gsap.fromTo('[data-signal-form]', {
        rotation: previous.rotation - study.rotation,
        scaleX: previous.stretch / study.stretch,
        svgOrigin: '260 140',
      }, {
        rotation: 0,
        scaleX: 1,
        duration: 0.7,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      gsap.fromTo('[data-signal-fold]', {
        rotation: previous.fold - study.fold,
        svgOrigin: '260 140',
      }, {
        rotation: 0,
        duration: 0.85,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  }, { scope: root, dependencies: [selectedId, enabled], revertOnUpdate: true });

  useGSAP(() => {
    if (!enabled) return;

    const surface = root.current;
    const tilt = surface?.querySelector<HTMLDivElement>('[data-signal-tilt]');
    if (!surface || !tilt) return;

    const media = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let pointerContext: gsap.Context | undefined;

    const syncPointer = () => {
      pointerContext?.revert();
      pointerContext = undefined;
      if (!media.matches) return;

      pointerContext = gsap.context(() => {
        // Capture the resting axes before quickTo can replace its own starting values.
        gsap.set(tilt, { rotationX: 0, rotationY: 0, transformPerspective: 800 });
        const tiltX = gsap.quickTo(tilt, 'rotationX', { duration: 0.45, ease: 'power2.out' });
        const tiltY = gsap.quickTo(tilt, 'rotationY', { duration: 0.45, ease: 'power2.out' });
        const onMove = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          const bounds = surface.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
          const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
          tiltX(-y * 4);
          tiltY(x * 4);
        };
        const onLeave = () => {
          tiltX(0);
          tiltY(0);
        };
        surface.addEventListener('pointermove', onMove);
        surface.addEventListener('pointerleave', onLeave);
        surface.addEventListener('pointercancel', onLeave);

        return () => {
          surface.removeEventListener('pointermove', onMove);
          surface.removeEventListener('pointerleave', onLeave);
          surface.removeEventListener('pointercancel', onLeave);
        };
      }, surface);
    };

    media.addEventListener('change', syncPointer);
    syncPointer();
    return () => {
      media.removeEventListener('change', syncPointer);
      // Revert kills both quickTo tweens and restores only the child tilt transform.
      pointerContext?.revert();
      pointerContext = undefined;
    };
  }, { scope: root, dependencies: [enabled], revertOnUpdate: true });

  return (
    <div ref={root} data-signal-sculpture data-parallax aria-hidden="true" className="relative isolate h-56 w-full sm:h-64">
      <div data-signal-tilt className="h-full w-full origin-center">
        <svg viewBox="0 0 520 280" fill="none" focusable="false" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={`${uid}-halo`}>
              <stop stopColor={study.blue} stopOpacity="0.15" />
              <stop offset="0.62" stopColor={study.lavender} stopOpacity="0.05" />
              <stop offset="1" stopColor={study.blue} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${uid}-core`} cx="30%" cy="24%" r="80%">
              <stop stopColor="#f5f5f7" />
              <stop offset="0.24" stopColor={study.lavender} />
              <stop offset="0.6" stopColor={study.blue} />
              <stop offset="1" stopColor="#343f74" />
            </radialGradient>
            <linearGradient id={`${uid}-ribbon`} x1="105" y1="65" x2="391" y2="230" gradientUnits="userSpaceOnUse">
              <stop stopColor="#485999" />
              <stop offset="0.28" stopColor={study.blue} />
              <stop offset="0.53" stopColor="#e0dcff" />
              <stop offset="0.74" stopColor={study.lavender} />
              <stop offset="1" stopColor="#667ed1" />
            </linearGradient>
            <linearGradient id={`${uid}-fold`} x1="190" y1="34" x2="322" y2="245" gradientUnits="userSpaceOnUse">
              <stop stopColor={study.coral} />
              <stop offset="0.28" stopColor="#f5d5da" />
              <stop offset="0.52" stopColor={study.lavender} />
              <stop offset="1" stopColor="#626cb0" />
            </linearGradient>
            <linearGradient id={`${uid}-lip`} x1="132" y1="150" x2="387" y2="209" gradientUnits="userSpaceOnUse">
              <stop stopColor={study.blue} />
              <stop offset="0.45" stopColor={study.lavender} />
              <stop offset="0.8" stopColor="#eee6ff" />
              <stop offset="1" stopColor={study.coral} />
            </linearGradient>
            <linearGradient id={`${uid}-edge`} x1="140" y1="65" x2="383" y2="214" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f5f5f7" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#f5f5f7" stopOpacity="0.12" />
              <stop offset="1" stopColor={study.coral} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          <ellipse cx="260" cy="144" rx="244" ry="134" fill={paint('halo')} />
          <g stroke="currentColor" className="text-line" strokeWidth="0.7">
            <ellipse cx="260" cy="147" rx="231" ry="85" transform="rotate(-12 260 147)" />
            <path d="M66 205C136 263 379 251 459 133" />
          </g>

          {/* React owns the resting pose; GSAP offsets live on separate inner groups. */}
          <g transform={`translate(260 140) rotate(${study.rotation}) scale(${study.stretch} 1) translate(-260 -140)`}>
            <g data-signal-form>
              <path d="M113 163C88 110 145 61 229 52C313 43 399 75 414 127C431 184 345 230 257 234C187 237 132 209 113 163ZM161 150C176 179 222 190 270 184C326 178 365 152 354 128C344 104 294 90 242 98C192 105 150 128 161 150Z" fill={paint('ribbon')} fillRule="evenodd" />
              <path d="M113 163C88 110 145 61 229 52C313 43 399 75 414 127M161 150C176 179 222 190 270 184C326 178 365 152 354 128" stroke={paint('edge')} strokeWidth="1.2" />
              <path d="M127 176C169 216 250 225 322 203" stroke="#394575" strokeOpacity="0.55" strokeWidth="1" />

              <g transform={`rotate(${study.fold} 260 140)`}>
                <g data-signal-fold>
                  <path d="M227 32C274 14 321 68 335 134C350 200 322 252 282 248C238 243 196 187 185 128C176 79 193 45 227 32ZM237 64C221 72 220 101 228 132C239 176 264 209 283 208C302 207 309 175 298 133C287 89 258 54 237 64Z" fill={paint('fold')} fillRule="evenodd" />
                  <path d="M227 32C274 14 321 68 335 134C350 200 322 252 282 248M237 64C221 72 220 101 228 132C239 176 264 209 283 208" stroke={paint('edge')} strokeWidth="1.1" />
                  <path d="M216 48C192 84 212 157 246 196" stroke="#f5f5f7" strokeOpacity="0.22" />
                </g>
              </g>

              <circle cx="265" cy="137" r="29" fill={paint('core')} />
              <path d="M161 150C176 179 222 190 270 184C326 178 365 152 354 128L414 127C431 184 345 230 257 234C187 237 132 209 113 163L161 150Z" fill={paint('lip')} />
              <path d="M161 150C176 179 222 190 270 184C326 178 365 152 354 128" stroke="#f5f5f7" strokeOpacity="0.7" strokeWidth="1.3" />
              <path d="M133 180C171 216 242 225 312 210C354 201 388 181 400 163" stroke="#f5f5f7" strokeOpacity="0.25" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
