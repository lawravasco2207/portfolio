'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProjects, type Project } from '@/app/actions';
import type { MissionControlPayload, RepoTelemetry } from '@/lib/mission-control/types';

export function TechProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [repositories, setRepositories] = useState<RepoTelemetry[]>([]);

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(
        data.filter((project) => {
          const title = project.title.toLowerCase();
          return project.mode === 'tech' && (title.includes('vex') || title.includes('bridge') || title.includes('atlas'));
        }),
      );
    });
    fetch('/api/mission-control')
      .then((response) => response.json())
      .then((payload: MissionControlPayload) => setRepositories(payload.repositories))
      .catch(() => setRepositories([]));
  }, []);

  if (projects.length === 0 && repositories.length === 0) return null;

  return (
    <section id="projects" className="mb-20 scroll-mt-24">
      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-2 font-mono">
        <span className="text-electric-cyan">{'>'}</span> RUNNING_ARTIFACTS
      </h3>
      <p className="text-sm text-gray-500 font-mono mb-8 ml-5">
        {'// Vex engine, bridge, and cloud action manager'}
      </p>

      {repositories.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {repositories.map((repo) => (
            <a
              key={repo.id}
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-black/35 p-4 transition-colors hover:border-electric-cyan/35 hover:bg-white/[0.04]"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="font-bold text-white">{repo.label}</h4>
                <span className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${repo.status === 'live' ? 'border-green-400/30 text-green-300' : 'border-amber-300/30 text-amber-200'}`}>
                  {repo.status}
                </span>
              </div>
              <p className="min-h-16 text-sm leading-relaxed text-gray-400">{repo.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] text-gray-500">
                <span>{repo.language || 'multi-stack'}</span>
                <span>/</span>
                <span>{repo.releaseCount} releases</span>
                <span>/</span>
                <span>{repo.openIssues} open issues</span>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 2 }}
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
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      width={384}
                      height={128}
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
