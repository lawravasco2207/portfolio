'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getProjects, type Project } from '@/app/actions';

export function CivilProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(data => {
      setProjects(data.filter(p => p.mode === 'civil'));
    });
  }, []);

  return (
    <section className="mb-20">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
        <span className="text-blueprint-blue">02.</span> PROJECT LOGS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative border border-blueprint-blue/30 bg-deep-charcoal/50 p-6 hover:bg-blueprint-blue/10 transition-colors duration-300 cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-2 opacity-50">
                <div className="w-2 h-2 bg-blueprint-blue rounded-full animate-pulse" />
            </div>
            
            {project.imageUrl && (
              <div className="mb-4 h-32 overflow-hidden rounded border border-blueprint-blue/20">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blueprint-blue transition-colors">
              {project.title}
            </h4>
            <p className="text-sm text-blue-300 mb-4">{project.category}</p>
            
            <div className="border-t border-blueprint-blue/20 pt-4 mt-4">
                <div className="flex justify-between text-xs text-blue-200/60 font-mono">
                    <span>STATUS:</span>
                    <span className="text-white">{project.status}</span>
                </div>
                <div className="flex justify-between text-xs text-blue-200/60 font-mono mt-1">
                    <span>SPECS:</span>
                    <span className="text-white">{project.specs}</span>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
