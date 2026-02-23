'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Github, Globe, Cloud, Database, Cpu } from 'lucide-react';
import { getFeatured, type FeaturedStartup } from '@/app/actions';

const archTags = [
  { icon: Cloud, label: 'Cloud-Native' },
  { icon: Database, label: 'PostgreSQL' },
  { icon: Cpu, label: 'AI-Powered' },
];

export function PlanMorphShowcase() {
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const [featured, setFeatured] = useState<FeaturedStartup | null>(null);

  useEffect(() => {
    getFeatured().then(setFeatured);
  }, []);

  if (!featured) return null;

  return (
    <section className="relative rounded-2xl overflow-hidden border border-electric-cyan/20 bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 mb-20">
      {/* Featured badge */}
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-electric-cyan border border-electric-cyan/30 px-3 py-1 rounded-full bg-cyan-950/30">
          <Sparkles className="w-3 h-3" />
          FEATURED STARTUP
        </div>
      </div>

      <div className="relative z-10 max-w-3xl">
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
          {featured.title}
        </h3>
        <p className="text-sm font-mono text-electric-cyan/60 mb-4">
          {featured.tagline}
        </p>
        <p className="text-base md:text-lg text-gray-300 mb-6 font-light leading-relaxed">
          {featured.description}
        </p>

        {/* Architecture tags */}
        <div className="flex flex-wrap gap-3 mb-6">
          {archTags.map((tag) => (
            <div
              key={tag.label}
              className="flex items-center gap-2 px-3 py-1.5 bg-electric-cyan/5 border border-electric-cyan/20 rounded-lg text-xs font-mono text-cyan-300"
            >
              <tag.icon className="w-3.5 h-3.5" />
              {tag.label}
            </div>
          ))}
        </div>

        {/* Stack indicators */}
        <div className="flex flex-wrap gap-2 mb-8">
          {featured.stack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {featured.liveUrl && (
            <a
              href={featured.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-6 py-3 bg-electric-cyan text-deep-charcoal font-bold rounded-lg hover:bg-cyan-300 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Launch Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
          {featured.githubUrl && (
            <a
              href={featured.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
          )}
          {featured.caseStudy && (
            <button
              onClick={() => setShowCaseStudy(!showCaseStudy)}
              className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              Case Study
              {showCaseStudy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Deployment badges */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Production
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            DigitalOcean App Platform
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            CI/CD Active
          </div>
        </div>

        <AnimatePresence>
          {showCaseStudy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-gray-300 text-sm leading-relaxed">
                <h4 className="text-electric-cyan font-bold mb-3 font-mono text-xs tracking-wider">
                  CASE STUDY: AUTOMATING ENGINEERING EFFICIENCY
                </h4>
                <p className="mb-4">{featured.caseStudy}</p>
                <ul className="space-y-2 text-gray-400">
                  {featured.caseStudyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-electric-cyan mt-1">▸</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Abstract background graphic */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-electric-cyan/10 rounded-full blur-3xl" />
    </section>
  );
}
