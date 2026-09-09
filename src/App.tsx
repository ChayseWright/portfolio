import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ResearchSection } from './components/ResearchSection';
import { PublicationsSection } from './components/PublicationsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { TimelineSection } from './components/TimelineSection';
import { SkillsSection } from './components/SkillsSection';
import { NewsSection } from './components/NewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BibtexModal } from './components/BibtexModal';
import { ProjectModal } from './components/ProjectModal';
import { CvModal } from './components/CvModal';
import type { Publication, Project } from './data/portfolioData';

export function App() {
  const [selectedBibtexPub, setSelectedBibtexPub] = useState<Publication | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCvOpen, setIsCvOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation */}
      <Navbar onOpenCv={() => setIsCvOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero onOpenCv={() => setIsCvOpen(true)} />
        <ResearchSection />
        <PublicationsSection onSelectBibtex={(pub) => setSelectedBibtexPub(pub)} />
        <ProjectsSection onSelectProject={(proj) => setSelectedProject(proj)} />
        <TimelineSection />
        <SkillsSection />
        <NewsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <BibtexModal 
        publication={selectedBibtexPub} 
        onClose={() => setSelectedBibtexPub(null)} 
      />

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      <CvModal 
        isOpen={isCvOpen} 
        onClose={() => setIsCvOpen(false)} 
      />
    </div>
  );
}

export default App;
