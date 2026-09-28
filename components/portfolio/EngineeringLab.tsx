'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useMotionPreference } from '@/components/motion/MotionProvider';
import { DeliveryLab } from '@/components/portfolio/DeliveryLab';
import { EngineeringStudy } from '@/components/portfolio/EngineeringStudy';

gsap.registerPlugin(useGSAP);

const experiments = [
  { id: 'delivery', label: 'Delivery & retries' },
  { id: 'model', label: 'Model revisions' },
] as const;

export function EngineeringLab() {
  const [experiment, setExperiment] = useState<(typeof experiments)[number]['id']>('delivery');
  const root = useRef<HTMLElement>(null);
  const { enabled } = useMotionPreference();

  useGSAP(() => {
    if (!enabled) return;
    gsap.fromTo(`#lab-${experiment}-panel`, { y: 10, opacity: 0.7 }, {
      y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity',
    });
  }, { scope: root, dependencies: [experiment, enabled], revertOnUpdate: true });

  return (
    <section ref={root} id="lab" aria-labelledby="lab-title" className="theme-dark section-spacing border-t border-line text-paper">
      <div className="section-shell">
        <header className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-x-16">
          <p className="eyebrow lg:col-span-2"><span className="text-accent">04</span> / Engineering lab</p>
          <h2 id="lab-title" data-reveal className="section-title">Small <span className="editorial text-accent">experiments</span></h2>
          <p className="body-copy max-w-xl self-end">
            A few small ways to inspect how software behaves. Change an input, repeat an action,
            and follow what changed in the data.
          </p>
        </header>

        <div className="mb-8 border-y border-line py-4">
          <div role="group" aria-label="Choose an experiment" aria-describedby="lab-switch-hint" className="flex flex-wrap gap-2">
            {experiments.map((option) => (
              <button
                key={option.id}
                id={`lab-${option.id}-button`}
                type="button"
                aria-pressed={experiment === option.id}
                aria-controls={`lab-${option.id}-panel`}
                onClick={() => setExperiment(option.id)}
                className={`min-h-11 rounded-full border px-5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${experiment === option.id ? 'border-accent bg-accent text-canvas' : 'border-line text-muted hover:border-muted hover:text-paper'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p id="lab-switch-hint" className="mt-3 text-xs leading-relaxed text-muted">
            Both experiments keep their state while you switch. Nothing is saved after a page reload.
          </p>
        </div>

        <div className="lab-frame">
        <div id="lab-delivery-panel" hidden={experiment !== 'delivery'}>
          <DeliveryLab />
        </div>
        <div id="lab-model-panel" hidden={experiment !== 'model'}>
          <EngineeringStudy embedded />
        </div>
        </div>
      </div>
    </section>
  );
}
