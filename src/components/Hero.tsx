import React from 'react';
import { 
  ArrowRight, 
  FileText, 
  MapPin, 
  Cpu, 
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { ThreeMechViewer } from './ThreeMechViewer';

interface HeroProps {
  onOpenCv: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCv }) => {
  const { personal, stats } = portfolioData;

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 overflow-hidden bg-grid-pattern">
      {/* Glow gradient blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[300px] bg-blue-700/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Personal Narrative & Badges */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Affiliation Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-950/80 text-blue-300 border border-blue-600/40">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                BYU Neuromechanics Group
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                BCI & Neural Prosthetics
              </span>
            </div>

            {/* Name and Academic Title */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {personal.name}
              </h1>
              <p className="mt-2 text-lg sm:text-xl font-mono text-cyan-400 font-medium">
                {personal.title}
              </p>
              <p className="text-sm font-mono text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{personal.university} · {personal.location}</span>
              </p>
            </div>

            {/* Core Bio Statement */}
            <div className="space-y-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Bridging <strong className="text-slate-100 font-semibold">Mechanical Engineering</strong>, <strong className="text-slate-100 font-semibold">Computational Biomechanics</strong>, and <strong className="text-cyan-300 font-semibold">Brain-Computer Interfaces (BCI)</strong>.
              </p>
              <p className="text-slate-400 text-sm">
                Investigating how the central nervous system controls human motion, decoding electrophysiological signals (EEG/EMG) in real-time, and engineering adaptive robotic prosthetics and tremor-suppression hardware.
              </p>
            </div>

            {/* Research Keywords */}
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              {["#BrainComputerInterfaces", "#Neuromechanics", "#RoboticProsthetics", "#OpenSim", "#NeuralDecoding", "#BioMechatronics"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-slate-800">
                  {tag}
                </span>
              ))}
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#research"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:translate-y-[-1px]"
              >
                <span>Explore Research</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenCv}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:border-cyan-500/50"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Curriculum Vitae</span>
              </button>

              <a
                href="#publications"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <span>Publications</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Stats Counter Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              {stats.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300">
                    {s.value}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
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
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-300">
                    Interactive 3D Biomechatronic Twin
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  Drag to rotate · Scroll to zoom
                </span>
              </div>

              {/* Three.js Canvas */}
              <ThreeMechViewer />

              <p className="mt-2.5 text-[11px] font-mono text-slate-500 text-center">
                Kinematic simulation of active series-elastic upper-limb neural prosthesis with real-time bio-telemetry.
              </p>
            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-12">
          <a
            href="#research"
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors group"
            aria-label="Scroll down to research"
          >
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 group-hover:text-cyan-400">
              Scroll to explore
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
