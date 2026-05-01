'use client';

import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { LiveClock } from '@/components/mission-control/LiveClock';

export function TechLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-electric-cyan selection:text-black">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,229,255,0.025)_50%)] bg-[size:100%_5px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="font-mono text-lg font-black tracking-tight text-white">
            MISSION<span className="text-electric-cyan">_CONTROL</span>
          </a>
          <nav className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-gray-500 sm:justify-end">
            <a href="#impact" className="transition-colors hover:text-electric-cyan">Impact</a>
            <a href="#about" className="transition-colors hover:text-electric-cyan">API</a>
            <a href="#projects" className="transition-colors hover:text-electric-cyan">Artifacts</a>
            <a href="#contact" className="transition-colors hover:text-electric-cyan">Contact</a>
            <span className="hidden text-gray-700 sm:inline">/</span>
            <LiveClock />
          </nav>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        id="top"
        className="relative z-10 container mx-auto px-4 py-8 md:py-12"
      >
        {children}
      </motion.div>

      <Footer />
    </div>
  );
}
