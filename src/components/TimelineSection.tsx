import React from 'react';
import { 
  GraduationCap, 
  FlaskConical, 
  Briefcase, 
  Calendar, 
  MapPin 
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { TimelineItem } from '../data/portfolioData';

export const TimelineSection: React.FC = () => {
  const { timeline } = portfolioData;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'education':
        return <GraduationCap className="w-3.5 h-3.5 text-[#C87D55]" />;
      case 'research':
        return <FlaskConical className="w-3.5 h-3.5 text-[#C87D55]" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-[#C87D55]" />;
    }
  };

  return (
    <section id="experience" className="py-24 relative bg-[#09090B] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 font-serif">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-[0.2em] bg-[#121215] text-[#C87D55] border border-[#C87D55]/30 mb-3">
            <span className="w-1.5 h-1.5 rotate-45 bg-[#C87D55]" />
            <Calendar className="w-3.5 h-3.5 text-[#C87D55]" />
            <span>ACADEMIC TRAJECTORY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#FFFFFF] tracking-tight">
            Education & Appointments
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#9CA3AF]">
            Doctoral scholarship, research experience, and engineering background within the Department of Mechanical Engineering at Brigham Young University.
          </p>
        </div>

        {/* Timeline Flow (Sharp Architectural Lines) */}
        <div className="relative border-l border-[#27272A] ml-4 sm:ml-8 space-y-10">
          {timeline.map((item: TimelineItem) => (
            <div key={item.id} className="relative pl-8 sm:pl-10">
              
              {/* Art Deco Diamond Node */}
              <div className="absolute -left-[14px] top-2 w-7 h-7 rotate-45 bg-[#121215] border border-[#C87D55] flex items-center justify-center shadow-md shadow-black group">
                <div className="-rotate-45">
                  {getTypeIcon(item.type)}
                </div>
              </div>

              {/* Card Content (Art Deco Inset Frame) */}
              <div className="p-6 sm:p-7 deco-card deco-corners transition-all font-serif">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#FFFFFF]">
                      {item.role}
                    </h3>
                    <p className="text-sm font-serif font-semibold text-[#F4F4F5]">
                      {item.organization}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:text-right">
                    <span className="px-2.5 py-1 text-xs font-mono bg-[#09090B] text-[#9CA3AF] border border-[#27272A] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C87D55]" />
                      {item.period}
                    </span>
                    <span className="text-xs font-serif text-[#9CA3AF] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C87D55]" />
                      {item.location}
                    </span>
                  </div>
                </div>

                {/* Bulleted Points */}
                <ul className="space-y-2 mt-4">
                  {item.description.map((desc, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-serif text-[#9CA3AF]">
                      <span className="w-1.5 h-1.5 rotate-45 bg-[#C87D55] mt-1.5 shrink-0" />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>

                {/* Tag Pills */}
                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-[#27272A]">
                    {item.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 text-xs font-serif bg-[#1E1E24] text-[#F4F4F5] border border-[#27272A] hover:border-[#C87D55]/40 transition-colors"
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
