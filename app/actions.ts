'use server';

import nodemailer from 'nodemailer';
import { getJSON, putJSON, uploadFile } from '@/lib/spaces';

const PROJECTS_KEY = 'data/projects.json';
const FEATURED_KEY = 'data/featured.json';

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
    return await getJSON<FeaturedStartup>(FEATURED_KEY);
  } catch (error) {
    console.error('Failed to read featured:', error);
    return null;
  }
}

export async function saveFeatured(featured: FeaturedStartup) {
  await putJSON(FEATURED_KEY, featured);
  return { success: true };
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
  if (password === 'I love Jacky') {
    return { success: true };
  }
  return { success: false };
}

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file uploaded' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
  const filename = `${uniqueSuffix}-${safeName}`;
  const key = `uploads/${filename}`;

  try {
    const url = await uploadFile(key, buffer, file.type || 'application/octet-stream');
    return { success: true, url };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await getJSON<Project[]>(PROJECTS_KEY);
    return data ?? [];
  } catch (error) {
    console.error('Failed to read projects:', error);
    return [];
  }
}

export async function saveProject(project: Project) {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  await putJSON(PROJECTS_KEY, projects);
  return { success: true };
}

export async function deleteProject(id: string) {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  await putJSON(PROJECTS_KEY, filtered);
  return { success: true };
}

export async function sendEmail(data: { email: string; message: string }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Terminal" <${process.env.SMTP_USER}>`,
      to: 'syokslawrence@gmail.com',
      subject: `New Transmission from ${data.email}`,
      text: `IDENTITY: ${data.email}\nPAYLOAD:\n${data.message}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #00E5FF; padding: 20px;">
          <h2>/// INCOMING TRANSMISSION ///</h2>
          <p><strong>IDENTITY:</strong> ${data.email}</p>
          <hr style="border-color: #005BCE;" />
          <p><strong>PAYLOAD:</strong></p>
          <pre style="white-space: pre-wrap; color: #fff;">${data.message}</pre>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email Error:', error);
    return { success: false };
  }
}
