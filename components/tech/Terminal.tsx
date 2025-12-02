'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendEmail } from '@/app/actions';

export function TechTerminal() {
  const [history, setHistory] = useState<string[]>(['Welcome to LarryOS v1.0. Type "help" for commands.']);
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
      let newHistory = [...history, `> ${val}`];
      
      if (mode === 'email') {
        setContactData(prev => ({ ...prev, email: val }));
        setMode('message');
        setHistory([...newHistory, 'Identity verified. Enter your message payload:']);
        setInput('');
        return;
      }



      if (mode === 'message') {
        setContactData(prev => ({ ...prev, message: val }));
        setMode('command');
        setHistory([...newHistory, 'Encrypting...', 'Transmitting to syokslawrence@gmail.com...']);
        setInput('');
        
        // Call server action
        const result = await sendEmail({ email: contactData.email, message: val });
        
        if (result.success) {
            setHistory(h => [...h, '[====================] 100%', 'Transmission Successful. Stand by for response.']);
        } else {
            setHistory(h => [...h, '[X] Transmission Failed. Check network logs.']);
        }
        return;
      }

      // Command Mode
      const cmd = val.toLowerCase();
      let response = '';

      switch (cmd) {
        case 'help':
          response = 'Available commands: help, about, contact, clear, whoami';
          break;
        case 'about':
          response = 'Larry: Engineer by day, Coder by night. Building the future of infrastructure.';
          break;
        case 'contact':
          setMode('email');
          response = 'Initiating secure transmission protocol... Enter your email address:';
          break;
        case 'whoami':
          response = 'Guest User (Admin access restricted)';
          break;
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        default:
          response = `Command not found: ${cmd}`;
      }

      setHistory([...newHistory, response]);
      setInput('');
    }
  };

  return (
    <section className="mb-20">
      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-8 font-mono">
        <span className="text-electric-cyan">{'>'}</span> LIVE_TERMINAL
      </h3>

      <div className="bg-black/80 border border-electric-cyan/30 rounded p-3 md:p-4 font-mono text-xs md:text-sm h-64 overflow-y-auto shadow-[0_0_20px_rgba(0,255,255,0.1)]">
        {history.map((line, i) => (
          <div key={i} className="mb-1 text-gray-300 whitespace-pre-wrap break-words">
            {line.startsWith('>') ? <span className="text-electric-cyan">{line}</span> : line}
          </div>
        ))}
        <div className="flex items-center gap-2 text-electric-cyan">
          <span className="shrink-0">{mode === 'command' ? '>' : mode === 'email' ? 'Email:' : 'Message:'}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className="bg-transparent outline-none flex-1 text-white min-w-0"
            autoFocus
            placeholder={mode === 'command' ? 'Type a command...' : ''}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
