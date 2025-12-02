'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { HardHat, Terminal, ArrowRight, Cpu, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function PortalChoice() {
  const { setMode } = useAppStore();
  const router = useRouter();

  const handleSelect = (mode: 'civil' | 'tech') => {
    setMode(mode);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center mb-16 pointer-events-auto relative"
      >
        <div className="absolute -inset-10 bg-electric-cyan/20 blur-[100px] rounded-full opacity-20" />
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 relative z-10">
          LARRY
        </h1>
        <div className="flex items-center justify-center gap-4 text-electric-cyan font-mono text-sm tracking-[0.3em] uppercase opacity-80">
          <span className="w-8 h-[1px] bg-electric-cyan/50" />
          <span>Engineering Portfolio</span>
          <span className="w-8 h-[1px] bg-electric-cyan/50" />
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 pointer-events-auto perspective-1000 px-4 w-full max-w-4xl justify-center items-center">
        {/* Civil Option */}
        <motion.button
          whileHover={{ scale: 1.05, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('civil')}
          className="group relative w-full max-w-xs h-64 md:w-72 md:h-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blueprint-blue transition-all duration-500 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blueprint-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blueprint-blue to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 p-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blueprint-blue/10 flex items-center justify-center border border-blueprint-blue/30 group-hover:scale-110 transition-transform duration-500">
              <Building2 className="w-8 h-8 md:w-10 md:h-10 text-blueprint-blue" />
            </div>
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-blueprint-blue transition-colors">CIVIL</h3>
              <p className="text-xs text-gray-400 font-mono leading-relaxed px-2 md:px-4">
                Structural Integrity.<br/>Infrastructure Design.<br/>Sustainable Systems.
              </p>
            </div>
            <div className="mt-2 md:mt-4 flex items-center gap-2 text-xs font-bold text-blueprint-blue opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              ENTER DOMAIN <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </motion.button>

        {/* Tech Option */}
        <motion.button
          whileHover={{ scale: 1.05, rotateY: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('tech')}
          className="group relative w-full max-w-xs h-64 md:w-72 md:h-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-electric-cyan transition-all duration-500 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-electric-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-cyan to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 p-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-electric-cyan/10 flex items-center justify-center border border-electric-cyan/30 group-hover:scale-110 transition-transform duration-500">
              <Cpu className="w-8 h-8 md:w-10 md:h-10 text-electric-cyan" />
            </div>
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-electric-cyan transition-colors">TECH</h3>
              <p className="text-xs text-gray-400 font-mono leading-relaxed px-2 md:px-4">
                Full Stack Architecture.<br/>AI Integration.<br/>Scalable Solutions.
              </p>
            </div>
            <div className="mt-2 md:mt-4 flex items-center gap-2 text-xs font-bold text-electric-cyan opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              INITIALIZE SYSTEM <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
