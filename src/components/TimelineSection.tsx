import React from 'react';
import { 
  GraduationCap, 
  FlaskConical, 
  Briefcase, 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { TimelineItem } from '../data/portfolioData';

export const TimelineSection: React.FC = () => {
  const { timeline } = portfolioData;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'education':
        return <GraduationCap className="w-4 h-4 text-cyan-400" />;
      case 'research':
        return <FlaskConical className="w-4 h-4 text-blue-400" />;
      case 'teaching':
        return <Users className="w-4 h-4 text-emerald-400" />;
      default:
        return <Briefcase className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <section id="experience" className="py-24 relative bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>ACADEMIC & RESEARCH TRAJECTORY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Education & Experience
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A track record of rigorous doctoral scholarship, hardware-in-the-loop experiment design, and undergraduate engineering mentorship at BYU.
          </p>
        </div>

        {/* Timeline Flow */}
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-8 space-y-12">
          {timeline.map((item: TimelineItem) => (
            <div key={item.id} className="relative pl-8 sm:pl-10">
              
              {/* Node Dot */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-500/50 flex items-center justify-center shadow-md shadow-cyan-500/20">
                {getTypeIcon(item.type)}
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                      {item.role}
                    </h3>
                    <p className="text-sm font-semibold text-cyan-400">
                      {item.organization}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:text-right">
                    <span className="px-2.5 py-1 rounded text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {item.period}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {item.location}
                    </span>
                  </div>
                </div>

                {/* Bulleted Points */}
                <ul className="space-y-2 mt-4">
                  {item.description.map((desc, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-1 shrink-0" />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>

                {/* Tag Pills */}
                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-slate-800/80">
                    {item.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-950 text-cyan-300/80 border border-cyan-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
