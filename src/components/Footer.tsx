import React from 'react';
import { Mail, ArrowUp } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { portfolioData } from '../data/portfolioData';
import { DecoDivider } from './DecoDivider';

export const Footer: React.FC = () => {
  const { personal } = portfolioData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#09090B] border-t border-[#27272A] py-12 text-[#9CA3AF] font-serif text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Art Deco Geometric Divider */}
        <DecoDivider className="pb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#27272A]">
          
          {/* Left info */}
          <div className="text-center md:text-left space-y-1">
            <div className="text-[#FFFFFF] font-serif font-bold text-sm">
              {personal.name} · Ph.D. Student
            </div>
            <div className="text-[#9CA3AF]">
              {personal.lab} · {personal.department}
            </div>
            <div className="text-[#9CA3AF]/70">
              {personal.university} · Provo, UT
            </div>
          </div>

          {/* Center Social Links with Inset Frames */}
          <div className="flex items-center gap-3">
            <a
              href={personal.links.scholar}
              target="_blank"
              rel="noreferrer"
              className="relative p-2.5 bg-[#121215] border border-[#27272A] hover:border-[#C87D55] text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1A181A] transition-all cursor-pointer group"
              title="Google Scholar"
            >
              <div className="absolute inset-[2px] border border-[#C87D55]/10 group-hover:border-[#C87D55]/40 transition-colors pointer-events-none" />
              <span className="font-serif font-bold text-xs">GS</span>
            </a>

            <a
              href={personal.links.github}
              target="_blank"
              rel="noreferrer"
              className="relative p-2.5 bg-[#121215] border border-[#27272A] hover:border-[#C87D55] text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1A181A] transition-all cursor-pointer group"
              title="GitHub"
            >
              <div className="absolute inset-[2px] border border-[#C87D55]/10 group-hover:border-[#C87D55]/40 transition-colors pointer-events-none" />
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="relative p-2.5 bg-[#121215] border border-[#27272A] hover:border-[#C87D55] text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1A181A] transition-all cursor-pointer group"
              title="LinkedIn"
            >
              <div className="absolute inset-[2px] border border-[#C87D55]/10 group-hover:border-[#C87D55]/40 transition-colors pointer-events-none" />
              <LinkedinIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.email}
              className="relative p-2.5 bg-[#121215] border border-[#27272A] hover:border-[#C87D55] text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1A181A] transition-all cursor-pointer group"
              title="Email"
            >
              <div className="absolute inset-[2px] border border-[#C87D55]/10 group-hover:border-[#C87D55]/40 transition-colors pointer-events-none" />
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="relative inline-flex items-center gap-2 px-4 py-2 bg-[#121215] border border-[#27272A] hover:border-[#C87D55] text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1A181A] transition-all uppercase tracking-widest text-[11px] cursor-pointer group"
          >
            <div className="absolute inset-[2px] border border-[#C87D55]/10 group-hover:border-[#C87D55]/40 transition-colors pointer-events-none" />
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-[#C87D55]" />
          </button>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#9CA3AF]/80 text-[11px]">
          <div>
            © {new Date().getFullYear()} {personal.name}. Brigham Young University.
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#9CA3AF]">
              <span className="w-1.5 h-1.5 rotate-45 bg-[#C87D55]" />
              Cloudflare Pages & GitHub
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
