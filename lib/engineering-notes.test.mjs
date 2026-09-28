import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { engineeringNotes, getEngineeringNote } from '../data/engineering-notes.ts';

// Node 22.18+ native TypeScript stripping; no generated files or network access.
const projects = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url), 'utf8'));

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function assertText(value, label) {
  assert.equal(typeof value, 'string', `${label} must be text`);
  assert.ok(value.trim().length > 0, `${label} must not be empty`);
}

test('the notebook has three distinct, stable, URL-safe routes and note numbers', () => {
  assert.deepEqual(engineeringNotes.map((note) => note.slug), [
    'idempotency-and-retries',
    'localhost-trust-boundaries',
    'ai-output-validation',
  ]);
  assertUnique(engineeringNotes.map((note) => note.slug), 'Slugs');
  assertUnique(engineeringNotes.map((note) => note.number), 'Note numbers');
  for (const [index, note] of engineeringNotes.entries()) {
    assert.match(note.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(note.number, String(index + 1).padStart(2, '0'));
    assert.equal(getEngineeringNote(note.slug), note);
  }
});

test('unknown and noncanonical slugs do not resolve to an article', () => {
  for (const slug of ['', 'missing-note', '__proto__', 'constructor', 'IDEMPOTENCY-AND-RETRIES', '../notes', 'ai-output-validation/']) {
    assert.equal(getEngineeringNote(slug), undefined);
  }
});

test('every note provides complete reference content without publication metadata', () => {
  for (const note of engineeringNotes) {
    for (const field of ['title', 'category', 'description', 'question', 'scope', 'invariant']) {
      assertText(note[field], `${note.slug}.${field}`);
    }
    assert.ok(note.sections.length >= 5, `${note.slug} needs a substantial reference body`);
    assert.ok(note.sections.at(-1).points.length >= 4, `${note.slug} ends with failure checks`);
    for (const field of ['publishedAt', 'date', 'readingTime', 'readTime']) {
      assert.equal(Object.hasOwn(note, field), false);
    }
    for (const section of note.sections) {
      assertText(section.title, `${note.slug}.${section.id}.title`);
      assert.ok(section.paragraphs.length > 0);
      for (const paragraph of section.paragraphs) assertText(paragraph, section.id);
      if (section.points) {
        assert.ok(section.points.length > 0);
        assertUnique(section.points.map((point) => point.label), `${section.id} point labels`);
        for (const point of section.points) {
          assertText(point.label, section.id);
          assertText(point.detail, section.id);
        }
      }
    }
  }
});

test('contents anchors, headings, and code captions have unique fragment identifiers', () => {
  for (const note of engineeringNotes) {
    const fragments = ['note-main', 'note-title', 'source-context', 'source-context-title', 'related-notes-title'];
    for (const section of note.sections) {
      assert.match(section.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      fragments.push(section.id, `${section.id}-title`);
      if (section.code) fragments.push(`${section.id}-code-caption`);
    }
    assertUnique(fragments, `${note.slug} document IDs`);
  }
});

test('code examples are nonempty and explicitly illustrative; JSON examples parse', () => {
  for (const note of engineeringNotes) {
    const examples = note.sections.flatMap((section) => section.code ? [section.code] : []);
    assert.ok(examples.length > 0, `${note.slug} needs an illustrative example`);
    for (const example of examples) {
      assertText(example.language, 'Example language');
      assertText(example.source, 'Example source');
      assert.match(example.caption, /illustrative/i);
      if (example.language === 'JSON' || example.language === 'JSON Schema') {
        assert.doesNotThrow(() => JSON.parse(example.source), example.caption);
      }
    }
  }
});

test('related notes resolve, are not self-links, and connect the complete notebook', () => {
  for (const note of engineeringNotes) {
    assertUnique(note.relatedSlugs, `${note.slug} related links`);
    assert.equal(note.relatedSlugs.length, engineeringNotes.length - 1);
    for (const slug of note.relatedSlugs) {
      assert.notEqual(slug, note.slug);
      const related = getEngineeringNote(slug);
      assert.ok(related, `${slug} must resolve`);
      assert.ok(related.relatedSlugs.includes(note.slug), 'Cross-links should be reciprocal');
    }
  }
});

test('provenance references existing files and actual checked-in project identities', () => {
  const projectIds = new Set(projects.map((project) => project.id));
  for (const note of engineeringNotes) {
    assert.ok(note.references.length > 0, `${note.slug} needs source context`);
    assertUnique(note.references.map((reference) => reference.label), `${note.slug} reference labels`);
    for (const reference of note.references) {
      assertText(reference.label, 'Reference label');
      assertText(reference.detail, 'Reference limits');
      assertText(reference.linkLabel, 'Reference link label');
      assert.ok(['/work', '/resume'].includes(reference.href));
      assert.ok(reference.paths.length > 0);
      for (const path of reference.paths) {
        assert.match(path, /^(components|data|lib)\/[a-zA-Z0-9/._-]+$/);
        assert.ok(!path.includes('..'), 'Provenance stays inside the project');
        assert.ok(statSync(new URL(`../${path}`, import.meta.url)).isFile(), `${path} must exist`);
      }
      for (const id of reference.projectIds) {
        assert.ok(projectIds.has(id), `${id} must be an existing project`);
        assert.equal(reference.href, '/work', 'Project references lead to the work index');
      }
    }
  }
});
