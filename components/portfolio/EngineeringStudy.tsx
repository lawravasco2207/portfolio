'use client';

import { useId, useState } from 'react';
import {
  STUDY_CHANGES,
  STUDY_PLAN,
  STUDY_VIEWS,
  formatStudyValue,
  getChangeEvidence,
  getPlanDescription,
  getPlanGeometry,
  getVisibleRevisions,
  type StudyChange,
  type StudyChangeId,
  type StudyView,
} from '@/lib/engineering-study';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

function PlanMarker({
  x,
  y,
  number,
  selected,
}: {
  x: number;
  y: number;
  number: string;
  selected: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="-14"
        y="-14"
        width="28"
        height="28"
        className={selected ? 'fill-accent stroke-accent' : 'fill-canvas stroke-muted'}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        className={`font-mono text-[13px] ${selected ? 'fill-canvas font-bold' : 'fill-paper'}`}
      >
        {number}
      </text>
    </g>
  );
}

function StudyPlan({
  id,
  view,
  selected,
}: {
  id: string;
  view: StudyView;
  selected: StudyChange;
}) {
  const geometry = getPlanGeometry(view === 'before' ? 'before' : 'after');
  const { left, top, right, bottom, dividerY, doorX, doorEndX, rightDoorX, rightDoorEndX, rightDoorWidth } = geometry;
  const description = getPlanDescription(view, selected);

  return (
    <figure id={`${id}-plan`} className="min-w-0 border-b border-line bg-canvas lg:border-r lg:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-6 sm:px-7">
        <div>
          <h3 className="text-sm font-medium text-paper">Ground floor / a small revision</h3>
          <p className="mt-1 font-mono text-xs text-muted">Two rooms. One shared corridor.</p>
        </div>
        <span className="border border-line px-2 py-1 font-mono text-xs text-muted">
          {view === 'changes' ? 'A → B' : view === 'before' ? 'REV A' : 'REV B'}
        </span>
      </div>

      <svg
        viewBox="0 0 624 400"
        role="img"
        aria-labelledby={`${id}-plan-title ${id}-plan-description`}
        className="my-4 block h-auto w-full"
      >
        <title id={`${id}-plan-title`}>{`Synthetic floor plan — ${view} view`}</title>
        <desc id={`${id}-plan-description`}>{description}</desc>
        <defs>
          <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 H 0 V 24" fill="none" className="stroke-line" strokeWidth="0.6" />
          </pattern>
          <pattern id={`${id}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0 8 L 8 0" className="stroke-accent" strokeWidth="0.7" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="624" height="400" fill={`url(#${id}-grid)`} opacity="0.55" />
        <rect x={left} y={top} width={right - left} height={bottom - top} className="fill-surface" />

        <g className="stroke-muted" strokeWidth="1" fill="none">
          <path d={`M ${left} 36 V 46 M ${left} 41 H ${right} M ${right} 36 V 46`} />
        </g>
        <text x="312" y="28" textAnchor="middle" className="fill-muted font-mono text-[12px]">
          {formatStudyValue(STUDY_PLAN.widthMm, 'mm')} / illustrative
        </text>

        {getVisibleRevisions(view).map((revision) => {
          const plan = getPlanGeometry(revision);
          const earlier = view === 'changes' && revision === 'before';
          const partitionSelected = selected.id === 'partition';
          const doorSelected = selected.id === 'door';
          const roomSelected = selected.id === 'room-use';
          const dash = earlier ? '6 5' : undefined;
          const stroke = (active: boolean) => earlier ? 'stroke-ochre' : active ? 'stroke-accent' : 'stroke-muted';
          const doorPath = `M ${plan.doorX} ${dividerY} V ${dividerY - plan.doorWidth} M ${plan.doorX} ${dividerY - plan.doorWidth} A ${plan.doorWidth} ${plan.doorWidth} 0 0 1 ${plan.doorEndX} ${dividerY}`;

          return (
            <g key={revision}>
              {roomSelected && (
                <g>
                  <rect
                    x={plan.partitionX + 9}
                    y={top + 9}
                    width={right - plan.partitionX - 18}
                    height={dividerY - top - 18}
                    fill={earlier ? 'none' : `url(#${id}-hatch)`}
                    className={stroke(true)}
                    strokeDasharray={dash}
                    strokeWidth="1.5"
                  />
                </g>
              )}
              {partitionSelected && (
                <path
                  d={`M ${plan.partitionX} ${top} V ${dividerY}`}
                  className={stroke(true)}
                  strokeWidth="18"
                  opacity="0.12"
                />
              )}
              <path
                d={`M ${plan.partitionX} ${top} V ${dividerY}`}
                className={stroke(partitionSelected)}
                strokeWidth={partitionSelected ? 4 : 3}
                strokeDasharray={dash}
              />
              {doorSelected && (
                <path d={doorPath} fill="none" className={stroke(true)} strokeWidth="12" opacity="0.12" />
              )}
              <path
                d={doorPath}
                fill="none"
                className={stroke(doorSelected)}
                strokeWidth={doorSelected ? 2.5 : 1.5}
                strokeDasharray={dash}
              />
              {earlier && (
                <path
                  d={`M ${plan.doorEndX} ${dividerY} H ${doorEndX}`}
                  className="stroke-ochre"
                  strokeWidth="3"
                  strokeDasharray="4 3"
                />
              )}
            </g>
          );
        })}

        <g fill="none" className="stroke-paper" strokeWidth="3">
          <rect x={left} y={top} width={right - left} height={bottom - top} />
          <path d={`M ${left} ${dividerY} H ${doorX} M ${doorEndX} ${dividerY} H ${rightDoorX} M ${rightDoorEndX} ${dividerY} H ${right}`} />
        </g>
        <path
          d={`M ${rightDoorX} ${dividerY} V ${dividerY - rightDoorWidth} M ${rightDoorX} ${dividerY - rightDoorWidth} A ${rightDoorWidth} ${rightDoorWidth} 0 0 1 ${rightDoorEndX} ${dividerY}`}
          fill="none"
          className="stroke-muted"
          strokeWidth="1.5"
        />

        <g textAnchor="middle">
          <text x="174" y="145" className="fill-muted font-mono text-[12px]">ROOM 01</text>
          <text x="174" y="168" className="fill-paper text-[18px]">Workroom</text>
          {view === 'changes' ? (
            <>
              <text x="434" y="158" className="fill-ochre text-[16px]">A · {getPlanGeometry('before').roomUse}</text>
              <text x="434" y="182" className={`text-[16px] ${selected.id === 'room-use' ? 'fill-accent' : 'fill-paper'}`}>
                B · {geometry.roomUse}
              </text>
            </>
          ) : (
            <text x="434" y="168" className={`text-[18px] ${selected.id === 'room-use' ? 'fill-accent' : 'fill-paper'}`}>
              {geometry.roomUse}
            </text>
          )}
          <text x="340" y="330" className="fill-muted font-mono text-[14px]">SHARED CORRIDOR</text>
        </g>

        <PlanMarker x={geometry.partitionX} y={90} number="01" selected={selected.id === 'partition'} />
        <PlanMarker x={doorX + geometry.doorWidth / 2} y={309} number="02" selected={selected.id === 'door'} />
        <PlanMarker x={434} y={114} number="03" selected={selected.id === 'room-use'} />
      </svg>

      <figcaption className="space-y-4 px-5 pb-6 sm:px-7">
        <ul aria-label="Plan legend" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          {view === 'changes' && (
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="w-5 border-t-2 border-dashed border-ochre" />
              A / earlier
            </li>
          )}
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="w-5 border-t-2 border-paper" />
            {view === 'before' ? 'A / before' : 'B / after'}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 bg-accent" />
            Selected element
          </li>
        </ul>
        <p className="text-xs leading-relaxed text-muted">Schematic only, not for construction; numbered markers match the change buttons.</p>
        <details className="border-t border-line pt-3">
          <summary className={`w-fit cursor-pointer py-1 text-sm text-paper ${focusRing}`}>Read the plan as text</summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        </details>
      </figcaption>
    </figure>
  );
}

export function EngineeringStudy({ embedded = false }: { embedded?: boolean } = {}) {
  const id = useId();
  const [view, setView] = useState<StudyView>('changes');
  const [selectedId, setSelectedId] = useState<StudyChangeId>('partition');
  const selected = STUDY_CHANGES.find((change) => change.id === selectedId) ?? STUDY_CHANGES[0];
  const evidence = getChangeEvidence(selected);
  const before = formatStudyValue(evidence.before, evidence.unit);
  const after = formatStudyValue(evidence.after, evidence.unit);

  return (
    <section id="thinking" aria-labelledby={`${id}-heading`} className={embedded ? 'text-paper' : 'section-spacing border-t border-line bg-canvas text-paper'}>
      <div className={embedded ? undefined : 'section-shell'}>
        {embedded ? (
          <header className="mb-6">
            <h3 id={`${id}-heading`} className="text-2xl font-medium tracking-tight">Compare model revisions</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
              Follow three edits through a small floor plan. The drawing and the evidence use the same
              snapshots, so you can inspect position, dimension and property changes together.
            </p>
          </header>
        ) : (
          <header className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-x-16">
            <p className="eyebrow flex items-center gap-3 lg:col-span-2">
              <span className="text-accent">02</span>
              <span>How I think</span>
            </p>
            <h2 id={`${id}-heading`} className="section-title max-w-3xl">
              A file changed.<br />What <span className="editorial text-accent">actually</span> changed?
            </h2>
            <p className="body-copy max-w-xl self-end text-muted">
              As a software engineer, I’m drawn to architecture, engineering and construction (AEC):
              complex information, real places, and people who need clarity. I start with a small question,
              follow the data, and try to make the answer useful.
            </p>
          </header>
        )}

        {!embedded && <ol aria-label="My approach" className="mb-8 grid grid-cols-3 border-y border-line">
          {[
            ['01', 'Observe the change', 'Locate the edit before interpreting it.'],
            ['02', 'Understand the data', 'Keep identity, properties and units together.'],
            ['03', 'Make it useful', 'Turn a difference into a reviewable question.'],
          ].map(([number, title, description], index) => (
            <li key={number} className={`py-5 ${index > 0 ? 'border-l border-line pl-3 sm:pl-6' : ''} pr-2 sm:pr-5`}>
              <p className="flex flex-col items-baseline gap-2 text-xs font-medium sm:flex-row sm:gap-3 sm:text-sm">
                <span className="font-mono text-xs text-accent">{number}</span>{title}
              </p>
              <p className="mt-2 hidden text-sm leading-relaxed text-muted sm:block">{description}</p>
            </li>
          ))}
        </ol>}

        <div className="border border-line bg-surface">
          <div className="flex flex-col justify-between gap-5 border-b border-line p-5 sm:p-7 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="tag border border-accent/30 px-2 py-1 font-mono text-xs text-accent">Synthetic dataset</span>
                <span className="text-xs text-muted">Client-side concept study</span>
              </div>
              <p id={`${id}-instructions`} className="mt-3 text-sm leading-relaxed text-muted">
                Compare revisions, then choose an edit to follow its evidence.
              </p>
            </div>
            <fieldset aria-describedby={`${id}-instructions`} className="min-w-0 shrink-0">
              <legend className="mb-2 font-mono text-xs text-muted">Plan view</legend>
              <div className="grid grid-cols-3 gap-1 border border-line bg-canvas p-1">
                {STUDY_VIEWS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={view === option.id}
                    aria-controls={`${id}-plan`}
                    onClick={() => setView(option.id)}
                    className={`min-h-11 px-3 py-2 text-sm font-medium ${focusRing} ${view === option.id ? 'bg-accent text-canvas' : 'text-muted hover:bg-surface hover:text-paper'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <StudyPlan id={id} view={view} selected={selected} />

            <div className="min-w-0 p-5 sm:p-7">
              <fieldset className="min-w-0">
                <legend className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">Choose a change</legend>
                <div className="space-y-2">
                  {STUDY_CHANGES.map((change) => (
                    <button
                      key={change.id}
                      type="button"
                      aria-pressed={selectedId === change.id}
                      aria-controls={`${id}-plan ${id}-evidence`}
                      onClick={() => setSelectedId(change.id)}
                      className={`flex min-h-12 w-full items-center gap-3 border px-3 py-3 text-left ${focusRing} ${selectedId === change.id ? 'border-accent/60 bg-accent/5 text-paper' : 'border-line text-muted hover:border-muted hover:text-paper'}`}
                    >
                      <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center font-mono text-xs ${selectedId === change.id ? 'bg-accent text-canvas' : 'border border-line'}`}>
                        {change.number}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="text-sm font-medium">{change.title}</span>
                        <span className="font-mono text-xs text-muted">{change.kind}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div id={`${id}-evidence`} role="region" aria-labelledby={`${id}-evidence-title`} className="mt-7 border-t border-line pt-6">
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-accent">{selected.number} / Follow the evidence</p>
                <h3 id={`${id}-evidence-title`} className="text-xl font-medium tracking-tight">{selected.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{selected.observation}</p>

                <div className="mt-4 border border-line bg-canvas p-4">
                  <dl className="space-y-2 font-mono text-xs">
                    <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                      <dt className="text-muted">entity_id</dt>
                      <dd className="break-all text-paper">{evidence.entity_id}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                      <dt className="text-muted">field</dt>
                      <dd className="break-all text-paper">{evidence.field}</dd>
                    </div>
                  </dl>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
                    <div>
                      <dt className="font-mono text-xs text-ochre">A / Before</dt>
                      <dd className="mt-1 break-words text-lg font-medium text-paper">{before}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-xs text-accent">B / After</dt>
                      <dd className="mt-1 break-words text-lg font-medium text-paper">{after}</dd>
                    </div>
                  </dl>
                  <details className="mt-4 border-t border-line pt-3">
                    <summary className={`w-fit cursor-pointer py-1 text-xs text-muted hover:text-paper ${focusRing}`}>
                      Inspect the illustrative record
                    </summary>
                    <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-muted"><code>{JSON.stringify(evidence, null, 2)}</code></pre>
                  </details>
                </div>

                <div className="mt-5 border-l-2 border-accent pl-4">
                  <h4 className="text-sm font-medium text-paper">Make it useful</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{selected.nextStep}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p role="status" aria-atomic="true" className="sr-only">
          {view === 'changes' ? 'Changes overlay' : view === 'before' ? 'Before, revision A' : 'After, revision B'}.
          {' '}Selected: {selected.title}. {before} before; {after} after.
        </p>

        <footer className="mt-5 grid gap-3 text-xs leading-relaxed text-muted md:grid-cols-[1fr_auto] md:gap-8">
          <p className="max-w-3xl">
            A hand-authored, synthetic example running locally in your browser—not a live BIM/IFC engine,
            client work, or a shipped-project claim. These are review prompts, not structural-safety or compliance decisions.
          </p>
          <p className="font-mono md:text-right">Lawrence Musyoka<br />AEC learning notes / 01</p>
        </footer>
      </div>
    </section>
  );
}
