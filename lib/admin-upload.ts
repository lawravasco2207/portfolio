// Leave room for multipart overhead beneath Next's default 1 MB server-action body limit.
export const MAX_IMAGE_BYTES = 900 * 1024;

export function getUploadImageType(buffer: Buffer): { extension: string; mime: string } | null {
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null;

  if (
    buffer.length >= 4 &&
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff &&
    buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9
  ) {
    return { extension: 'jpg', mime: 'image/jpeg' };
  }

  if (
    buffer.length >= 45 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    buffer.readUInt32BE(8) === 13 &&
    buffer.toString('latin1', 12, 16) === 'IHDR' &&
    buffer.readUInt32BE(16) > 0 && buffer.readUInt32BE(20) > 0 &&
    buffer.subarray(-12).equals(Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]))
  ) {
    return { extension: 'png', mime: 'image/png' };
  }

  if (
    buffer.length >= 30 &&
    buffer.toString('latin1', 0, 4) === 'RIFF' &&
    buffer.readUInt32LE(4) === buffer.length - 8 &&
    buffer.toString('latin1', 8, 12) === 'WEBP' &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(buffer.toString('latin1', 12, 16)) &&
    buffer.readUInt32LE(16) > 0 && buffer.readUInt32LE(16) <= buffer.length - 20
  ) {
    return { extension: 'webp', mime: 'image/webp' };
  }

  return null;
}
