import { TechLayout } from '@/components/tech/TechLayout';
import { Hero } from '@/components/tech/Hero';
import { TechAboutMe } from '@/components/tech/AboutMe';
import { PlanMorphShowcase } from '@/components/tech/PlanMorphShowcase';
import { TechTimeline } from '@/components/tech/Timeline';
import { TechProjects } from '@/components/tech/ProjectsShowcase';
import { CapabilitiesMatrix } from '@/components/tech/CapabilitiesMatrix';
import { TechTerminal } from '@/components/tech/Terminal';

export default function Home() {
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <TechLayout>
        <Hero />
        <TechAboutMe />
        <CapabilitiesMatrix />
        <PlanMorphShowcase />
        <TechTimeline />
        <TechProjects />
        <TechTerminal />
      </TechLayout>
    </main>
  );
}
