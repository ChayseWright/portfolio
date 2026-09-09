import React from 'react';
import { Bell, Award, BookOpen, Mic, Users, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { NewsItem } from '../data/portfolioData';

export const NewsSection: React.FC = () => {
  const { news } = portfolioData;

  if (!news || news.length === 0) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'paper':
        return <BookOpen className="w-3.5 h-3.5 text-[#CBA95D]" />;
      case 'award':
        return <Award className="w-3.5 h-3.5 text-[#CBA95D]" />;
      case 'conference':
        return <Mic className="w-3.5 h-3.5 text-[#CBA95D]" />;
      default:
        return <Users className="w-3.5 h-3.5 text-[#CBA95D]" />;
    }
  };

  return (
    <section id="news" className="py-20 relative bg-[#0c1811] border-t border-[#2C5F3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-10 font-serif">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]/40 mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>DISPATCHES & ANNOUNCEMENTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F1F1F1] tracking-tight">
              Recent News & Updates
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-serif">
          {news.map((item: NewsItem) => (
            <div
              key={item.id}
              className="p-5 bg-[#0e1f16] border border-[#2C5F3E] hover:border-[#CBA95D] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#162e20] text-[#CBA95D] border border-[#2C5F3E]">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>
                  <span className="text-xs font-mono text-[#DDC6A4]">
                    {item.date}
                  </span>
                </div>

                <h3 className="text-sm font-serif font-bold text-[#F1F1F1] mb-1.5 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#DDC6A4] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.link && (
                <div className="mt-4 pt-3 border-t border-[#2C5F3E]">
                  <a
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs text-[#CBA95D] hover:text-[#F1F1F1]"
                  >
                    <span>Read Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
