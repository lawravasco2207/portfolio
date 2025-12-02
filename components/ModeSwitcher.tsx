'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { HardHat, Terminal } from 'lucide-react';

export function ModeSwitcher() {
  const { mode, setMode } = useAppStore();

  if (mode === 'entry') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-deep-charcoal/80 backdrop-blur-md border border-white/10 shadow-2xl"
    >
      <button
        onClick={() => setMode('civil')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
          mode === 'civil'
            ? "bg-blueprint-blue text-white shadow-[0_0_20px_rgba(0,91,206,0.5)]"
            : "text-fog-gray hover:text-white hover:bg-white/5"
        )}
      >
        <HardHat className="w-4 h-4" />
        <span>Civil</span>
      </button>

      <button
        onClick={() => setMode('tech')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
          mode === 'tech'
            ? "bg-electric-cyan text-deep-charcoal shadow-[0_0_20px_rgba(0,229,255,0.5)]"
            : "text-fog-gray hover:text-white hover:bg-white/5"
        )}
      >
        <Terminal className="w-4 h-4" />
        <span>Tech</span>
      </button>
    </motion.div>
  );
}
