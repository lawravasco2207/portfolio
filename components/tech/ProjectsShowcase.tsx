'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProjects, type Project } from '@/app/actions';

export function TechProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(data => {
      setProjects(data.filter(p => p.mode === 'tech'));
    });
  }, []);

  return (
    <section className="mb-20">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8 font-mono">
        <span className="text-electric-cyan">{'>'}</span> REPOSITORIES
      </h3>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative border-l-2 border-electric-cyan/30 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 hover:border-electric-cyan"
          >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        {project.title}
                        <span className="text-xs font-normal text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded-full">Public</span>
                    </h4>
                    
                    {project.imageUrl && (
                      <div className="mb-4 h-32 w-full max-w-sm overflow-hidden rounded border border-electric-cyan/20">
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}

                    <p className="text-gray-400 mb-4 max-w-xl">{project.description}</p>
                    <div className="flex gap-2">
                        {project.stack?.map(tech => (
                            <span key={tech} className="text-xs font-mono text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {project.githubLink && (
                        <a 
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Github className="w-5 h-5 text-white" />
                        </a>
                    )}
                    {project.link && (
                        <a 
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ExternalLink className="w-5 h-5 text-white" />
                        </a>
                    )}
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
