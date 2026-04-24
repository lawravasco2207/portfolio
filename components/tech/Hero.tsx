'use client';

import { motion } from 'framer-motion';
import { Download, ExternalLink, ChevronDown, MessageSquare } from 'lucide-react';

const statusData = {
  name: 'Larry',
  role: 'Full Stack Engineer & Systems Builder',
  focus: 'AI + Cloud Systems',
  status: 'Available for select builds',
  uptime: '40% efficiency lift',
};

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center -mt-20 pt-20 mb-16">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-electric-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
        {/* Left: Main content */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-green-400 tracking-wider">SYSTEM ONLINE</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[1.1] mb-2">
              SYSTEM
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-cyan-300">_OVERRIDE</span>
            </h1>

            <p className="text-sm md:text-base font-mono text-electric-cyan/80 tracking-wide mb-6">
              Full Stack Engineering // AI Systems // Cloud Infrastructure
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl font-light"
          >
            I help founders and teams ship AI-enabled products, modernize cloud platforms,
            and build dependable systems that hold up in real-world production environments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <a
              href="/assets/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 px-6 py-3 bg-electric-cyan text-deep-charcoal font-bold text-sm rounded-lg hover:bg-cyan-300 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
            >
              <Download className="w-4 h-4 group-hover:animate-bounce" />
              Download Resume
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2.5 px-6 py-3 border border-electric-cyan/30 text-electric-cyan font-bold text-sm rounded-lg hover:bg-electric-cyan/10 transition-all duration-300"
            >
              <MessageSquare className="w-4 h-4" />
              Start a Project
            </a>
            <a
              href="#impact"
              className="inline-flex items-center gap-2.5 px-6 py-3 border border-white/10 text-white font-bold text-sm rounded-lg hover:bg-white/5 transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4" />
              View Impact
            </a>
          </motion.div>
        </div>

        {/* Right: System metadata block */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="relative bg-black/60 border border-electric-cyan/20 rounded-lg p-6 font-mono text-sm backdrop-blur-sm overflow-hidden">
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,229,255,0.02)_50%)] bg-[size:100%_4px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-electric-cyan/10">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="ml-2 text-xs text-gray-500">system_metadata.json</span>
              </div>

              <div className="space-y-1.5 text-xs md:text-sm">
                <p className="text-gray-500">{'{'}</p>
                {Object.entries(statusData).map(([key, value], i) => (
                  <motion.p
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="pl-4"
                  >
                    <span className="text-cyan-400">&quot;{key}&quot;</span>
                    <span className="text-gray-500">: </span>
                    <span className={key === 'status' ? 'text-green-400' : key === 'uptime' ? 'text-yellow-300' : 'text-orange-300'}>
                      &quot;{value}&quot;
                    </span>
                    {key !== 'uptime' && <span className="text-gray-500">,</span>}
                  </motion.p>
                ))}
                <p className="text-gray-500">{'}'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-electric-cyan/10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-electric-cyan rounded-full animate-pulse" />
                <span className="text-electric-cyan/60 text-xs">Production environment online</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-5 h-5 text-electric-cyan/40 animate-bounce" />
      </motion.div>
    </section>
  );
}
