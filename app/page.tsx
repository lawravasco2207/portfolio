import { TechLayout } from '@/components/tech/TechLayout';
import { TechAboutMe } from '@/components/tech/AboutMe';
import { TechTimeline } from '@/components/tech/Timeline';
import { TechProjects } from '@/components/tech/ProjectsShowcase';
import { CapabilitiesMatrix } from '@/components/tech/CapabilitiesMatrix';
import { TechTerminal } from '@/components/tech/Terminal';
import { ImpactSnapshot } from '@/components/tech/ImpactSnapshot';
import { Contact } from '@/components/Contact';
import { MissionControlDeck } from '@/components/mission-control/MissionControlDeck';

export default function Home() {
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <TechLayout>
        <MissionControlDeck />
        <ImpactSnapshot />
        <TechAboutMe />
        <CapabilitiesMatrix />
        <TechTimeline />
        <TechProjects />
        <TechTerminal />
        <Contact />
      </TechLayout>
    </main>
  );
}
