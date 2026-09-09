import React from 'react';
import { Mail, ArrowUp } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { portfolioData } from '../data/portfolioData';

export const Footer: React.FC = () => {
  const { personal } = portfolioData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#09090B] border-t border-[#27272A] py-12 text-[#9CA3AF] font-serif text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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

          {/* Center Social Links */}
          <div className="flex items-center gap-3">
            <a
              href={personal.links.scholar}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#121215] border border-[#27272A] text-[#9CA3AF] hover:text-[#FFFFFF] hover:border-[#FFFFFF] hover:bg-[#1E1E24] transition-all cursor-pointer"
              title="Google Scholar"
            >
              <span className="font-serif font-bold text-xs">GS</span>
            </a>

            <a
              href={personal.links.github}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#121215] border border-[#27272A] text-[#9CA3AF] hover:text-[#FFFFFF] hover:border-[#FFFFFF] hover:bg-[#1E1E24] transition-all cursor-pointer"
              title="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#121215] border border-[#27272A] text-[#9CA3AF] hover:text-[#FFFFFF] hover:border-[#FFFFFF] hover:bg-[#1E1E24] transition-all cursor-pointer"
              title="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.email}
              className="p-2.5 bg-[#121215] border border-[#27272A] text-[#9CA3AF] hover:text-[#FFFFFF] hover:border-[#FFFFFF] hover:bg-[#1E1E24] transition-all cursor-pointer"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#121215] border border-[#27272A] text-[#9CA3AF] hover:text-[#FFFFFF] hover:border-[#FFFFFF] hover:bg-[#1E1E24] transition-all uppercase tracking-wider text-[11px] cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-[#FFFFFF]" />
          </button>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#9CA3AF]/80 text-[11px]">
          <div>
            © {new Date().getFullYear()} {personal.name}. Brigham Young University.
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#9CA3AF]">
              <span className="w-1.5 h-1.5 bg-[#FFFFFF]" />
              Cloudflare Pages & GitHub
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
