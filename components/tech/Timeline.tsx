'use client';

import { motion } from 'framer-motion';

const experience = [
  {
    year: "2024 - current",
    role: "Founder & Lead Engineer",
    company: "PlanMorph",
    desc: "Architecting an AI-driven project management SaaS for engineering firms."
  },
  {
    year: "2023",
    role: "Full Stack Developer",
    company: "Freelance",
    desc: "Developed custom web solutions using Next.js and Node.js for various clients."
  },
  {
    year: "2022",
    role: "Junior Software Engineer",
    company: "Tech Corp (Intern)",
    desc: "Contributed to backend microservices in Go and optimized database queries."
  }
];

export function TechTimeline() {
  return (
    <section className="mb-20">
      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-8 font-mono">
        <span className="text-electric-cyan">{'>'}</span> SYSTEM_LOGS (EXPERIENCE)
      </h3>

      <div className="relative border-l border-electric-cyan/20 ml-2 md:ml-4 space-y-8 md:space-y-12">
        {experience.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-6 md:pl-8"
          >
            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-deep-charcoal border border-electric-cyan rounded-full" />
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                <span className="text-electric-cyan font-mono text-xs md:text-sm">{item.year}</span>
                <h4 className="text-lg md:text-xl font-bold text-white">{item.role}</h4>
                <span className="text-gray-500 text-xs md:text-sm">@ {item.company}</span>
            </div>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
