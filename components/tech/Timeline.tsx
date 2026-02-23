'use client';

import { motion } from 'framer-motion';

const experience = [
  {
    year: '2024 — Present',
    role: 'Founder & Lead Engineer',
    company: 'PlanMorph',
    desc: 'Architecting an AI-driven SaaS platform for engineering project management. Designing cloud-native infrastructure on DigitalOcean, building full-stack features with Next.js and PostgreSQL, and integrating AI APIs for predictive project analytics.',
    tags: ['Next.js', 'PostgreSQL', 'AI APIs', 'DigitalOcean', 'Docker'],
  },
  {
    year: '2023 — 2024',
    role: 'Full Stack Developer',
    company: 'Freelance / Contract',
    desc: 'Delivered production web applications for clients across multiple industries. Specialized in React/Next.js frontends, Node.js APIs, and cloud deployment pipelines. Focused on performance optimization and scalable architecture patterns.',
    tags: ['React', 'Node.js', 'Azure', 'TypeScript', 'CI/CD'],
  },
  {
    year: '2022 — 2023',
    role: 'Software Engineer',
    company: 'Engineering Projects',
    desc: 'Built backend microservices and optimized database query performance. Contributed to distributed system design and implemented automated testing pipelines. Gained hands-on experience with containerization and Linux server administration.',
    tags: ['Python', '.NET', 'Docker', 'Linux', 'PostgreSQL'],
  },
];

export function TechTimeline() {
  return (
    <section className="mb-20">
      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-2 font-mono">
        <span className="text-electric-cyan">{'>'}</span> SYSTEM_LOGS
      </h3>
      <p className="text-sm text-gray-500 font-mono mb-8 ml-5">
        // Experience timeline — outcome-focused
      </p>

      <div className="relative border-l border-electric-cyan/20 ml-2 md:ml-4 space-y-8 md:space-y-12">
        {experience.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-6 md:pl-8 group"
          >
            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-deep-charcoal border-2 border-electric-cyan rounded-full group-hover:bg-electric-cyan transition-colors duration-300" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
              <span className="text-electric-cyan font-mono text-xs md:text-sm shrink-0">{item.year}</span>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-lg md:text-xl font-bold text-white">{item.role}</h4>
                <span className="text-gray-500 text-xs md:text-sm">@ {item.company}</span>
              </div>
            </div>

            <p className="text-gray-400 text-sm md:text-base max-w-2xl mb-3 leading-relaxed">{item.desc}</p>

            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-cyan-300/70 bg-cyan-900/20 border border-cyan-800/30 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
