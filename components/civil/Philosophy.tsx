'use client';

import { motion } from 'framer-motion';
import { Shield, Anchor, Activity } from 'lucide-react';

export function CivilPhilosophy() {
  return (
    <section className="mb-20 relative overflow-hidden p-8 border border-blueprint-blue/20 bg-blueprint-blue/5 rounded-sm">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Shield className="w-32 h-32 text-blueprint-blue" />
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
          <span className="text-blueprint-blue">04.</span> PHILOSOPHY
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h4 className="text-4xl font-bold text-white mb-4 tracking-tight">
              SUSTAINABLE <br />
              <span className="text-blueprint-blue">RESILIENCE</span>
            </h4>
            <p className="text-blue-100/80 leading-relaxed mb-6">
              Engineering is not just about building; it's about enduring. My philosophy centers on creating infrastructure that withstands the test of time and nature. 
              By integrating sustainable materials with robust structural logic, I design systems that serve communities for generations.
            </p>
            <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-300">
                    <Anchor className="w-4 h-4" />
                    <span>STABILITY_FIRST</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-300">
                    <Activity className="w-4 h-4" />
                    <span>DYNAMIC_ADAPTATION</span>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {[
                 { label: "Safety Factor", val: "2.5x" },
                 { label: "Lifespan", val: "100y" },
                 { label: "Efficiency", val: "98%" },
                 { label: "Impact", val: "Low" }
             ].map((stat, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-deep-charcoal border border-blueprint-blue/30 p-4 text-center"
                 >
                     <div className="text-2xl font-bold text-white mb-1">{stat.val}</div>
                     <div className="text-xs text-blue-300/60 uppercase tracking-widest">{stat.label}</div>
                 </motion.div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
