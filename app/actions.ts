'use server';

import { promises as fs } from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'projects.json');

export interface Project {
  id: string;
  title: string;
  mode: 'civil' | 'tech';
  // Civil props
  category?: string;
  status?: string;
  specs?: string;
  // Tech props
  description?: string;
  stack?: string[];
  link?: string;
  githubLink?: string;
  // Shared
  imageUrl?: string;
}

export async function verifyAdmin(password: string) {
  // In a real app, use environment variables. 
  // For this specific request, we hardcode the secret phrase.
  if (password === "I love Jacky") {
    // Set a cookie or return a token in a real app
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

  // Create unique filename to prevent overwrites
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // Sanitize filename
  const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
  const filename = `${uniqueSuffix}-${safeName}`;
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return { success: true, url: `/uploads/${filename}` };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
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

  await fs.writeFile(dataPath, JSON.stringify(projects, null, 2));
  return { success: true };
}

export async function deleteProject(id: string) {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  await fs.writeFile(dataPath, JSON.stringify(filtered, null, 2));
  return { success: true };
}

import nodemailer from 'nodemailer';

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

  console.log(`Attempting to send email via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} (Secure: ${process.env.SMTP_SECURE})`);

  try {
    await transporter.sendMail({
      from: `"Portfolio Terminal" <${process.env.SMTP_USER}>`,
      to: "syokslawrence@gmail.com",
      subject: `New Transmission from ${data.email}`,
      text: `
        IDENTITY: ${data.email}
        PAYLOAD:
        ${data.message}
      `,
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
