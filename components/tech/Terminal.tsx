'use client';

import { useState, useRef, useEffect } from 'react';
import { sendEmail } from '@/app/actions';
import type { MissionControlPayload, MissionProfile } from '@/lib/mission-control/types';

const HELP_TEXT = `Available commands:
  help      — Show available commands
  whoami    — Display identity
  projects  — List active projects
  resume    — Get resume link
  status    — Query mission control
  repos     — Show tracked repositories
  api profile — Open the live profile endpoint
  contact   — Send a message
  stack     — Show tech stack
  deploy    — View deployment status
  clear     — Clear terminal`;

const FALLBACK_WHOAMI_TEXT = `{
  "name": "Lawrence Musyoka",
  "handle": "Larry",
  "role": "Full Stack Engineer & Systems Builder",
  "base": "Nairobi, Kenya",
  "current_system": "Vex",
  "operating_thesis": "Build production systems that turn engineering ambiguity into inspectable output.",
  "ship_surface": [
    "Vex — semantic diff engine for BIM and IFC models",
    "vex-bridge — local daemon connecting CAD tools to Vex",
    "Vex Atlas — cloud action manager for users, repos, SSH keys, pairing, and semantic diff review"
  ],
  "stack_signal": ["Rust", "C# / .NET", "TypeScript / Next.js", "PostgreSQL", "IFC / BIM workflows"],
  "status": "Building the Vex system: engine, bridge, and cloud layer"
}`;

function formatWhoami(profile: MissionProfile, mission: MissionControlPayload) {
  const artifacts = mission.repositories.map((repo) => `${repo.label} — ${repo.role}`);

  return JSON.stringify(
    {
      name: profile.name,
      handle: profile.handle,
      role: profile.role,
      base: profile.location,
      current_system: 'Vex',
      operating_thesis: profile.thesis,
      ship_surface: artifacts,
      stack_signal: ['Rust', 'C# / .NET', 'TypeScript / Next.js', 'PostgreSQL', 'IFC / BIM workflows'],
      availability: profile.availability,
      status: 'Building the Vex system: engine, bridge, and cloud layer',
    },
    null,
    2,
  );
}

async function getWhoamiText() {
  try {
    const [profileResponse, missionResponse] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/mission-control'),
    ]);

    if (!profileResponse.ok || !missionResponse.ok) {
      throw new Error('whoami endpoints unavailable');
    }

    const profileData = (await profileResponse.json()) as { profile: MissionProfile };
    const missionData = (await missionResponse.json()) as MissionControlPayload;

    return formatWhoami(profileData.profile, missionData);
  } catch {
    return FALLBACK_WHOAMI_TEXT;
  }
}

const PROJECTS_TEXT = `ACTIVE ARTIFACTS:
  [01] Vex — semantic diff engine work
       → https://github.com/PlanMorph-Org/vex

  [02] vex-bridge — local API bridge layer
       → https://github.com/PlanMorph-Org/vex-bridge

  [03] Vex Atlas — cloud action manager for Vex users
       → source linked from the Vex Atlas artifact card

Type 'status' for live telemetry or 'contact' to open a channel.`;

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
  │ System:    Mission Control      │
  │ Platform:  DigitalOcean         │
  │ Status:    ● ONLINE             │
  │ API:       /api/mission-control │
  │ Region:    NYC                  │
  │ Build:     stable               │
  │ Pipeline:  GitHub → Docker → DO │
  └─────────────────────────────────┘`;

const STATUS_TEXT = `MISSION CONTROL:
  profile:     /api/profile
  telemetry:   /api/mission-control
  changelog:   /api/changelog
  repos:       Vex, vex-bridge, Vex Atlas
  focus:       engine + bridge + cloud action manager`;

const REPOS_TEXT = `TRACKED REPOSITORIES:
  PlanMorph-Org/vex
  PlanMorph-Org/vex-bridge
  Vex Atlas cloud repository`;

export function TechTerminal() {
  const [history, setHistory] = useState<string[]>(['Larry v2.0 — Production Environment', 'Type "help" for available commands.', '']);
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
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          setHistory([...newHistory, '[✗] Invalid email format. Please enter a valid email address:']);
          setInput('');
          return;
        }
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
          response = await getWhoamiText();
          break;
        case 'projects':
          response = PROJECTS_TEXT;
          break;
        case 'resume':
          response = 'Resume console available at /resume\nPDF: /assets/resume.pdf\nDOCX source: /assets/LawrenceMusyoka_Resume.docx\n→ Opening viewer...';
          window.open('/resume', '_blank');
          break;
        case 'status':
          response = STATUS_TEXT;
          break;
        case 'repos':
          response = REPOS_TEXT;
          break;
        case 'api profile':
          response = 'Opening /api/profile...';
          window.open('/api/profile', '_blank');
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
        case 'billionare':
          response = 'ACCESS GRANTED. Redirecting to admin portal...';
          setTimeout(() => window.open('/admin', '_self'), 800);
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
        {'// Endpoint-aware command surface'}
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
