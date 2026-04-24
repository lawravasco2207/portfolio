'use client';

import { useState } from 'react';
import { Download, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ResumePage() {
  const [loadError, setLoadError] = useState(false);

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
          <div className="flex items-center gap-3">
            <a
              href="/assets/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm border border-electric-cyan/30 text-electric-cyan rounded-lg hover:bg-electric-cyan/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
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

      {/* PDF Viewer */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-electric-cyan rounded-full" />
            <span>RESUME_VIEWER</span>
            <span className="text-gray-700">{'// Larry — Full Stack Engineer & Systems Architect'}</span>
          </div>

          {loadError ? (
            <div className="border border-electric-cyan/20 rounded-lg bg-black/40 p-12 text-center">
              <p className="text-gray-400 mb-4">
                Resume PDF not found. Upload your resume to{' '}
                <code className="text-electric-cyan bg-electric-cyan/10 px-2 py-0.5 rounded">
                  /public/assets/resume.pdf
                </code>
              </p>
              <a
                href="/assets/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-electric-cyan/30 text-electric-cyan rounded-lg hover:bg-electric-cyan/10 transition-colors"
              >
                <Download className="w-4 h-4" />
                Try Download Anyway
              </a>
            </div>
          ) : (
            <div className="border border-electric-cyan/20 rounded-lg overflow-hidden bg-white">
              <iframe
                src="/assets/resume.pdf"
                className="w-full h-[80vh]"
                title="Resume - Larry"
                onError={() => setLoadError(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
