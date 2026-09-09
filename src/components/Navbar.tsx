import React, { useState, useEffect } from 'react';
import { Menu, X, FileDown, ExternalLink, Activity, BookOpen, Layers, Briefcase, Mail } from 'lucide-react';
import { GithubIcon } from './Icons';
import { portfolioData } from '../data/portfolioData';

interface NavbarProps {
  onOpenCv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCv }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Research', href: '#research', icon: Activity },
    { label: 'Publications', href: '#publications', icon: BookOpen },
    { label: 'Projects', href: '#projects', icon: Layers },
    { label: 'Experience', href: '#experience', icon: Briefcase },
    { label: 'Skills', href: '#skills', icon: null },
    { label: 'Contact', href: '#contact', icon: Mail },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#09090B]/95 backdrop-blur-md border-b border-[#27272A] shadow-xl shadow-black/80 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo (Architectural Monogram Crest) */}
        <a 
          href="#" 
          className="group flex items-center gap-3.5 transition-transform"
        >
          <div className="w-10 h-10 bg-[#121215] border border-[#27272A] group-hover:border-[#FFFFFF] flex items-center justify-center transition-colors">
            <span className="font-serif font-bold text-[#FFFFFF] text-sm tracking-wider">
              CW
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#F4F4F5] tracking-wide text-base group-hover:text-[#FFFFFF] transition-colors">
                {portfolioData.personal.name}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#1E1E24] text-[#9CA3AF] border border-[#27272A]">
                BYU MechE
              </span>
            </div>
            <span className="text-xs font-serif italic text-[#9CA3AF] tracking-normal">
              Neuromechanics & BCI Laboratory
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 font-serif">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-1.5 text-sm text-[#9CA3AF] hover:text-[#F4F4F5] hover:bg-[#1E1E24] transition-all tracking-wide border-b-2 border-transparent hover:border-[#FFFFFF]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={portfolioData.personal.links.github}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-[#9CA3AF] hover:text-[#F4F4F5] hover:bg-[#1E1E24] transition-all border border-transparent hover:border-[#27272A]"
            title="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif font-semibold tracking-wider uppercase bg-[#FFFFFF] hover:bg-[#F4F4F5] text-[#09090B] border border-[#FFFFFF] shadow-md transition-all cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-[#09090B]" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenCv}
            className="p-2 text-[#09090B] bg-[#FFFFFF] border border-[#FFFFFF] text-xs"
            title="CV"
          >
            <FileDown className="w-4 h-4 text-[#09090B]" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#9CA3AF] hover:text-[#F4F4F5]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-[#121215] border-b border-[#27272A] font-serif">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-[#F4F4F5] hover:text-[#FFFFFF] hover:bg-[#1E1E24] border-l-2 border-transparent hover:border-[#FFFFFF]"
              >
                {link.icon && <link.icon className="w-4 h-4 text-[#9CA3AF]" />}
                <span>{link.label}</span>
              </a>
            ))}
            
            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
              <a
                href={portfolioData.personal.links.byuLab}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#9CA3AF] hover:text-[#F4F4F5] flex items-center gap-1.5"
              >
                <span>BYU Neuromechanics Group</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={portfolioData.personal.links.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-[#9CA3AF] hover:text-[#F4F4F5]"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
