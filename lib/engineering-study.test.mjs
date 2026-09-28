import assert from 'node:assert/strict';
import test from 'node:test';
import {
  STUDY_CHANGES,
  STUDY_PLAN,
  STUDY_REVISIONS,
  STUDY_VIEWS,
  formatStudyValue,
  getChangeEvidence,
  getPlanDescription,
  getPlanGeometry,
  getVisibleRevisions,
} from './engineering-study.ts';

// Run with Node 22.18+ (native TypeScript stripping), no test dependency required:
// node --test lib/engineering-study.test.mjs

test('every selectable change has a unique ID and a changed field', () => {
  assert.equal(new Set(STUDY_CHANGES.map((change) => change.id)).size, 3);
  assert.equal(new Set(STUDY_CHANGES.map((change) => change.number)).size, 3);
  for (const change of STUDY_CHANGES) {
    const evidence = getChangeEvidence(change);
    assert.equal(evidence.source, 'synthetic/local');
    assert.equal(evidence.entity_id, change.entityId);
    assert.notEqual(evidence.before, evidence.after);
    assert.ok(change.observation);
    assert.ok(change.nextStep);
  }
});

test('structured evidence comes from the same snapshots as the drawing', () => {
  for (const change of STUDY_CHANGES) {
    const evidence = getChangeEvidence(change);
    assert.equal(evidence.before, STUDY_REVISIONS.before[change.field]);
    assert.equal(evidence.after, STUDY_REVISIONS.after[change.field]);
    assert.equal(evidence.unit, typeof evidence.before === 'number' ? 'mm' : null);
  }
});

test('each view draws only its intended revisions in overlay order', () => {
  assert.deepEqual(STUDY_VIEWS.map((view) => view.id), ['before', 'after', 'changes']);
  assert.deepEqual(getVisibleRevisions('before'), ['before']);
  assert.deepEqual(getVisibleRevisions('after'), ['after']);
  assert.deepEqual(getVisibleRevisions('changes'), ['before', 'after']);
});

test('switching revisions moves the partition by the recorded 600 mm', () => {
  const before = getPlanGeometry('before');
  const after = getPlanGeometry('after');
  const evidence = getChangeEvidence(STUDY_CHANGES[0]);
  assert.equal(evidence.after - evidence.before, 600);
  assert.equal(after.partitionX - before.partitionX, 600 * STUDY_PLAN.unitsPerMm);
  assert.equal((before.partitionX - before.left) / STUDY_PLAN.unitsPerMm, evidence.before);
  assert.equal((after.partitionX - after.left) / STUDY_PLAN.unitsPerMm, evidence.after);
});

test('switching revisions widens the opening and swing with a fixed hinge', () => {
  const before = getPlanGeometry('before');
  const after = getPlanGeometry('after');
  const evidence = getChangeEvidence(STUDY_CHANGES[1]);
  assert.equal(before.doorX, after.doorX);
  assert.equal(before.doorWidth / STUDY_PLAN.unitsPerMm, evidence.before);
  assert.equal(after.doorWidth / STUDY_PLAN.unitsPerMm, evidence.after);
  assert.equal(after.doorEndX - before.doorEndX, 300 * STUDY_PLAN.unitsPerMm);
  assert.equal(after.doorEndX, after.doorX + after.doorWidth);
});

test('room labels follow the property evidence, including the earlier revision', () => {
  const evidence = getChangeEvidence(STUDY_CHANGES[2]);
  assert.equal(getPlanGeometry('before').roomUse, evidence.before);
  assert.equal(getPlanGeometry('after').roomUse, evidence.after);
  assert.equal(evidence.before, 'Store');
  assert.equal(evidence.after, 'Project room');
});

test('both snapshots keep openings within their rooms and the envelope unchanged', () => {
  const before = getPlanGeometry('before');
  const after = getPlanGeometry('after');
  for (const field of ['left', 'right', 'top', 'bottom', 'dividerY', 'rightDoorX', 'rightDoorEndX']) {
    assert.equal(before[field], after[field]);
  }
  for (const plan of [before, after]) {
    assert.ok(plan.left < plan.doorX);
    assert.ok(plan.doorEndX < plan.partitionX);
    assert.ok(plan.partitionX < plan.rightDoorX);
    assert.ok(plan.rightDoorEndX < plan.right);
    assert.ok(plan.dividerY - plan.doorWidth > plan.top);
    assert.ok(plan.top < plan.dividerY && plan.dividerY < plan.bottom);
  }
});

test('readable values retain units and do not add units to text properties', () => {
  assert.equal(formatStudyValue(1200, 'mm'), '1,200 mm');
  assert.equal(formatStudyValue(0, 'mm'), '0 mm');
  assert.equal(formatStudyValue(1200, null), '1,200');
  assert.equal(formatStudyValue('Project room', null), 'Project room');
});

test('text alternatives follow every view and selected change', () => {
  for (const view of STUDY_VIEWS) {
    for (const selected of STUDY_CHANGES) {
      const description = getPlanDescription(view.id, selected);
      assert.ok(description.includes(`Selected change ${selected.number}: ${selected.title}.`));
      assert.ok(description.includes('Synthetic dimensions, not a construction drawing.'));
      for (const revision of getVisibleRevisions(view.id)) {
        for (const change of STUDY_CHANGES) {
          assert.ok(description.includes(formatStudyValue(STUDY_REVISIONS[revision][change.field], change.unit)));
        }
      }
      if (view.id === 'before') assert.ok(!description.includes('Revision B:'));
      if (view.id === 'after') assert.ok(!description.includes('Revision A:'));
      if (view.id === 'changes') assert.ok(description.includes('Dashed ochre'));
    }
  }
});
