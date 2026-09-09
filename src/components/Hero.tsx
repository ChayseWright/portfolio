import { 
  ArrowRight, 
  FileText, 
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
    <section className="relative pt-36 sm:pt-44 pb-20 overflow-hidden border-b border-[#27272A] bg-[#09090B]">
      {/* Background Neural Signals Animation (EEG/EMG signals drifting behind text) */}
      <NeuralWaveBackground className="z-0" />

      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-white/[0.02] blur-[160px] pointer-events-none -z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-serif">
        
        {/* Dignified Institutional Eyebrow (Pure text, unbolded) */}
        <div className="flex items-center gap-3 mb-6 text-xs uppercase tracking-widest text-[#9CA3AF] font-normal">
          <span className="w-8 h-[1px] bg-[#27272A]" />
          <span>Brigham Young University · Department of Mechanical Engineering</span>
        </div>

        {/* Main Name Heading (Unbolded, elegant serif) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-[#FFFFFF] leading-none mb-4">
          {personal.name}
        </h1>

        {/* Title & Affiliation (No address) */}
        <p className="text-xl sm:text-2xl text-[#F4F4F5] italic mb-2 font-normal">
          {personal.title}
        </p>
        <p className="text-sm text-[#9CA3AF] mb-8 font-normal">
          <span>{personal.lab} · {personal.university}</span>
        </p>

        {/* Polished & Concise Text Overview (Unbolded, clean typography) */}
        <div className="space-y-4 text-base sm:text-lg text-[#F4F4F5] leading-relaxed max-w-3xl mb-10 font-normal">
          <p>
            I am a Mechanical Engineering Ph.D. student (2025–present) at Brigham Young University conducting research in the <span className="text-[#FFFFFF]">BYU Neuromechanics Research Group</span>. Prior to BYU, I completed my Bachelor's degree in Mechanical Engineering at <span className="text-[#FFFFFF]">Queen's University</span> (2018–2023).
          </p>
          <p className="text-[#9CA3AF]">
            My primary research focus is in tremor characterisation and decomposition for Essential Tremor and Parkinson's Disease, investigating neuromuscular oscillations and dynamic motor unit behavior. Additionally, my research interests include Brain-Computer Interfaces (BCI) and neural decoding.
          </p>
        </div>

        {/* Clean Action Buttons (Unbolded) */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <a
            href="#research"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-normal tracking-wider uppercase bg-[#FFFFFF] hover:bg-[#F4F4F5] text-[#09090B] border border-[#FFFFFF] shadow-lg transition-all cursor-pointer"
          >
            <span>Explore Research</span>
            <ArrowRight className="w-4 h-4 text-[#09090B]" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-normal tracking-wider uppercase bg-[#121215] hover:bg-[#1E1E24] text-[#F4F4F5] border border-[#27272A] hover:border-[#9CA3AF]/40 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#9CA3AF]" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Subtle Bottom Border Line & Breadcrumb */}
        <div className="pt-6 border-t border-[#27272A] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>Doctoral Scholarship & Engineering Portfolio</span>
          <a
            href="#research"
            className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors"
          >
            <span>Scroll to overview</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>

      </div>
    </section>
  );
};
