'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Bot, Cloud, Gauge } from 'lucide-react';

const impactSignals = [
  {
    icon: Gauge,
    label: 'Operational lift',
    title: 'Reduced resource idle time by 40% in beta trials',
    description:
      'I focus on bottlenecks that slow teams down, then turn them into measurable workflow gains.',
  },
  {
    icon: Cloud,
    label: 'Reliable delivery',
    title: 'Cloud-native systems with zero-downtime deployment paths',
    description:
      'From infrastructure to release flow, I build delivery pipelines that stay stable under production pressure.',
  },
  {
    icon: Bot,
    label: 'Applied AI',
    title: 'Automation that supports real execution, not just demos',
    description:
      'I integrate AI where it improves planning, throughput, and decision-making for the people using the product.',
  },
];

const collaborationFits = [
  'Founders turning a strong idea into a production-ready product',
  'Teams modernizing internal tools, delivery workflows, or customer-facing platforms',
  'Businesses that want AI features tied to practical outcomes and reliable operations',
];

export function ImpactSnapshot() {
  return (
    <section id="impact" className="mb-20">
      <div className="mb-8 max-w-3xl">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-2 font-mono">
          <span className="text-electric-cyan">{'>'}</span> IMPACT_VECTOR
        </h3>
        <p className="text-sm text-gray-500 font-mono mb-4 ml-5">
          // Outcome-focused engineering value
        </p>
        <p className="text-cyan-100/70 leading-relaxed text-sm md:text-base">
          The strongest portfolios do more than list tools. They show what changes after the
          work is delivered, who benefits, and where the engineering effort creates leverage.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {impactSignals.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4, borderColor: 'rgba(0, 229, 255, 0.45)' }}
              className="rounded-2xl border border-electric-cyan/15 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300"
            >
              <div className="mb-4 inline-flex rounded-lg border border-electric-cyan/20 bg-electric-cyan/10 p-2 text-electric-cyan">
                <signal.icon className="w-5 h-5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/60 font-mono mb-3">
                {signal.label}
              </p>
              <h4 className="text-white font-semibold text-lg leading-snug mb-3">{signal.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{signal.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-electric-cyan/15 bg-gradient-to-br from-electric-cyan/10 via-white/[0.03] to-transparent p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/60 font-mono mb-3">
            best fit engagements
          </p>
          <h4 className="text-2xl font-bold text-white mb-4">
            I help teams move from ambition to shipped systems.
          </h4>
          <ul className="space-y-3 mb-6">
            {collaborationFits.map((fit) => (
              <li key={fit} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                <ArrowUpRight className="w-4 h-4 text-electric-cyan mt-0.5 shrink-0" />
                <span>{fit}</span>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-electric-cyan/30 px-4 py-3 text-sm font-semibold text-electric-cyan hover:bg-electric-cyan/10 transition-colors"
          >
            Start a conversation
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
