'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const socials = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/lawravasco2207', label: 'Code Repositories' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/lawrence-musyoka-b58a1836a/', label: 'Professional Network' },
  { name: 'X', icon: Twitter, href: 'https://x.com/lawravasco', label: 'Tech Discourse' },
  { name: 'Email', icon: Mail, href: 'mailto:syokslawrence@gmail.com', label: 'Direct Comms' },
];

export function SocialLinks() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6"
    >
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-end"
        >
          <span
            className="absolute right-full mr-4 px-2 py-1 text-xs font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/30"
          >
            {social.label}
          </span>
          <div
            className="p-3 rounded-full transition-all duration-300 border bg-deep-charcoal border-electric-cyan/30 text-cyan-200 hover:text-deep-charcoal hover:bg-electric-cyan hover:border-electric-cyan hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            <social.icon className="w-5 h-5" />
          </div>
        </a>
      ))}

      {/* Vertical Line Connector */}
      <div className="absolute top-full left-1/2 w-px h-24 -translate-x-1/2 mt-4 bg-gradient-to-b from-transparent via-electric-cyan/30 to-transparent" />
      <div className="absolute bottom-full left-1/2 w-px h-24 -translate-x-1/2 mb-4 bg-gradient-to-t from-transparent via-electric-cyan/30 to-transparent" />
    </motion.div>
  );
}
