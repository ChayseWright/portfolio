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
          ? 'bg-[#0a160f]/95 backdrop-blur-md border-b border-[#CBA95D]/30 shadow-xl shadow-black/40 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo (Sharp, Regal Serif Crest) */}
        <a 
          href="#" 
          className="group flex items-center gap-3.5 transition-transform"
        >
          <div className="w-10 h-10 bg-[#2C5F3E] border border-[#CBA95D] flex items-center justify-center shadow-sm">
            <span className="font-serif font-bold text-[#CBA95D] text-sm tracking-wider">
              CW
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#F1F1F1] tracking-wide text-base group-hover:text-[#CBA95D] transition-colors">
                {portfolioData.personal.name}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]/50">
                BYU MechE
              </span>
            </div>
            <span className="text-xs font-serif italic text-[#DDC6A4] tracking-normal">
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
              className="px-3.5 py-1.5 text-sm text-[#F1F1F1]/80 hover:text-[#CBA95D] hover:bg-[#162e20] transition-all tracking-wide border-b-2 border-transparent hover:border-[#CBA95D]"
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
            className="p-2 text-[#DDC6A4] hover:text-[#CBA95D] hover:bg-[#162e20] transition-all border border-transparent hover:border-[#CBA95D]/30"
            title="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif font-semibold tracking-wider uppercase bg-[#2C5F3E] hover:bg-[#234d32] text-[#F1F1F1] border border-[#CBA95D] shadow-md transition-all hover:border-[#F1F1F1]"
          >
            <FileDown className="w-3.5 h-3.5 text-[#CBA95D]" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenCv}
            className="p-2 text-[#CBA95D] bg-[#2C5F3E] border border-[#CBA95D]/50 text-xs"
            title="CV"
          >
            <FileDown className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#DDC6A4] hover:text-[#CBA95D]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-[#0a160f]/98 border-b border-[#CBA95D]/40 font-serif">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-[#F1F1F1] hover:text-[#CBA95D] hover:bg-[#162e20] border-l-2 border-transparent hover:border-[#CBA95D]"
              >
                {link.icon && <link.icon className="w-4 h-4 text-[#CBA95D]" />}
                <span>{link.label}</span>
              </a>
            ))}
            
            <div className="pt-3 border-t border-[#2C5F3E] flex items-center justify-between">
              <a
                href={portfolioData.personal.links.byuLab}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#CBA95D] flex items-center gap-1.5"
              >
                <span>BYU Neuromechanics Group</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={portfolioData.personal.links.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-[#DDC6A4] hover:text-[#CBA95D]"
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
