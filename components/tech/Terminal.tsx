'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendEmail } from '@/app/actions';

const HELP_TEXT = `Available commands:
  help      — Show available commands
  whoami    — Display identity
  projects  — List active projects
  resume    — Get resume link
  contact   — Send a message
  stack     — Show tech stack
  deploy    — View deployment status
  clear     — Clear terminal`;

const WHOAMI_TEXT = `{
  "name": "Larry",
  "role": "Full Stack Engineer & Systems Architect",
  "focus": "AI + Cloud Systems",
  "location": "Building from anywhere",
  "status": "Deploying production systems"
}`;

const PROJECTS_TEXT = `ACTIVE DEPLOYMENTS:
  [01] PlanMorph — AI-powered engineering project management (LIVE)
       → https://tech.planmorph.software/
  
  [02] Portfolio — This system you are currently interfacing with
       → Built with Next.js, TypeScript, TailwindCSS

Type 'resume' to download my CV or 'contact' to open a channel.`;

const STACK_TEXT = `LOADED MODULES:
  Languages:    Python, C#, TypeScript, JavaScript
  Frontend:     React, Next.js, TailwindCSS
  Backend:      Node.js, .NET, REST APIs
  Database:     PostgreSQL
  DevOps:       Docker, Git, Linux, CI/CD
  Cloud:        Azure, DigitalOcean, AWS
  AI:           API Integration, Prompt Engineering, LLM Workflows`;

const DEPLOY_TEXT = `DEPLOYMENT STATUS:
  ┌─────────────────────────────────┐
  │ System:    Portfolio v2.0       │
  │ Platform:  DigitalOcean         │
  │ Status:    ● ONLINE             │
  │ Uptime:    99.99%               │
  │ Region:    NYC                  │
  │ Build:     stable               │
  │ Pipeline:  GitHub → Docker → DO │
  └─────────────────────────────────┘`;

export function TechTerminal() {
  const [history, setHistory] = useState<string[]>(['LarryOS v2.0 — Production Environment', 'Type "help" for available commands.', '']);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'command' | 'email' | 'message'>('command');
  const [contactData, setContactData] = useState({ email: '', message: '' });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const val = input.trim();
      if (!val) return;
      const newHistory = [...history, `$ ${val}`];

      if (mode === 'email') {
        setContactData((prev) => ({ ...prev, email: val }));
        setMode('message');
        setHistory([...newHistory, 'Identity verified. Enter your message payload:']);
        setInput('');
        return;
      }

      if (mode === 'message') {
        setContactData((prev) => ({ ...prev, message: val }));
        setMode('command');
        setHistory([...newHistory, 'Encrypting payload...', 'Transmitting...']);
        setInput('');

        const result = await sendEmail({ email: contactData.email, message: val });

        if (result.success) {
          setHistory((h) => [...h, '[====================] 100%', '✓ Transmission successful. Stand by for response.', '']);
        } else {
          setHistory((h) => [...h, '[✗] Transmission failed. Check network logs.', '']);
        }
        return;
      }

      // Command mode
      const cmd = val.toLowerCase();
      let response = '';

      switch (cmd) {
        case 'help':
          response = HELP_TEXT;
          break;
        case 'whoami':
          response = WHOAMI_TEXT;
          break;
        case 'projects':
          response = PROJECTS_TEXT;
          break;
        case 'resume':
          response = 'Resume available at /assets/resume.pdf\n→ Opening in new tab...';
          window.open('/assets/resume.pdf', '_blank');
          break;
        case 'contact':
          setMode('email');
          response = 'Initiating secure transmission protocol...\nEnter your email address:';
          break;
        case 'stack':
          response = STACK_TEXT;
          break;
        case 'deploy':
          response = DEPLOY_TEXT;
          break;
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        default:
          response = `Command not found: ${cmd}\nType "help" for available commands.`;
      }

      setHistory([...newHistory, response, '']);
      setInput('');
    }
  };

  return (
    <section className="mb-20">
      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-2 font-mono">
        <span className="text-electric-cyan">{'>'}</span> LIVE_TERMINAL
      </h3>
      <p className="text-sm text-gray-500 font-mono mb-8 ml-5">
        // Interactive system interface
      </p>

      <div className="relative bg-black/80 border border-electric-cyan/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.08)]">
        {/* Terminal header bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-black/60 border-b border-electric-cyan/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-xs text-gray-500 font-mono">larry@system ~ $</span>
        </div>

        {/* Terminal body */}
        <div className="p-3 md:p-4 font-mono text-xs md:text-sm h-72 overflow-y-auto">
          {history.map((line, i) => (
            <div key={i} className="mb-0.5 text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
              {line.startsWith('$') ? (
                <span className="text-electric-cyan">{line}</span>
              ) : line.startsWith('✓') ? (
                <span className="text-green-400">{line}</span>
              ) : line.startsWith('[✗]') ? (
                <span className="text-red-400">{line}</span>
              ) : (
                line
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 text-electric-cyan mt-1">
            <span className="shrink-0">
              {mode === 'command' ? '$' : mode === 'email' ? 'Email:' : 'Message:'}
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              className="bg-transparent outline-none flex-1 text-white min-w-0 caret-electric-cyan"
              autoFocus
              placeholder={mode === 'command' ? 'Type a command...' : ''}
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </section>
  );
}
