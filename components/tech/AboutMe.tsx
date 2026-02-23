'use client';

import { motion } from 'framer-motion';
import { Terminal, Cpu, Network, Cloud, Code2, Rocket } from 'lucide-react';

const highlights = [
  { icon: Terminal, label: 'Full Stack', desc: 'End-to-end systems' },
  { icon: Cpu, label: 'AI Integration', desc: 'Intelligent workflows' },
  { icon: Cloud, label: 'Cloud Architecture', desc: 'Scalable infra' },
  { icon: Network, label: 'Distributed', desc: 'High-availability' },
  { icon: Code2, label: 'Clean Code', desc: 'Maintainable systems' },
  { icon: Rocket, label: 'Founder Mindset', desc: 'Product thinking' },
];

export function TechAboutMe() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20">
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 font-mono">
          <span className="text-electric-cyan">{'>'}</span> WHOAMI
        </h3>
        <p className="text-cyan-100/80 leading-relaxed font-light text-sm md:text-base">
          I am a full-stack software engineer and systems builder. I design and deploy
          scalable, production-ready systems with a focus on high-availability architectures,
          distributed systems, and AI-enhanced workflows.
        </p>
        <p className="text-cyan-100/60 leading-relaxed font-light text-sm md:text-base">
          My stack spans <span className="text-electric-cyan">Python</span>,{' '}
          <span className="text-electric-cyan">C# / .NET</span>,{' '}
          <span className="text-electric-cyan">React / Next.js</span>,{' '}
          <span className="text-electric-cyan">TypeScript</span>,{' '}
          <span className="text-electric-cyan">Node.js</span>, and{' '}
          <span className="text-electric-cyan">PostgreSQL</span> — deployed via{' '}
          <span className="text-electric-cyan">Docker</span> on{' '}
          <span className="text-electric-cyan">Azure</span>,{' '}
          <span className="text-electric-cyan">DigitalOcean</span>, and{' '}
          <span className="text-electric-cyan">AWS</span>.
        </p>
        <p className="text-cyan-100/60 leading-relaxed font-light text-sm md:text-base">
          Currently building{' '}
          <span className="text-electric-cyan font-bold">PlanMorph</span> — an AI-powered
          SaaS platform for engineering project management. I think like a founder, build
          like an engineer, and care about systems that work, scale, and last.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {highlights.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.03, borderColor: 'rgba(0, 229, 255, 0.5)' }}
            className="p-4 border border-electric-cyan/15 bg-electric-cyan/5 rounded-lg backdrop-blur-sm transition-all duration-300 cursor-default"
          >
            <item.icon className="w-5 h-5 text-electric-cyan mb-2" />
            <h4 className="font-bold text-white text-xs mb-0.5">{item.label}</h4>
            <p className="text-[10px] text-gray-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
