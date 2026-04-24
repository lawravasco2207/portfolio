'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Send } from 'lucide-react';
import { useState, useTransition } from 'react';
import { sendEmail } from '@/app/actions';

export function Contact() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: 'idle', message: '' });

    startTransition(async () => {
      const result = await sendEmail(form);

      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Transmission delivered. Larry will get back to you soon.',
        });
        setForm({ name: '', email: '', company: '', message: '' });
        return;
      }

      setStatus({
        type: 'error',
        message: result.error ?? 'Transmission failed. Please try again or email directly.',
      });
    });
  };

  return (
    <section id="contact" className="py-20 px-4 flex justify-center scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        className="relative w-full max-w-4xl bg-black/40 backdrop-blur-md border border-white/10 p-12 rounded-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/5 to-blueprint-blue/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-electric-cyan/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blueprint-blue/20 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">
              INITIATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-blueprint-blue">TRANSMISSION</span>
            </h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Need a product partner who can translate an idea into shipped software, reliable
              infrastructure, and clear execution? Open a channel and share what you are building.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:syokslawrence@gmail.com"
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-electric-cyan/50 transition-all group/item"
              >
                <div className="p-3 bg-electric-cyan/10 rounded-full text-electric-cyan group-hover/item:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-mono">DIRECT_LINK</div>
                  <div className="text-white font-bold">syokslawrence@gmail.com</div>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/in/lawrence-musyoka-b58a1836a/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-blueprint-blue/50 transition-all group/item"
              >
                <div className="p-3 bg-blueprint-blue/10 rounded-full text-blueprint-blue group-hover/item:scale-110 transition-transform">
                  <Linkedin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-mono">PRO_NETWORK</div>
                  <div className="text-white font-bold">LinkedIn profile</div>
                </div>
              </a>

              <a
                href="https://github.com/lawravasco2207"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/40 transition-all group/item"
              >
                <div className="p-3 bg-white/10 rounded-full text-white group-hover/item:scale-110 transition-transform">
                  <Github className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-mono">CODEBASE</div>
                  <div className="text-white font-bold">github.com/lawravasco2207</div>
                </div>
              </a>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-mono">IDENTITY</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none transition-colors"
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-mono">COORDINATES</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none transition-colors"
                placeholder="Email address"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-mono">ORGANIZATION</label>
              <input
                type="text"
                value={form.company}
                onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none transition-colors"
                placeholder="Company / product / team"
                autoComplete="organization"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-mono">PAYLOAD</label>
              <textarea
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none h-32 transition-colors"
                placeholder="What are you building, what is blocked, and what outcome do you want?"
                required
              />
            </div>
            {status.type !== 'idle' && (
              <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {status.message}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-electric-cyan to-blueprint-blue text-deep-charcoal font-bold py-4 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
              {isPending ? 'SENDING...' : 'SEND TRANSMISSION'}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
