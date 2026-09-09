import React from 'react';
import { 
  ArrowRight, 
  FileText, 
  MapPin, 
  ChevronDown
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { NeuralWaveBackground } from './NeuralWaveBackground';

interface HeroProps {
  onOpenCv: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCv }) => {
  const { personal } = portfolioData;

  return (
    <section className="relative pt-36 sm:pt-44 pb-20 overflow-hidden border-b border-[#2C5F3E]">
      {/* Background Neural Signals Animation (EEG/EMG signals drifting behind text) */}
      <NeuralWaveBackground className="z-0" />

      {/* Subtle atmospheric Royal Green glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[#2C5F3E]/15 blur-[160px] pointer-events-none -z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-serif">
        
        {/* Dignified Institutional Eyebrow (Pure text, no boxes) */}
        <div className="flex items-center gap-3 mb-6 text-xs uppercase tracking-widest text-[#CBA95D] font-semibold">
          <span className="w-8 h-[1px] bg-[#CBA95D]" />
          <span>Brigham Young University · Department of Mechanical Engineering</span>
        </div>

        {/* Main Name Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-[#F1F1F1] leading-none mb-4">
          {personal.name}
        </h1>

        {/* Title & Affiliation */}
        <p className="text-xl sm:text-2xl text-[#CBA95D] italic mb-2">
          {personal.title}
        </p>
        <p className="text-sm text-[#DDC6A4] flex items-center gap-1.5 mb-8">
          <MapPin className="w-3.5 h-3.5 text-[#CBA95D] shrink-0" />
          <span>{personal.lab} · {personal.university} · {personal.location}</span>
        </p>

        {/* Polished & Concise Text Overview (Clean paragraphs, no boxes, no buzzword tags) */}
        <div className="space-y-4 text-base sm:text-lg text-[#F1F1F1]/90 leading-relaxed max-w-3xl mb-10">
          <p>
            I am a Mechanical Engineering Ph.D. student (2025–present) at Brigham Young University conducting research in the <strong className="text-[#CBA95D] font-semibold">BYU Neuromechanics Research Group</strong>. Prior to BYU, I completed my Bachelor's degree in Mechanical Engineering at <strong className="text-[#F1F1F1]">Queen's University</strong> in Kingston, Ontario (2018–2023).
          </p>
          <p className="text-[#DDC6A4]">
            My research investigates Brain-Computer Interfaces (BCI), neuromuscular motor control, and computational biomechanical modeling to characterize neural dynamics and interface electrophysiological command with dynamic systems.
          </p>
        </div>

        {/* Clean Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <a
            href="#research"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-[#2C5F3E] hover:bg-[#234d32] text-[#F1F1F1] border border-[#CBA95D] shadow-lg transition-all"
          >
            <span>Explore Research</span>
            <ArrowRight className="w-4 h-4 text-[#CBA95D]" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-[#0e1f16] hover:bg-[#162e20] text-[#F1F1F1] border border-[#2C5F3E] hover:border-[#CBA95D] transition-all"
          >
            <FileText className="w-4 h-4 text-[#CBA95D]" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Subtle Bottom Border Line & Breadcrumb */}
        <div className="pt-6 border-t border-[#2C5F3E]/40 flex items-center justify-between text-xs text-[#DDC6A4]/70">
          <span>Doctoral Scholarship & Engineering Portfolio</span>
          <a
            href="#research"
            className="inline-flex items-center gap-1.5 text-[#CBA95D] hover:text-[#F1F1F1] transition-colors"
          >
            <span>Scroll to overview</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>

      </div>
    </section>
  );
};
