'use client';

import { motion } from 'framer-motion';

const skills = [
  "React", "Next.js", "TypeScript", "Node.js", 
  "Python", "PostgreSQL", "Docker", "AWS",
  "TailwindCSS", "Three.js", "Git", "Linux"
];

export function TechSkills() {
  return (
    <section className="mb-20">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8 font-mono">
        <span className="text-electric-cyan">{'>'}</span> TECH_STACK
      </h3>

      <div className="flex flex-wrap gap-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 229, 255, 0.15)" }}
            className="px-5 py-2 border border-electric-cyan/30 rounded-full text-cyan-100 text-sm font-mono cursor-default bg-deep-charcoal hover:border-electric-cyan transition-colors duration-200"
          >
            {skill}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
