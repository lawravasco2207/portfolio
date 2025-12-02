'use client';

import { motion } from 'framer-motion';

export function CivilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#001a33] text-white relative font-mono">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: 'linear-gradient(#005BCE 1px, transparent 1px), linear-gradient(90deg, #005BCE 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }} 
        />
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: 'linear-gradient(#005BCE 1px, transparent 1px), linear-gradient(90deg, #005BCE 1px, transparent 1px)', 
               backgroundSize: '200px 200px',
               opacity: 0.5
             }} 
        />
      </div>

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <header className="mb-12 border-b border-blueprint-blue/30 pb-4">
          <h2 className="text-3xl font-bold text-blueprint-blue tracking-widest uppercase">
            Civil Engineering Division
          </h2>
          <p className="text-sm text-blue-300/70 mt-2">
            Structural Analysis // Infrastructure Design // Project Management
          </p>
        </header>
        
        {children}
      </motion.div>
    </div>
  );
}
