import React from 'react';
import { 
  BrainCircuit, 
  Cpu, 
  Binary, 
  Code2
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const SkillsSection: React.FC = () => {
  const { skills } = portfolioData;

  const categories = [
    {
      title: "Brain-Computer Interfaces & Neuromechanics",
      icon: BrainCircuit,
      items: skills.bciAndNeuro
    },
    {
      title: "Dynamic Systems & Control",
      icon: Cpu,
      items: skills.mechatronicsAndControl
    },
    {
      title: "Scientific Computing & Modeling",
      icon: Binary,
      items: skills.computationAndCoding
    }
  ];

  return (
    <section id="skills" className="py-24 relative bg-[#09140e] border-t border-[#2C5F3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 font-serif">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]/40 mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>RESEARCH CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F1F1F1] tracking-tight">
            Toolchain & Methodologies
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#DDC6A4]">
            Technical skills and experimental tools utilized in ongoing graduate research.
          </p>
        </div>

        {/* Categories Grid (Clean, Dignified Lists without Percentages or Checkmarks) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-serif">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-7 bg-[#0e1f16] border border-[#2C5F3E] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2C5F3E]">
                  <div className="p-2.5 bg-[#162e20] border border-[#CBA95D]/40">
                    <cat.icon className="w-5 h-5 text-[#CBA95D]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#F1F1F1] leading-snug">
                    {cat.title}
                  </h3>
                </div>

                {/* Clean skill items (No checkmarks, No percentage bars) */}
                <ul className="space-y-3">
                  {cat.items.map((skill, sIdx) => (
                    <li 
                      key={sIdx}
                      className="text-sm font-serif text-[#F1F1F1]/90 flex items-center gap-2 pb-2 border-b border-[#162e20] last:border-0"
                    >
                      <span className="w-1.5 h-1.5 bg-[#CBA95D] shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
