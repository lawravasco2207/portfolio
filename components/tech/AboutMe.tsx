'use client';

import { motion } from 'framer-motion';
import { Terminal, Cpu, Network } from 'lucide-react';

export function TechAboutMe() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20">
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 font-mono">
          <span className="text-electric-cyan">{'>'}</span> WHOAMI
        </h3>
        <p className="text-cyan-100/80 leading-relaxed font-light text-sm md:text-base">
          I engineer scalable digital ecosystems. My focus is on high-availability architectures, distributed systems, and seamless user experiences.
          From optimizing backend latency to crafting reactive frontend interfaces, I deploy robust full-stack solutions.
          Currently accelerating engineering workflows at <span className="text-electric-cyan font-bold">PlanMorph</span>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-4 border border-electric-cyan/20 bg-electric-cyan/5 rounded-lg backdrop-blur-sm">
            <Terminal className="w-6 h-6 text-electric-cyan mb-2" />
            <h4 className="font-bold text-white text-sm">Full Stack</h4>
          </div>
          <div className="p-4 border border-electric-cyan/20 bg-electric-cyan/5 rounded-lg backdrop-blur-sm">
            <Cpu className="w-6 h-6 text-electric-cyan mb-2" />
            <h4 className="font-bold text-white text-sm">AI Integration</h4>
          </div>
          <div className="p-4 border border-electric-cyan/20 bg-electric-cyan/5 rounded-lg backdrop-blur-sm">
            <Network className="w-6 h-6 text-electric-cyan mb-2" />
            <h4 className="font-bold text-white text-sm">Microservices</h4>
          </div>
        </div>
      </div>

      <div className="relative h-64 md:h-auto border border-electric-cyan/20 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden font-mono text-xs text-cyan-500/50 p-4 min-h-[250px]">
        <div className="w-full h-full overflow-hidden">
            <p>$ init system...</p>
            <p>$ loading modules...</p>
            <p className="text-electric-cyan">$ core_systems_online</p>
            <br/>
            <p>{`{`}</p>
            <p className="pl-4">"name": "Larry",</p>
            <p className="pl-4">"role": "Tech Engineer",</p>
            <p className="pl-4">"status": "Building"</p>
            <p>{`}`}</p>
        </div>
      </div>
    </section>
  );
}
