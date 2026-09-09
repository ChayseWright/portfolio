import React from 'react';
import { 
  FolderGit2, 
  ArrowUpRight,
  Cpu
} from 'lucide-react';
import { GithubIcon, YoutubeIcon, ColabIcon } from './Icons';
import { portfolioData } from '../data/portfolioData';
import type { Project } from '../data/portfolioData';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const { projects } = portfolioData;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bci':
        return 'Neural Decoding & BCI';
      case 'simulation':
        return 'Applied Math & Graph Simulation';
      case 'software':
        return 'NLP & Knowledge Engineering';
      default:
        return category.toUpperCase();
    }
  };

  return (
    <section id="projects" className="py-24 relative bg-[#09140e] border-t border-[#2C5F3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 font-serif">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]/40 mb-3">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>ENGINEERING & COMPUTATIONAL SYSTEMS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F1F1F1] tracking-tight">
            Selected Research & Engineering Projects
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#DDC6A4] leading-relaxed">
            Applied neural signal processing, graph-theoretic thermal diffusion models, and automated natural language processing architectures.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-serif">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className="group bg-[#0e1f16] border border-[#2C5F3E] hover:border-[#CBA95D] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#2C5F3E]/20"
              >
                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#2C5F3E] mb-4">
                    <span className="px-2.5 py-1 text-[11px] uppercase tracking-wider bg-[#162e20] text-[#CBA95D] border border-[#2C5F3E]">
                      {getCategoryLabel(project.category)}
                    </span>
                    {project.featured && (
                      <span className="text-[11px] uppercase tracking-widest text-[#CBA95D] font-serif">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 
                    onClick={() => onSelectProject(project)}
                    className="text-xl font-serif font-bold text-[#F1F1F1] group-hover:text-[#CBA95D] transition-colors leading-snug cursor-pointer mb-2"
                  >
                    {project.title}
                  </h3>
                  {project.subtitle && (
                    <p className="text-xs font-serif italic text-[#CBA95D] mb-4">
                      {project.subtitle}
                    </p>
                  )}

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm font-serif text-[#DDC6A4] leading-relaxed mb-6">
                    {project.shortDesc}
                  </p>

                  {/* Quantitative Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {project.metrics.map((m, mIdx) => (
                      <div 
                        key={mIdx}
                        className="p-2.5 bg-[#060c08] border border-[#2C5F3E] flex flex-col justify-between text-center"
                      >
                        <span className="text-[9px] uppercase tracking-wider text-[#DDC6A4] line-clamp-1 mb-1">
                          {m.label}
                        </span>
                        <span className="text-xs font-serif font-bold text-[#CBA95D] line-clamp-1">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Computational Toolstack (No checkmarks) */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.slice(0, 4).map((tool, tIdx) => (
                        <span 
                          key={tIdx}
                          className="px-2.5 py-1 text-[11px] bg-[#162e20] text-[#DDC6A4] border border-[#2C5F3E] flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 bg-[#CBA95D] shrink-0" />
                          <span>{tool}</span>
                        </span>
                      ))}
                      {project.tools.length > 4 && (
                        <span className="px-2 py-1 text-[11px] text-[#DDC6A4]/70">
                          +{project.tools.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="pt-4 border-t border-[#2C5F3E] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-[#162e20] text-[#DDC6A4] hover:text-[#F1F1F1] border border-[#2C5F3E] hover:border-[#CBA95D] transition-all"
                        title="View Source Code on GitHub"
                        aria-label="View Source Code on GitHub"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-serif bg-[#8B0000]/70 hover:bg-[#8B0000] text-[#F1F1F1] border border-red-500/40 transition-all"
                        title="Watch Simulation Demo on YouTube"
                      >
                        <YoutubeIcon className="w-3.5 h-3.5 text-white" />
                        <span>Demo</span>
                      </a>
                    )}
                    {project.colabUrl && (
                      <a
                        href={project.colabUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-serif bg-[#162e20] hover:bg-[#1f3f2c] text-[#CBA95D] border border-[#CBA95D]/50 transition-all"
                        title="Open Interactive Google Colab Notebook"
                      >
                        <ColabIcon className="w-3.5 h-3.5 text-[#CBA95D]" />
                        <span>Colab</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif uppercase tracking-wider font-bold bg-[#2C5F3E] hover:bg-[#1e422b] text-[#F1F1F1] border border-[#CBA95D] transition-all ml-auto"
                  >
                    <span>Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#CBA95D]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 text-center bg-[#0e1f16] border border-[#2C5F3E] font-serif max-w-3xl mx-auto shadow-xl">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#162e20] border border-[#CBA95D] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#CBA95D]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F1F1F1] mb-2">
              Laboratory Systems & Hardware Development
            </h3>
            <p className="text-sm sm:text-base text-[#DDC6A4] max-w-xl mx-auto leading-relaxed mb-6">
              Experimental rigs and computational BCI software frameworks will be documented here.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-[#CBA95D] bg-[#0a160f] border border-[#2C5F3E]">
              <span>Hardware & Modeling In Progress</span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
