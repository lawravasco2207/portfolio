'use client';

import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send } from 'lucide-react';

export function Contact() {
  return (
    <section className="py-20 px-4 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-black/40 backdrop-blur-md border border-white/10 p-12 rounded-2xl overflow-hidden group"
      >
        {/* Holographic Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/5 to-blueprint-blue/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-electric-cyan/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blueprint-blue/20 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">
              INITIATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-blueprint-blue">TRANSMISSION</span>
            </h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Whether you need structural precision or digital scalability, I am ready to deploy. 
              Open a channel for collaboration, inquiries, or just to talk tech.
            </p>
            
            <div className="space-y-4">
              <a href="mailto:syokslawrence@gmail.com" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-electric-cyan/50 transition-all group/item">
                <div className="p-3 bg-electric-cyan/10 rounded-full text-electric-cyan group-hover/item:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-mono">DIRECT_LINK</div>
                  <div className="text-white font-bold">syokslawrence@gmail.com</div>
                </div>
              </a>
              
              <a href="#" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-blueprint-blue/50 transition-all group/item">
                <div className="p-3 bg-blueprint-blue/10 rounded-full text-blueprint-blue group-hover/item:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-mono">SOCIAL_FEED</div>
                  <div className="text-white font-bold">@larry_engineer</div>
                </div>
              </a>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-mono">IDENTITY</label>
              <input type="text" className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none transition-colors" placeholder="Name / Org" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-mono">COORDINATES</label>
              <input type="email" className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none transition-colors" placeholder="Email Address" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-mono">PAYLOAD</label>
              <textarea className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none h-32 transition-colors" placeholder="Message content..." />
            </div>
            <button className="w-full bg-gradient-to-r from-electric-cyan to-blueprint-blue text-deep-charcoal font-bold py-4 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send className="w-5 h-5" /> SEND TRANSMISSION
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
