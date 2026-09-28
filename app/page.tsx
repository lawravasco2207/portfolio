import { MotionPage } from '@/components/motion/MotionPage';
import { Header } from '@/components/portfolio/Header';
import { Hero } from '@/components/portfolio/Hero';
import { Story } from '@/components/portfolio/Story';
import { EngineeringLab } from '@/components/portfolio/EngineeringLab';
import { Notebook } from '@/components/portfolio/Notebook';
import { SelectedWork } from '@/components/portfolio/SelectedWork';
import { Approach } from '@/components/portfolio/Approach';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <MotionPage id="top">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <SelectedWork />
        <Approach />
        <Notebook />
        <EngineeringLab />
        <Story />
        <Contact />
      </main>
      <Footer />
    </MotionPage>
  );
}
