'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProjects, type Project } from '@/app/actions';

export function TechProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data.filter((p) => p.mode === 'tech'));
    });
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="mb-20">
      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-2 font-mono">
        <span className="text-electric-cyan">{'>'}</span> REPOSITORIES
      </h3>
      <p className="text-sm text-gray-500 font-mono mb-8 ml-5">
        // Open source & production deployments
      </p>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ borderColor: 'rgba(0, 229, 255, 0.5)' }}
            className="group relative border-l-2 border-electric-cyan/30 bg-white/5 p-6 transition-all duration-300 hover:bg-white/[0.08] rounded-r-lg"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg md:text-xl font-bold text-white">
                    {project.title}
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                    Public
                  </span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-[10px] text-green-400/70 font-mono">Active</span>
                  </div>
                </div>

                {project.imageUrl && (
                  <div className="mb-4 h-32 w-full max-w-sm overflow-hidden rounded border border-electric-cyan/20">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                )}

                <p className="text-gray-400 mb-4 max-w-xl text-sm leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2">
                  {project.stack?.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-mono text-cyan-300/80 bg-cyan-900/20 border border-cyan-800/30 px-2.5 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 ml-4">
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-electric-cyan/20"
                    title="View Source"
                  >
                    <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  </a>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-electric-cyan/20"
                    title="Live Demo"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
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
