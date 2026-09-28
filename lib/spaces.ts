import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

let spacesClient: S3Client | undefined;

function getSpacesClient() {
  if (!hasSpacesConfig()) throw new Error('DigitalOcean Spaces is not configured.');
  spacesClient ??= new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT!,
    region: process.env.DO_SPACES_REGION!,
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY!,
      secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
    forcePathStyle: false,
  });
  return spacesClient;
}

const BUCKET = process.env.DO_SPACES_BUCKET!;

function hasSpacesConfig() {
  return Boolean(
    process.env.DO_SPACES_ENDPOINT &&
      process.env.DO_SPACES_REGION &&
      process.env.DO_SPACES_KEY &&
      process.env.DO_SPACES_SECRET &&
      process.env.DO_SPACES_BUCKET,
  );
}

/**
 * Read a JSON file from DigitalOcean Spaces.
 * Returns parsed JSON or null if the key doesn't exist.
 */
export async function getJSON<T>(key: string): Promise<T | null> {
  if (!hasSpacesConfig()) {
    return null;
  }

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const response = await getSpacesClient().send(command, { abortSignal: AbortSignal.timeout(6000) });
    const body = await response.Body?.transformToString('utf-8');
    if (!body) return null;
    return JSON.parse(body) as T;
  } catch (error: unknown) {
    const code = (error as { name?: string }).name;
    if (code === 'NoSuchKey') return null;
    console.error(`[Spaces] Failed to GET ${key}:`, error);
    throw error;
  }
}

/**
 * Write a JSON value to DigitalOcean Spaces.
 */
export async function putJSON<T>(key: string, data: T): Promise<void> {
  if (!hasSpacesConfig()) {
    throw new Error('DigitalOcean Spaces is not configured.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
    ACL: 'private',
  });
  await getSpacesClient().send(command, { abortSignal: AbortSignal.timeout(10000) });
}

/**
 * Upload a binary file to DigitalOcean Spaces.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (!hasSpacesConfig()) {
    throw new Error('DigitalOcean Spaces is not configured.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });
  await getSpacesClient().send(command, { abortSignal: AbortSignal.timeout(10000) });

  // Return the CDN / public URL
  const endpoint = process.env.DO_SPACES_ENDPOINT!;
  // endpoint is like https://nyc3.digitaloceanspaces.com
  return `${endpoint}/${BUCKET}/${key}`;
}
