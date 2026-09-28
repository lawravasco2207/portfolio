export type StudyView = 'before' | 'after' | 'changes';
export type StudyRevision = Exclude<StudyView, 'changes'>;
export type StudyChangeId = 'partition' | 'door' | 'room-use';

// A deliberately small, local study schema; these are not parsed BIM/IFC records.
export const STUDY_REVISIONS = {
  before: { partitionOffsetMm: 4400, doorWidthMm: 900, roomUse: 'Store' },
  after: { partitionOffsetMm: 5000, doorWidthMm: 1200, roomUse: 'Project room' },
} as const;

export const STUDY_VIEWS: ReadonlyArray<{ id: StudyView; label: string }> = [
  { id: 'before', label: 'Before' },
  { id: 'after', label: 'After' },
  { id: 'changes', label: 'Changes' },
];

export interface StudyChange {
  id: StudyChangeId;
  number: string;
  title: string;
  kind: string;
  entityId: string;
  field: keyof (typeof STUDY_REVISIONS)['before'];
  unit: 'mm' | null;
  observation: string;
  nextStep: string;
}

export const STUDY_CHANGES = [
  {
    id: 'partition',
    number: '01',
    title: 'A partition moves',
    kind: 'Position',
    entityId: 'partition-01',
    field: 'partitionOffsetMm',
    unit: 'mm',
    observation: 'The same partition sits 600 mm further right in revision B.',
    nextStep: 'I would link this edit to the adjoining spaces so a reviewer can ask whether the new layout still fits the brief.',
  },
  {
    id: 'door',
    number: '02',
    title: 'A doorway widens',
    kind: 'Dimension',
    entityId: 'door-01',
    field: 'doorWidthMm',
    unit: 'mm',
    observation: 'The opening grows from 900 to 1,200 mm without changing its study ID.',
    nextStep: 'I would flag the width change for a door-schedule review, without treating a wider opening as proof of compliance.',
  },
  {
    id: 'room-use',
    number: '03',
    title: 'A room gets a new use',
    kind: 'Property',
    entityId: 'room-02',
    field: 'roomUse',
    unit: null,
    observation: 'The right-hand room is relabeled from Store to Project room, a property edit that a geometry-only comparison could miss.',
    nextStep: 'I would surface the use change as a question for the brief, rather than infer occupancy or servicing requirements from a label.',
  },
] as const satisfies readonly StudyChange[];

export function getChangeEvidence(change: StudyChange) {
  return {
    source: 'synthetic/local',
    entity_id: change.entityId,
    field: change.field,
    unit: change.unit,
    before: STUDY_REVISIONS.before[change.field],
    after: STUDY_REVISIONS.after[change.field],
  };
}

export function formatStudyValue(value: number | string, unit: 'mm' | null) {
  return typeof value === 'number'
    ? `${value.toLocaleString('en-GB')}${unit ? ` ${unit}` : ''}`
    : value;
}

export function getVisibleRevisions(view: StudyView): readonly StudyRevision[] {
  return view === 'changes' ? ['before', 'after'] : [view];
}

export const STUDY_PLAN = {
  originX: 72,
  originY: 60,
  unitsPerMm: 0.05,
  widthMm: 9600,
  depthMm: 6000,
  corridorOffsetMm: 4400,
  doorOffsetMm: 1600,
  rightDoorOffsetMm: 7600,
  rightDoorWidthMm: 900,
} as const;

// Geometry and displayed evidence share the same snapshots, not separate mock values.
export function getPlanGeometry(revision: StudyRevision) {
  const snapshot = STUDY_REVISIONS[revision];
  const { originX: left, originY: top, unitsPerMm: scale } = STUDY_PLAN;
  const doorX = left + STUDY_PLAN.doorOffsetMm * scale;
  const doorWidth = snapshot.doorWidthMm * scale;
  const rightDoorX = left + STUDY_PLAN.rightDoorOffsetMm * scale;
  const rightDoorWidth = STUDY_PLAN.rightDoorWidthMm * scale;

  return {
    left,
    top,
    right: left + STUDY_PLAN.widthMm * scale,
    bottom: top + STUDY_PLAN.depthMm * scale,
    dividerY: top + STUDY_PLAN.corridorOffsetMm * scale,
    partitionX: left + snapshot.partitionOffsetMm * scale,
    doorX,
    doorWidth,
    doorEndX: doorX + doorWidth,
    rightDoorX,
    rightDoorWidth,
    rightDoorEndX: rightDoorX + rightDoorWidth,
    roomUse: snapshot.roomUse,
  };
}

export function getPlanDescription(view: StudyView, selected: StudyChange) {
  const revisions = getVisibleRevisions(view).map((revision) => {
    const snapshot = STUDY_REVISIONS[revision];
    return `Revision ${revision === 'before' ? 'A' : 'B'}: partition ${formatStudyValue(snapshot.partitionOffsetMm, 'mm')} from the west wall; left doorway ${formatStudyValue(snapshot.doorWidthMm, 'mm')} wide; right room labeled ${snapshot.roomUse}.`;
  });

  return [
    'Illustrative ground floor with two rooms above a shared corridor; the left room is a workroom.',
    ...revisions,
    view === 'changes'
      ? 'Dashed ochre marks show the earlier revision; solid lines show the later revision, with the selected element in lime.'
      : 'Only this revision is drawn; the selected element is highlighted in lime.',
    `Selected change ${selected.number}: ${selected.title}.`,
    'Synthetic dimensions, not a construction drawing.',
  ].join(' ');
}
