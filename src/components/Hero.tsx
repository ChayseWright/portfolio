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
    <section className="relative pt-36 sm:pt-44 pb-20 overflow-hidden border-b border-white/20">
      {/* Background Neural Signals Animation (EEG/EMG signals drifting behind text) */}
      <NeuralWaveBackground className="z-0" />

      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-white/[0.03] blur-[160px] pointer-events-none -z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-serif">
        
        {/* Dignified Institutional Eyebrow (Pure text, no boxes) */}
        <div className="flex items-center gap-3 mb-6 text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          <span className="w-8 h-[1px] bg-white/40" />
          <span>Brigham Young University · Department of Mechanical Engineering</span>
        </div>

        {/* Main Name Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white leading-none mb-4">
          {personal.name}
        </h1>

        {/* Title & Affiliation */}
        <p className="text-xl sm:text-2xl text-neutral-300 italic mb-2">
          {personal.title}
        </p>
        <p className="text-sm text-neutral-400 flex items-center gap-1.5 mb-8">
          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>{personal.lab} · {personal.university} · {personal.location}</span>
        </p>

        {/* Polished & Concise Text Overview (Clean paragraphs, no boxes, no buzzword tags) */}
        <div className="space-y-4 text-base sm:text-lg text-neutral-200 leading-relaxed max-w-3xl mb-10">
          <p>
            I am a Mechanical Engineering Ph.D. student (2025–present) at Brigham Young University conducting research in the <strong className="text-white font-semibold">BYU Neuromechanics Research Group</strong>. Prior to BYU, I completed my Bachelor's degree in Mechanical Engineering at <strong className="text-white">Queen's University</strong> in Kingston, Ontario (2018–2023).
          </p>
          <p className="text-neutral-400">
            My research investigates Brain-Computer Interfaces (BCI), neuromuscular motor control, and computational biomechanical modeling to characterize neural dynamics and interface electrophysiological command with dynamic systems.
          </p>
        </div>

        {/* Clean Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <a
            href="#research"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-white hover:bg-neutral-200 text-black border border-white shadow-lg transition-all"
          >
            <span>Explore Research</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-black hover:bg-neutral-900 text-white border border-white/40 hover:border-white transition-all"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Subtle Bottom Border Line & Breadcrumb */}
        <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs text-neutral-500">
          <span>Doctoral Scholarship & Engineering Portfolio</span>
          <a
            href="#research"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <span>Scroll to overview</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>

      </div>
    </section>
  );
};
