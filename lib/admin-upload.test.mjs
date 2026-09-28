import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getUploadImageType, MAX_IMAGE_BYTES } from './admin-upload.ts';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuoAAAAASUVORK5CYII=', 'base64');
const webp = Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA', 'base64');
const jpeg = readFileSync(new URL('../public/favicon.jpg', import.meta.url));

test('recognizes supported image bytes and returns trusted MIME types/extensions', () => {
  assert.deepEqual(getUploadImageType(jpeg), { extension: 'jpg', mime: 'image/jpeg' });
  assert.deepEqual(getUploadImageType(png), { extension: 'png', mime: 'image/png' });
  assert.deepEqual(getUploadImageType(webp), { extension: 'webp', mime: 'image/webp' });
});

test('rejects empty, oversized, unsupported, and truncated images', () => {
  for (const bytes of [
    Buffer.alloc(0), Buffer.alloc(MAX_IMAGE_BYTES + 1),
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
    Buffer.from('<!doctype html><script>alert(1)</script>'), Buffer.from('GIF89a'),
    png.subarray(0, 8), jpeg.subarray(0, 3), webp.subarray(0, 12),
    png.subarray(0, -1), jpeg.subarray(0, -2), webp.subarray(0, -1),
  ]) {
    assert.equal(getUploadImageType(bytes), null);
  }
});

test('enforces the exact 900 KB boundary even when image signatures are present', () => {
  const atLimit = Buffer.alloc(MAX_IMAGE_BYTES);
  atLimit.set(jpeg.subarray(0, 3));
  atLimit.set([0xff, 0xd9], atLimit.length - 2);
  assert.equal(getUploadImageType(atLimit)?.mime, 'image/jpeg');
  const tooLarge = Buffer.alloc(MAX_IMAGE_BYTES + 1);
  tooLarge.set(jpeg.subarray(0, 3));
  tooLarge.set([0xff, 0xd9], tooLarge.length - 2);
  assert.equal(getUploadImageType(tooLarge), null);
});

test('does not mask high-bit bytes when checking image markers', () => {
  for (const [image, offset] of [[png, 12], [webp, 0], [webp, 8], [webp, 12]]) {
    const corrupted = Buffer.from(image);
    corrupted[offset] |= 0x80;
    assert.equal(getUploadImageType(corrupted), null);
  }
});

test('rejects WebP containers with mismatched RIFF size or unsupported chunk type', () => {
  const badSize = Buffer.from(webp);
  badSize.writeUInt32LE(0, 4);
  assert.equal(getUploadImageType(badSize), null);
  const badChunk = Buffer.from(webp);
  badChunk.write('JUNK', 12);
  assert.equal(getUploadImageType(badChunk), null);
});
