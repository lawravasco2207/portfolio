'use client';

import { motion } from 'framer-motion';

export function TechLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white relative font-mono selection:bg-electric-cyan selection:text-black">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-electric-cyan/5 to-transparent blur-3xl" />
      </div>

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <header className="mb-12 border-b border-electric-cyan/30 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-electric-cyan tracking-tighter">
              SYSTEM_OVERRIDE
            </h2>
            <p className="text-sm text-cyan-300/70 mt-2 font-mono">
              Full Stack Engineering // AI Systems // Automation
            </p>
          </div>
          <div className="hidden md:block text-right font-mono text-xs text-cyan-500/50">
            <div>UPTIME: 99.9%</div>
            <div>LATENCY: 12ms</div>
          </div>
        </header>
        
        {children}
      </motion.div>
    </div>
  );
}
