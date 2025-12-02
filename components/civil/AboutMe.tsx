'use client';

import { motion } from 'framer-motion';
import { Ruler, Triangle, Compass } from 'lucide-react';

export function CivilAboutMe() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20">
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blueprint-blue">01.</span> PROFILE
        </h3>
        <p className="text-blue-100/80 leading-relaxed text-sm md:text-base">
          I operate at the intersection of physical infrastructure and schematic precision. 
          In the Civil domain, I engineer resilience—analyzing structural integrity, optimizing load paths, and designing sustainable foundations.
          Every project is a study in forces and materials, requiring rigorous calculation and a commitment to safety and longevity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="p-4 border border-blueprint-blue/30 bg-blueprint-blue/5 rounded-sm">
            <Ruler className="w-6 h-6 text-blueprint-blue mb-2" />
            <h4 className="font-bold text-white">Precision</h4>
            <p className="text-xs text-blue-200/60">Schematic Accuracy</p>
          </div>
          <div className="p-4 border border-blueprint-blue/30 bg-blueprint-blue/5 rounded-sm">
            <Triangle className="w-6 h-6 text-blueprint-blue mb-2" />
            <h4 className="font-bold text-white">Stability</h4>
            <p className="text-xs text-blue-200/60">Load-Bearing Logic</p>
          </div>
        </div>
      </div>

      <div className="relative h-64 md:h-auto border border-blueprint-blue/30 bg-blueprint-blue/5 rounded-sm flex items-center justify-center overflow-hidden min-h-[250px]">
        {/* Placeholder for a 3D model or diagram */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Compass className="w-32 h-32 md:w-48 md:h-48 text-blueprint-blue animate-spin-slow" />
        </div>
        <div className="text-center z-10">
            <p className="text-blueprint-blue font-mono text-sm">AWAITING SCHEMATIC RENDER</p>
        </div>
      </div>
    </section>
  );
}
