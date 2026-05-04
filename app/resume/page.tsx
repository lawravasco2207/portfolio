'use client';

import { Download, ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const resumePages = [
  { src: '/assets/resume-page-1.png', alt: 'Lawrence Musyoka resume page 1' },
  { src: '/assets/resume-page-2.png', alt: 'Lawrence Musyoka resume page 2' },
];

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <div className="border-b border-electric-cyan/20 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-electric-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <a
              href="/assets/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm border border-electric-cyan/30 text-electric-cyan rounded-lg hover:bg-electric-cyan/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open PDF
            </a>
            <a
              href="/assets/LawrenceMusyoka_Resume.docx"
              download
              className="flex items-center gap-2 px-4 py-2 text-sm border border-white/15 text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <FileText className="w-4 h-4" />
              DOCX Source
            </a>
            <a
              href="/assets/resume.pdf"
              download
              className="flex items-center gap-2 px-4 py-2 text-sm bg-electric-cyan text-deep-charcoal font-bold rounded-lg hover:bg-cyan-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-electric-cyan rounded-full" />
            <span>RESUME_VIEWER</span>
            <span className="text-gray-700">{'// Lawrence Musyoka — Mission Control document surface'}</span>
          </div>

          <div className="mb-4 rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-gray-400">
            <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-electric-cyan">
              <FileText className="h-4 w-4" />
              document routing
            </div>
            <p>
              Resume pages are rendered directly below for reliable viewing. PDF and DOCX versions remain available for download.
            </p>
          </div>

          <div className="space-y-6">
            {resumePages.map((page, index) => (
              <div
                key={page.src}
                className="scroll-mt-28 overflow-hidden rounded-lg border border-electric-cyan/20 bg-white shadow-[0_0_35px_rgba(0,229,255,0.08)]"
              >
                <Image
                  src={page.src}
                  alt={page.alt}
                  width={1191}
                  height={1684}
                  priority={index === 0}
                  className="h-auto w-full"
                />
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/40 p-4">
              <a
                href="/assets/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-electric-cyan/30 px-4 py-2 text-sm text-electric-cyan transition-colors hover:bg-electric-cyan/10"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF
              </a>
              <a
                href="/assets/resume.pdf"
                download
                className="inline-flex items-center gap-2 rounded-lg bg-electric-cyan px-4 py-2 text-sm font-bold text-deep-charcoal transition-colors hover:bg-cyan-300"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
