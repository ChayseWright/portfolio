import React, { useState } from 'react';
import { 
  Wrench, 
  ExternalLink, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { portfolioData } from '../data/portfolioData';
import type { Project } from '../data/portfolioData';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const { projects } = portfolioData;
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'hardware', label: 'Hardware & Testbenches' },
    { id: 'bci', label: 'BCI & Prosthetics' },
    { id: 'simulation', label: 'Musculoskeletal Simulation' },
    { id: 'software', label: 'Software & Pipelines' }
  ];

  const filteredProjects = projects.filter((p) => {
    return activeCategory === 'all' || p.category === activeCategory;
  });

  return (
    <section id="projects" className="py-24 relative bg-slate-950/70 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>TANGIBLE ENGINEERING GALLERY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hardware Rigs & Neural Systems
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Physical mechatronic testbenches, sensorized wearable sleeves, BCI decoding pipelines, and OpenSim computational frameworks.
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-slate-950 text-cyan-300 border border-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {project.category}
                  </span>

                  {project.featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Flagship Rig</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                  {project.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                  {project.shortDesc}
                </p>

                {/* Engineering Specifications / Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5">
                  {project.metrics.map((m, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs font-bold font-mono text-cyan-300">
                        {m.value}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Toolchain tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded text-[11px] font-mono bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSelectProject(project)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Read Engineering Specs</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      className="p-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
                      title="View Interactive Model"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
