import React from 'react';
import { 
  BrainCircuit, 
  Activity, 
  Bot, 
  TrendingUp,
  Cpu
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { ResearchThrust } from '../data/portfolioData';

export const ResearchSection: React.FC = () => {
  const { researchThrusts } = portfolioData;

  const getIcon = (name: string) => {
    switch (name) {
      case 'BrainCircuit':
        return <BrainCircuit className="w-6 h-6 text-[#CBA95D]" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-[#CBA95D]" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-[#CBA95D]" />;
      default:
        return <Cpu className="w-6 h-6 text-[#CBA95D]" />;
    }
  };

  return (
    <section id="research" className="py-24 relative bg-black border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-serif uppercase tracking-widest bg-neutral-950 text-neutral-300 border border-white/30 mb-3">
            <span className="w-1.5 h-1.5 bg-white" />
            <span>DISSERTATION RESEARCH FOCUS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Research Thrusts & Core Interests
          </h2>
          <p className="mt-3 text-base sm:text-lg font-serif text-neutral-400 leading-relaxed">
            Investigating foundational questions at the intersection of mechanical dynamics, neuroscience, and embedded intelligence within the BYU Neuromechanics Research Group.
          </p>
        </div>

        {/* Thrusts Grid (Sharp Rectangular Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {researchThrusts.map((thrust: ResearchThrust, index: number) => (
            <div 
              key={thrust.id}
              className="group relative bg-neutral-950 border border-white/20 hover:border-white p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/5"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/20">
                  <div className="p-2.5 bg-black border border-white/40 text-white">
                    {getIcon(thrust.iconName)}
                  </div>
                  <span className="text-xs font-serif uppercase tracking-widest text-neutral-400">
                    THRUST 0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white group-hover:text-neutral-200 transition-colors mb-2">
                  {thrust.title}
                </h3>
                <p className="text-xs font-serif italic text-neutral-400 mb-4">
                  {thrust.tagline}
                </p>

                <p className="text-sm font-serif text-neutral-300 leading-relaxed mb-6">
                  {thrust.description}
                </p>

                {/* Key Research Highlights */}
                <div className="space-y-2.5 mb-6">
                  <h4 className="text-xs font-serif uppercase tracking-wider text-white flex items-center gap-1.5 font-bold">
                    <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Scientific Focus Areas</span>
                  </h4>
                  <ul className="space-y-2">
                    {thrust.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 text-xs font-serif text-neutral-300">
                        <span className="w-1.5 h-1.5 bg-white mt-1.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Methodologies Badges */}
                <div className="mb-6">
                  <h4 className="text-xs font-serif uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                    Methodologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {thrust.methodologies.map((m, mIdx) => (
                      <span 
                        key={mIdx}
                        className="px-2.5 py-1 text-xs font-serif bg-black text-neutral-300 border border-white/20"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="pt-4 border-t border-white/20 grid grid-cols-3 gap-2 bg-black p-3 border border-white/10">
                {thrust.metrics.map((metric, metricIdx) => (
                  <div key={metricIdx} className="text-center">
                    <div className="text-xs sm:text-sm font-serif font-bold text-white">
                      {metric.value}
                    </div>
                    <div className="text-[11px] font-serif text-neutral-400 truncate">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 bg-neutral-950 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-serif">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-white" />
            <p className="text-sm text-neutral-300">
              Doctoral research affiliated with the Department of Mechanical Engineering at Brigham Young University.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-white hover:text-neutral-300 transition-colors whitespace-nowrap"
          >
            <span>Inquire About Research</span>
          </a>
        </div>

      </div>
    </section>
  );
};
