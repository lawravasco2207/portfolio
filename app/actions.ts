'use server';

import nodemailer from 'nodemailer';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { getJSON, putJSON, uploadFile } from '@/lib/spaces';
import {
  ADMIN_SESSION_SECONDS,
  createAdminLoginLimiter,
  createAdminSession,
  getAdminConfig,
  matchesAdminPassword,
  verifyAdminSession,
} from '@/lib/admin-auth';
import { getUploadImageType, MAX_IMAGE_BYTES } from '@/lib/admin-upload';
import localFeatured from '@/data/featured.json';
import localProjects from '@/data/projects.json';

const PROJECTS_KEY = 'data/projects.json';
const FEATURED_KEY = 'data/featured.json';
const ADMIN_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-portfolio-admin' : 'portfolio-admin';
const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: ADMIN_SESSION_SECONDS,
};
const consumeLoginAttempt = createAdminLoginLimiter();

type AdminActionFailure = { success: false; error: string; code?: 'UNAUTHORIZED' };

async function isAdminAuthenticated(): Promise<boolean> {
  const config = getAdminConfig();
  if (!config) return false;
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value, config);
}

async function requireAdmin(): Promise<AdminActionFailure | null> {
  return await isAdminAuthenticated() ? null : {
    success: false,
    code: 'UNAUTHORIZED',
    error: 'Your admin session has expired or is unavailable. Please sign in again.',
  };
}

export async function getAdminSession() {
  return { authenticated: await isAdminAuthenticated() };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, '', { ...ADMIN_COOKIE_OPTIONS, maxAge: 0, expires: new Date(0) });
  return { success: true as const };
}

export interface FeaturedStartup {
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  liveUrl: string;
  githubUrl: string;
  caseStudy: string;
  caseStudyPoints: string[];
}

export async function getFeatured(): Promise<FeaturedStartup | null> {
  try {
    const data = await getJSON<FeaturedStartup>(FEATURED_KEY);
    return data ?? (localFeatured as FeaturedStartup);
  } catch (error) {
    console.error('Failed to read featured:', error);
    return localFeatured as FeaturedStartup;
  }
}

export async function saveFeatured(featured: FeaturedStartup) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await putJSON(FEATURED_KEY, featured);
    return { success: true as const };
  } catch (error) {
    console.error('Failed to save featured:', error);
    return { success: false as const, error: 'Could not save the featured startup. Please try again.' };
  }
}

export interface Project {
  id: string;
  title: string;
  mode: 'tech';
  description?: string;
  stack?: string[];
  link?: string;
  githubLink?: string;
  imageUrl?: string;
}

export async function verifyAdmin(password: string) {
  const config = getAdminConfig();
  if (!config) {
    return { success: false as const, error: 'Admin sign-in is not configured.' };
  }
  const attempt = consumeLoginAttempt();
  if (!attempt.allowed) {
    return {
      success: false as const,
      error: `Too many sign-in attempts. Try again in ${Math.ceil(attempt.retryAfterSeconds / 60)} minute(s).`,
    };
  }
  if (!matchesAdminPassword(password, config)) {
    return { success: false as const, error: 'Incorrect password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSession(config), ADMIN_COOKIE_OPTIONS);
  return { success: true as const };
}

export async function uploadImage(formData: FormData) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const file = formData instanceof FormData ? formData.get('file') : null;
  if (!(file instanceof File) || file.size === 0) {
    return { success: false as const, error: 'Please choose an image to upload.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false as const, error: 'Images must be 900 KB or smaller.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageType = getUploadImageType(buffer);
    if (!imageType) {
      return { success: false as const, error: 'Only JPEG, PNG, and WebP image files are supported.' };
    }
    // Neither the supplied filename nor browser MIME type is trusted.
    const key = `uploads/${randomUUID()}.${imageType.extension}`;
    const url = await uploadFile(key, buffer, imageType.mime);
    return { success: true as const, url };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false as const, error: 'Upload failed. Please try again.' };
  }
}

function publicProject(project: Project): Project {
  if (project.id !== 'vex-atlas') return project;
  // Older Spaces documents may still contain an internal repository URL.
  const safe = { ...project };
  delete safe.githubLink;
  delete safe.link;
  return safe;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await getJSON<Project[]>(PROJECTS_KEY);
    return (data ?? (localProjects as Project[])).map(publicProject);
  } catch (error) {
    console.error('Failed to read projects:', error);
    return (localProjects as Project[]).map(publicProject);
  }
}

export async function saveProject(project: Project) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    // Only a genuinely missing document may seed a write from bundled content.
        const projects = [...(await getJSON<Project[]>(PROJECTS_KEY) ?? localProjects as Project[])];
    const index = projects.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    await putJSON(PROJECTS_KEY, projects.map(publicProject));
    return { success: true as const };
  } catch (error) {
    console.error('Failed to save project:', error);
    return { success: false as const, error: 'Could not save the project. Please try again.' };
  }
}

export async function deleteProject(id: string) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const projects = await getJSON<Project[]>(PROJECTS_KEY) ?? localProjects as Project[];
    const filtered = projects.filter((p) => p.id !== id);
    await putJSON(PROJECTS_KEY, filtered.map(publicProject));
    return { success: true as const };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { success: false as const, error: 'Could not delete the project. Please try again.' };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function hasControlCharacters(value: string) {
  return Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
}

function isValidEmail(email: string) {
  const parts = email.split('@');
  const [local, domain] = parts;
  return Boolean(
    parts.length === 2 &&
    local && local.length <= 64 &&
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) &&
    !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') &&
    domain && domain.includes('.') &&
    domain.split('.').every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)),
  );
}

export async function sendEmail(data: {
  name?: string;
  company?: string;
  email: string;
  message: string;
}) {
  if (
    !data || typeof data !== 'object' || Array.isArray(data) ||
    typeof data.email !== 'string' || typeof data.message !== 'string' ||
    (data.name !== undefined && typeof data.name !== 'string') ||
    (data.company !== undefined && typeof data.company !== 'string')
  ) {
    return { success: false, error: 'Please provide valid contact details.' };
  }
  if (
    data.email.length > 254 || data.message.length > 5000 ||
    (data.name?.length ?? 0) > 100 || (data.company?.length ?? 0) > 200
  ) {
    return { success: false, error: 'Please keep your name under 100 characters, company under 200, email under 254, and message under 5,000.' };
  }
  if ([data.email, data.name ?? '', data.company ?? ''].some(hasControlCharacters) || data.message.includes('\0')) {
    return { success: false, error: 'Contact details contain unsupported characters.' };
  }

  const email = data.email.trim();
  const message = data.message.trim();
  const name = data.name?.trim() || 'Portfolio visitor';
  const company = data.company?.trim() || 'Not provided';

  if (!isValidEmail(email)) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  if (message.length < 10) {
    return { success: false, error: 'Please add a little more detail to your message.' };
  }

  const smtpPort = Number(process.env.SMTP_PORT);
  if (
    !process.env.SMTP_HOST ||
    !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535 ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return { success: false, error: 'Contact service is not configured right now.' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: { name: 'Portfolio contact', address: process.env.SMTP_USER },
      to: 'syokslawrence@gmail.com',
      replyTo: { name, address: email },
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Portfolio contact</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email Error:', error);
    return { success: false, error: 'Your message could not be sent. Please try again later.' };
  }
}
