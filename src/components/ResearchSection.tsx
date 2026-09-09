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
        return <BrainCircuit className="w-6 h-6 text-[#FFFFFF]" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-[#FFFFFF]" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-[#FFFFFF]" />;
      default:
        return <Cpu className="w-6 h-6 text-[#FFFFFF]" />;
    }
  };

  return (
    <section id="research" className="py-24 relative bg-[#09090B] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-serif uppercase tracking-widest bg-[#121215] text-[#9CA3AF] border border-[#27272A] mb-3">
            <span className="w-1.5 h-1.5 bg-[#FFFFFF]" />
            <span>DISSERTATION RESEARCH FOCUS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#FFFFFF] tracking-tight">
            Research Thrusts & Core Interests
          </h2>
          <p className="mt-3 text-base sm:text-lg font-serif text-[#9CA3AF] leading-relaxed font-normal">
            Investigating foundational questions at the intersection of mechanical dynamics, neuroscience, and embedded intelligence within the BYU Neuromechanics Research Group.
          </p>
        </div>

        {/* Thrusts Grid (Spacious 2-column layout for 2 dissertation areas) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
          {researchThrusts.map((thrust: ResearchThrust, index: number) => (
            <div 
              key={thrust.id}
              className="group relative bg-[#121215] border border-[#27272A] hover:border-[#9CA3AF]/40 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#27272A]">
                  <div className="p-2.5 bg-[#1E1E24] border border-[#27272A] text-[#FFFFFF]">
                    {getIcon(thrust.iconName)}
                  </div>
                  <span className="text-xs font-serif uppercase tracking-widest text-[#9CA3AF] font-normal">
                    THRUST 0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#F4F4F5] group-hover:text-[#FFFFFF] transition-colors mb-2">
                  {thrust.title}
                </h3>
                <p className="text-xs font-serif italic text-[#9CA3AF] mb-4 font-normal">
                  {thrust.tagline}
                </p>

                <p className="text-sm font-serif text-[#9CA3AF] leading-relaxed mb-6 font-normal">
                  {thrust.description}
                </p>

                {/* Key Research Highlights */}
                <div className="space-y-2.5 mb-6">
                  <h4 className="text-xs font-serif uppercase tracking-wider text-[#F4F4F5] flex items-center gap-1.5 font-normal">
                    <TrendingUp className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>Scientific Focus Areas</span>
                  </h4>
                  <ul className="space-y-2">
                    {thrust.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 text-xs font-serif text-[#9CA3AF] font-normal">
                        <span className="w-1.5 h-1.5 bg-[#FFFFFF] mt-1.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Methodologies Badges */}
                <div className="mb-6">
                  <h4 className="text-xs font-serif uppercase tracking-wider text-[#9CA3AF] mb-2 font-normal">
                    Methodologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {thrust.methodologies.map((m, mIdx) => (
                      <span 
                        key={mIdx}
                        className="px-2.5 py-1 text-xs font-serif bg-[#1E1E24] text-[#F4F4F5] border border-[#27272A] font-normal"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Specifications Box (Well formatted, clean division, no overlap) */}
              <div className="pt-5 border-t border-[#27272A] mt-6">
                <div className="grid grid-cols-3 divide-x divide-[#27272A] bg-[#09090B] p-3 border border-[#27272A]">
                  {thrust.metrics.map((metric, metricIdx) => (
                    <div key={metricIdx} className="text-center px-2">
                      <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1 font-normal font-sans truncate">
                        {metric.label}
                      </div>
                      <div className="text-xs sm:text-sm font-serif text-[#FFFFFF] font-normal leading-snug">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 bg-[#121215] border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4 font-serif">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FFFFFF]" />
            <p className="text-sm text-[#9CA3AF] font-normal">
              Doctoral research affiliated with the Department of Mechanical Engineering at Brigham Young University.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-normal text-[#FFFFFF] hover:text-[#F4F4F5] transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Inquire About Research</span>
          </a>
        </div>

      </div>
    </section>
  );
};
