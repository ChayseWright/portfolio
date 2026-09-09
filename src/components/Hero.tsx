import React from 'react';
import { 
  ArrowRight, 
  FileText, 
  MapPin, 
  ChevronDown,
  Activity
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { NeuralWaveBackground } from './NeuralWaveBackground';

interface HeroProps {
  onOpenCv: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCv }) => {
  const { personal, stats } = portfolioData;

  return (
    <section className="relative pt-32 sm:pt-40 pb-24 overflow-hidden bg-grid-royal border-b border-[#2C5F3E]">
      {/* Background Neural Signals Animation (EEG/EMG signals drifting behind text) */}
      <NeuralWaveBackground className="z-0" />

      {/* Atmospheric Royal Green glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[#2C5F3E]/20 blur-[150px] pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Affiliation Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6 font-serif">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-wider bg-[#2C5F3E] text-[#F1F1F1] border border-[#CBA95D]/60 shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#CBA95D]" />
            BYU Neuromechanics Research Group
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider bg-[#0c1811]/90 text-[#CBA95D] border border-[#2C5F3E]">
            <Activity className="w-3.5 h-3.5 text-[#CBA95D]" />
            Brain-Computer Interfaces
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider bg-[#0c1811]/90 text-[#DDC6A4] border border-[#2C5F3E]">
            Queen's University Alum
          </span>
        </div>

        {/* Main Title & Degree */}
        <div className="space-y-2 mb-6">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-[#F1F1F1] leading-tight">
            {personal.name}
          </h1>
          <p className="text-xl sm:text-2xl font-serif text-[#CBA95D] italic">
            {personal.title}
          </p>
          <p className="text-sm font-serif text-[#DDC6A4] flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-[#CBA95D]" />
            <span>{personal.university} · {personal.location}</span>
          </p>
        </div>

        {/* Narrative Bio */}
        <div className="max-w-3xl space-y-4 text-[#F1F1F1]/90 text-base sm:text-lg leading-relaxed font-serif bg-[#0a160f]/60 p-6 border-l-4 border-[#CBA95D] backdrop-blur-xs mb-8">
          <p>
            Conducting graduate research in the <strong className="text-[#CBA95D] font-semibold">BYU Neuromechanics Research Group</strong> within the Department of Mechanical Engineering.
          </p>
          <p className="text-[#DDC6A4] text-base font-normal">
            Prior to BYU, I completed my Bachelor's in Mechanical Engineering at <strong className="text-[#F1F1F1]">Queen's University in Kingston</strong>. My work focuses on Brain-Computer Interfaces (BCI), neural decoding architectures, and neuromuscular biomechanical modeling.
          </p>
        </div>

        {/* Core Topic Badges */}
        <div className="flex flex-wrap gap-2 mb-8 font-serif text-xs">
          {["Brain-Computer Interfaces (BCI)", "Neuromechanics", "Motor Decoding", "Biomechanical Modeling", "EEG & EMG Analysis"].map((tag) => (
            <span key={tag} className="px-3 py-1 bg-[#102317]/90 text-[#DDC6A4] border border-[#2C5F3E]">
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-12 font-serif">
          <a
            href="#research"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-[#2C5F3E] hover:bg-[#234d32] text-[#F1F1F1] border border-[#CBA95D] shadow-lg transition-all"
          >
            <span>Explore Research Focus</span>
            <ArrowRight className="w-4 h-4 text-[#CBA95D]" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-[#0c1811] hover:bg-[#162e20] text-[#F1F1F1] border border-[#CBA95D]/50 transition-all hover:border-[#CBA95D]"
          >
            <FileText className="w-4 h-4 text-[#CBA95D]" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Academic Profile Grid (Fixed overflow: no text ever exits boxes) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#2C5F3E]">
          {stats.map((s, idx) => (
            <div key={idx} className="p-3.5 bg-[#0e1f16]/90 border border-[#2C5F3E] flex flex-col justify-center min-w-0">
              <div className="text-sm sm:text-base font-serif font-bold text-[#CBA95D] truncate">
                {s.value}
              </div>
              <div className="text-xs font-serif text-[#DDC6A4] mt-0.5 truncate">
                {s.label}
              </div>
            </div>
          ))}
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
