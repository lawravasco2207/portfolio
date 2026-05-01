'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Braces, Cloud, Code2, Cpu, Network, Rocket } from 'lucide-react';
import type { MissionProfile } from '@/lib/mission-control/types';

const highlights = [
  { icon: Braces, label: 'Full Stack', desc: 'End-to-end systems' },
  { icon: Cpu, label: 'AI Integration', desc: 'Intelligent workflows' },
  { icon: Cloud, label: 'Cloud Architecture', desc: 'Scalable infra' },
  { icon: Network, label: 'Distributed', desc: 'High-availability' },
  { icon: Code2, label: 'Clean Code', desc: 'Maintainable systems' },
  { icon: Rocket, label: 'Founder Mindset', desc: 'Product thinking' },
];

export function TechAboutMe() {
  const [profile, setProfile] = useState<MissionProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/profile')
      .then((response) => response.json())
      .then((data) => {
        if (mounted) setProfile(data.profile);
      })
      .catch(() => {
        if (mounted) setProfile(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="about" className="grid scroll-mt-24 grid-cols-1 gap-8 md:gap-12 lg:grid-cols-[0.9fr_1.1fr] mb-12 md:mb-20">
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 font-mono">
          <span className="text-electric-cyan">{'>'}</span> /api/profile
        </h3>
        <p className="text-cyan-100/80 leading-relaxed text-sm md:text-base">
          {profile?.summary ||
            'Founder-minded full stack engineer focused on AI-enabled products, cloud infrastructure, BIM-adjacent workflows, and reliable delivery systems.'}
        </p>
        <div className="rounded-lg border border-white/10 bg-black/35 p-4 font-mono text-xs text-gray-400">
          <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3 text-electric-cyan">
            <Braces className="h-4 w-4" />
            profile.response.json
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
{JSON.stringify(
  profile || {
    name: 'Lawrence Musyoka',
    role: 'Full Stack Engineer & Systems Builder',
    status: 'syncing profile endpoint',
  },
  null,
  2,
)}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {highlights.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.03 }}
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
