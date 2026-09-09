import React from 'react';
import { 
  Cpu, 
  BrainCircuit, 
  Wrench, 
  Binary, 
  Code2, 
  CheckCircle, 
  Award 
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const SkillsSection: React.FC = () => {
  const { skills } = portfolioData;

  const categories = [
    {
      title: "Neuromechanics & BCI",
      icon: BrainCircuit,
      accent: "text-cyan-400",
      border: "border-cyan-500/30",
      items: skills.bciAndNeuro
    },
    {
      title: "Mechanical CAD & Design",
      icon: Wrench,
      accent: "text-blue-400",
      border: "border-blue-500/30",
      items: skills.mechanicalAndCAD
    },
    {
      title: "Mechatronics & Control",
      icon: Cpu,
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      items: skills.mechatronicsAndControl
    },
    {
      title: "Scientific Computing & Code",
      icon: Binary,
      accent: "text-purple-400",
      border: "border-purple-500/30",
      items: skills.computationAndCoding
    }
  ];

  return (
    <section id="skills" className="py-24 relative bg-slate-950/80 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>TECHNICAL PROFICIENCIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineering Toolchain & Expertise
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A comprehensive synthesis of biomedical signal analysis, parametric mechanical design, embedded real-time control, and modern computational frameworks.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-2xl bg-slate-900/50 border ${cat.border} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <cat.icon className={`w-5 h-5 ${cat.accent}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  {cat.title}
                </h3>
              </div>

              {/* Skills with Progress Bars */}
              <div className="space-y-4">
                {cat.items.map((skill, sIdx) => (
                  <div key={sIdx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                        {skill.name}
                      </span>
                      <span className="text-cyan-400 font-semibold">{skill.level}%</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Certifications & Badges Row */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-wrap items-center justify-around gap-6">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">Certified SolidWorks Professional (CSWP)</div>
              <div className="text-[11px] font-mono text-slate-400">Mechanical Design & Advanced Modeling</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">NIH / IRB Human Subject Certified</div>
              <div className="text-[11px] font-mono text-slate-400">Electrophysiology & Biomedical Research Protocol</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">Tau Beta Pi Engineering Honor Society</div>
              <div className="text-[11px] font-mono text-slate-400">Brigham Young University Chapter</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
