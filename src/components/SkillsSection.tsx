import React from 'react';
import { 
  Cpu, 
  BrainCircuit, 
  Wrench, 
  Binary, 
  Code2, 
  CheckCircle
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
      title: "Mechanical CAD & Design",
      icon: Wrench,
      items: skills.mechanicalAndCAD
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
            <span>TECHNICAL CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F1F1F1] tracking-tight">
            Engineering & Research Toolchain
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#DDC6A4]">
            Methodologies spanning electrophysiological signal processing, musculoskeletal dynamics, parametric mechanical design, and scientific computation.
          </p>
        </div>

        {/* Categories Grid (Sharp Rectangular Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-7 bg-[#0e1f16] border border-[#2C5F3E]"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2C5F3E]">
                <div className="p-2 bg-[#162e20] border border-[#CBA95D]/40">
                  <cat.icon className="w-5 h-5 text-[#CBA95D]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#F1F1F1]">
                  {cat.title}
                </h3>
              </div>

              {/* Skills with Progress Bars (Sharp Edges) */}
              <div className="space-y-4">
                {cat.items.map((skill, sIdx) => (
                  <div key={sIdx} className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#F1F1F1]/90 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#CBA95D]" />
                        {skill.name}
                      </span>
                      <span className="text-[#CBA95D] font-mono">{skill.level}%</span>
                    </div>

                    <div className="h-1.5 w-full bg-[#0a160f] border border-[#2C5F3E]">
                      <div
                        className="h-full bg-gradient-to-r from-[#2C5F3E] to-[#CBA95D] transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
