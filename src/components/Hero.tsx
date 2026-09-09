import React from 'react';
import { 
  ArrowRight, 
  FileText, 
  MapPin, 
  Cpu, 
  ChevronDown
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { ThreeMechViewer } from './ThreeMechViewer';

interface HeroProps {
  onOpenCv: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCv }) => {
  const { personal, stats } = portfolioData;

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 overflow-hidden bg-grid-royal">
      {/* Royal Green atmospheric radiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#2C5F3E]/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-[#CBA95D]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Personal Narrative & Badges */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Affiliation Badges (Sharp & Formal) */}
            <div className="flex flex-wrap items-center gap-2 font-serif">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider bg-[#2C5F3E] text-[#F1F1F1] border border-[#CBA95D]/60 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#CBA95D]" />
                BYU Neuromechanics Group
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider bg-[#13281a] text-[#CBA95D] border border-[#2C5F3E]">
                Brain-Computer Interfaces
              </span>
            </div>

            {/* Name and Academic Title */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#F1F1F1] leading-tight">
                {personal.name}
              </h1>
              <p className="mt-2 text-xl font-serif text-[#CBA95D] italic">
                {personal.title}
              </p>
              <p className="text-sm font-serif text-[#DDC6A4] flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#CBA95D]" />
                <span>{personal.university} · {personal.location}</span>
              </p>
            </div>

            {/* Core Bio Statement */}
            <div className="space-y-3 text-[#F1F1F1]/90 text-base sm:text-lg leading-relaxed font-serif">
              <p>
                Bridging <strong className="text-[#CBA95D] font-semibold">Mechanical Engineering</strong>, <strong className="text-[#F1F1F1] font-semibold">Computational Biomechanics</strong>, and <strong className="text-[#CBA95D] font-semibold">Brain-Computer Interfaces (BCI)</strong>.
              </p>
              <p className="text-[#DDC6A4] text-base font-normal">
                Conducting doctoral research on neural decoding, dynamic neuromuscular modeling, and bio-mechatronic systems within the Department of Mechanical Engineering at Brigham Young University.
              </p>
            </div>

            {/* Research Keywords */}
            <div className="flex flex-wrap gap-2 pt-1 font-serif text-xs">
              {["Brain-Computer Interfaces", "Neuromechanics", "Motor Decoding", "Biomechanical Modeling", "Bio-Mechatronics"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[#13281a] text-[#DDC6A4] border border-[#2C5F3E]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Call to Action Buttons (Sharp Rectangles) */}
            <div className="flex flex-wrap items-center gap-3 pt-3 font-serif">
              <a
                href="#research"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-[#2C5F3E] hover:bg-[#234d32] text-[#F1F1F1] border border-[#CBA95D] shadow-lg transition-all hover:-translate-y-0.5"
              >
                <span>Explore Research</span>
                <ArrowRight className="w-4 h-4 text-[#CBA95D]" />
              </a>

              <button
                onClick={onOpenCv}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-[#13281a] hover:bg-[#1a3824] text-[#F1F1F1] border border-[#CBA95D]/50 transition-all hover:border-[#CBA95D]"
              >
                <FileText className="w-4 h-4 text-[#CBA95D]" />
                <span>Curriculum Vitae</span>
              </button>
            </div>

            {/* Academic Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#2C5F3E]">
              {stats.map((s, idx) => (
                <div key={idx} className="p-3.5 bg-[#0e1e15] border border-[#2C5F3E]">
                  <div className="text-base sm:text-lg font-serif font-bold text-[#CBA95D]">
                    {s.value}
                  </div>
                  <div className="text-xs font-serif text-[#DDC6A4] mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Interactive 3D Digital Twin Component */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Header Label for 3D Demo */}
              <div className="mb-3 flex items-center justify-between font-serif">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#CBA95D]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F1F1]">
                    Interactive 3D Biomechatronic Twin
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#DDC6A4] hidden sm:inline">
                  Drag to rotate · Scroll to zoom
                </span>
              </div>

              {/* Three.js Canvas */}
              <ThreeMechViewer />

              <p className="mt-2.5 text-xs font-serif italic text-[#DDC6A4] text-center">
                Digital twin of bio-mechatronic upper-limb articulation with real-time neural activation telemetry.
              </p>
            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-12">
          <a
            href="#research"
            className="flex flex-col items-center gap-1 text-[#DDC6A4] hover:text-[#CBA95D] transition-colors group"
            aria-label="Scroll down to research"
          >
            <span className="text-[10px] font-serif tracking-widest uppercase text-[#DDC6A4] group-hover:text-[#CBA95D]">
              Scroll to explore
            </span>
            <ChevronDown className="w-4 h-4 text-[#CBA95D] animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
