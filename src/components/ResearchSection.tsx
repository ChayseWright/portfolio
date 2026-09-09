import React from 'react';
import { 
  BrainCircuit, 
  Activity, 
  Bot, 
  CheckCircle2, 
  ArrowUpRight,
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
        return <BrainCircuit className="w-6 h-6 text-cyan-400" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-blue-400" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-emerald-400" />;
      default:
        return <Cpu className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <section id="research" className="py-24 relative bg-slate-950/60 border-t border-slate-900">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>DISSERTATION RESEARCH THRUSTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Advancing Neural Decoding & Bio-Robotic Synthesis
          </h2>
          <p className="mt-3 text-base text-slate-400 leading-relaxed">
            Investigating foundational questions at the intersection of mechanical dynamics, neuroscience, and embedded intelligence in the BYU Neuromechanics Research Group.
          </p>
        </div>

        {/* Thrusts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {researchThrusts.map((thrust: ResearchThrust, index: number) => (
            <div 
              key={thrust.id}
              className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                    {getIcon(thrust.iconName)}
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    THRUST 0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                  {thrust.title}
                </h3>
                <p className="text-xs font-mono text-cyan-400/90 mb-4">
                  {thrust.tagline}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {thrust.description}
                </p>

                {/* Key Research Highlights */}
                <div className="space-y-2.5 mb-6">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Scientific Contributions</span>
                  </h4>
                  <ul className="space-y-2">
                    {thrust.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Methodologies Badges */}
                <div className="mb-6">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Methodologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {thrust.methodologies.map((m, mIdx) => (
                      <span 
                        key={mIdx}
                        className="px-2.5 py-1 rounded text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl">
                {thrust.metrics.map((metric, metricIdx) => (
                  <div key={metricIdx} className="text-center">
                    <div className="text-xs sm:text-sm font-bold font-mono text-cyan-300">
                      {metric.value}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-cyan-950/40 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-xs sm:text-sm text-slate-300 font-mono">
              Research supported by BYU Department of Mechanical Engineering and collaborative neuroengineering initiatives.
            </p>
          </div>
          <a
            href="#publications"
            className="inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap"
          >
            <span>See Resulting Publications</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
