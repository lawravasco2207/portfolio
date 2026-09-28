import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { workAreas } from '../data/work-areas.ts';
import { workNotes } from '../data/work-notes.ts';

const projects = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url), 'utf8'));

test('work areas are unique and have concrete scope and tools', () => {
  assert.equal(workAreas.length, 4);
  assert.equal(new Set(workAreas.map((area) => area.id)).size, workAreas.length);
  for (const area of workAreas) {
    assert.ok(area.scope && area.questions && area.detail);
    assert.ok(area.tools.length > 0);
  }
});

test('every checked-in entry has unique identity, provenance and valid engineering areas', () => {
  assert.equal(new Set(projects.map((project) => project.id)).size, projects.length);
  const areas = new Set(workAreas.map((area) => area.id));
  for (const project of projects) {
    const note = workNotes[project.id];
    assert.ok(note, project.id);
    assert.ok(note.domain && note.source && note.problem && note.approach);
    assert.ok(note.areas.length > 0);
    assert.equal(new Set(note.areas).size, note.areas.length);
    for (const area of note.areas) assert.ok(areas.has(area));
    for (const link of [project.link, project.githubLink].filter(Boolean)) assert.equal(new URL(link).protocol, 'https:');
  }
});

test('the map and filters can expose documented work in each area', () => {
  for (const area of workAreas) {
    assert.ok(projects.some((project) => workNotes[project.id].areas.includes(area.id)), area.id);
  }
  const products = projects.filter((project) => workNotes[project.id].areas.includes('applications'));
  assert.ok(products.some((project) => project.id === 'portfolio'));
  assert.ok(products.some((project) => project.id === 'atelier'));
});

test('broader positioning does not relabel AEC projects as unrelated client work', () => {
  assert.match(workNotes.atelier.domain, /AEC/);
  assert.match(workNotes.brikto.domain, /Construction/);
  assert.match(workNotes.vex.domain, /BIM/);
  assert.equal(workNotes.portfolio.source, 'project');
  assert.equal(workNotes.portfolio.domain, 'Publishing / developer tools');
});
