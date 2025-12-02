'use client';

import { useAppStore } from '@/lib/store';
import { CanvasWrapper } from '@/components/3d/CanvasWrapper';
import { HolographicSphere } from '@/components/3d/HolographicSphere';
import { PortalChoice } from '@/components/PortalChoice';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder components for modes (we will build these next)
import { CivilLayout } from '@/components/civil/CivilLayout';
import { CivilAboutMe } from '@/components/civil/AboutMe';
import { CivilProjects } from '@/components/civil/ProjectsShowcase';
import { CivilSkills } from '@/components/civil/Skills';
import { CivilPhilosophy } from '@/components/civil/Philosophy';
import { CivilTools } from '@/components/civil/Tools';

const CivilMode = () => (
  <CivilLayout>
    <CivilAboutMe />
    <CivilProjects />
    <CivilSkills />
    <CivilPhilosophy />
    <CivilTools />
  </CivilLayout>
);
import { TechLayout } from '@/components/tech/TechLayout';
import { TechAboutMe } from '@/components/tech/AboutMe';
import { TechProjects } from '@/components/tech/ProjectsShowcase';
import { TechSkills } from '@/components/tech/Skills';
import { PlanMorphShowcase } from '@/components/tech/PlanMorphShowcase';
import { TechTimeline } from '@/components/tech/Timeline';
import { TechTerminal } from '@/components/tech/Terminal';

const TechMode = () => (
  <TechLayout>
    <TechAboutMe />
    <PlanMorphShowcase />
    <TechTimeline />
    <TechProjects />
    <TechSkills />
    <TechTerminal />
  </TechLayout>
);

export default function Home() {
  const { mode, isTransitioning } = useAppStore();

  return (
    <main className="min-h-screen bg-deep-charcoal relative">
      <AnimatePresence mode="wait">
        {mode === 'entry' && (
          <motion.div
            key="entry"
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10 h-screen w-full overflow-hidden"
          >
            <CanvasWrapper className="absolute inset-0">
              <HolographicSphere />
            </CanvasWrapper>
            <PortalChoice />
          </motion.div>
        )}

        {mode === 'civil' && (
          <motion.div
            key="civil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CivilMode />
          </motion.div>
        )}

        {mode === 'tech' && (
          <motion.div
            key="tech"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TechMode />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
