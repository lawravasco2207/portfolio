'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Cloud, Container, Layers, Network, Workflow,
} from 'lucide-react';
import type { CapabilityConfig } from '@/lib/mission-control/types';

const capabilities = [
  {
    icon: Layers,
    title: 'Full Stack Architecture',
    modules: ['React / Next.js', 'Node.js / .NET', 'PostgreSQL', 'REST & GraphQL APIs'],
  },
  {
    icon: Brain,
    title: 'AI Systems Engineering',
    modules: ['AI API Integration', 'Prompt Engineering', 'LLM Workflows', 'Intelligent Automation'],
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    modules: ['Microsoft Azure', 'DigitalOcean', 'AWS Fundamentals', 'Cloud-Native Deployment'],
  },
  {
    icon: Network,
    title: 'Distributed Systems',
    modules: ['High-Availability Architectures', 'Backend Optimization', 'Scalable Data Pipelines', 'Event-Driven Design'],
  },
  {
    icon: Container,
    title: 'DevOps & Deployment',
    modules: ['Docker', 'CI/CD Pipelines', 'Linux Administration', 'Infrastructure as Code'],
  },
  {
    icon: Workflow,
    title: 'Automation & Workflow',
    modules: ['AI-Enhanced Workflows', 'Process Optimization', 'Monitoring & Observability', 'System Integration'],
  },
];

export function CapabilitiesMatrix() {
  const [liveCapabilities, setLiveCapabilities] = useState<CapabilityConfig[] | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/changelog')
      .then((response) => response.json())
      .then((data) => {
        if (mounted) setLiveCapabilities(data.capabilities);
      })
      .catch(() => {
        if (mounted) setLiveCapabilities(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const items = liveCapabilities?.map((capability, index) => ({
    icon: capabilities[index % capabilities.length].icon,
    title: capability.label,
    modules: capability.modules,
    source: capability.source,
  })) || capabilities.map((capability) => ({ ...capability, source: 'local fallback' }));

  return (
    <section className="mb-20">
      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-2 font-mono">
        <span className="text-electric-cyan">{'>'}</span> CAPABILITIES_MATRIX
      </h3>
      <p className="text-sm text-gray-500 font-mono mb-8 ml-5">
        {'// Active modules sourced from /api/changelog'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((cap, index) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -2 }}
            className="group relative bg-black/35 border border-white/10 rounded-lg p-5 backdrop-blur-sm transition-all duration-300 hover:bg-black/60 hover:border-electric-cyan/35"
          >
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-electric-cyan/20 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-electric-cyan/10 rounded-lg border border-electric-cyan/20 group-hover:bg-electric-cyan/15 transition-colors">
                <cap.icon className="w-5 h-5 text-electric-cyan" />
              </div>
              <h4 className="font-bold text-white text-sm tracking-wide">{cap.title}</h4>
            </div>

            <ul className="space-y-1.5">
              {cap.modules.map((mod) => (
                <li key={mod} className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                  <span className="w-1 h-1 bg-electric-cyan/50 rounded-full shrink-0" />
                  {mod}
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-[10px] text-green-400/70 font-mono uppercase tracking-wider leading-relaxed">{cap.source}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
