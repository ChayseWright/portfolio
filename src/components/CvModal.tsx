import React from 'react';
import { X, Printer, Download, GraduationCap, Award, BookOpen, Wrench, Building } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

interface CvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CvModal: React.FC<CvModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { personal, publications } = portfolioData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1811] border-2 border-[#CBA95D] shadow-2xl flex flex-col overflow-hidden font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C5F3E] bg-[#09140e]">
          <div className="flex items-center gap-2 text-[#CBA95D] text-xs uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 bg-[#CBA95D]" />
            <span>Curriculum Vitae · Academic Record</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-[#F1F1F1] bg-[#2C5F3E] hover:bg-[#234d32] border border-[#CBA95D] transition-all"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#CBA95D]" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#DDC6A4] hover:text-[#CBA95D] hover:bg-[#162e20] transition-all"
              aria-label="Close CV modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Content */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8 bg-[#0c1811] text-[#F1F1F1]">
          
          {/* Header */}
          <div className="border-b-2 border-[#2C5F3E] pb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#F1F1F1] tracking-tight">
                {personal.name}
              </h1>
              <p className="text-base font-serif text-[#CBA95D] italic mt-1">
                {personal.title}
              </p>
              <p className="text-xs font-serif text-[#DDC6A4] mt-0.5">
                {personal.lab} · {personal.university}
              </p>
            </div>
            <div className="text-xs font-serif text-[#DDC6A4] text-center sm:text-right space-y-1">
              <div>{personal.email}</div>
              <div>{personal.location}</div>
              <div className="text-[#CBA95D]">{personal.department}</div>
            </div>
          </div>

          {/* Education */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-[#CBA95D] font-bold flex items-center gap-2 border-b border-[#2C5F3E] pb-1.5">
              <GraduationCap className="w-4 h-4 text-[#CBA95D]" />
              <span>Education</span>
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-[#F1F1F1]">Ph.D. in Mechanical Engineering</div>
                  <div className="text-[#DDC6A4]">Brigham Young University, Provo, UT</div>
                  <div className="text-xs text-[#DDC6A4]/80 italic">Specialization: Neuromechanics, Brain-Computer Interfaces (BCI)</div>
                </div>
                <div className="text-xs font-mono text-[#CBA95D]">2023 – Present</div>
              </div>

              <div className="flex justify-between items-start pt-2">
                <div>
                  <div className="font-bold text-[#F1F1F1]">B.Sc. in Mechanical Engineering</div>
                  <div className="text-[#DDC6A4]">Queen's University, Kingston, Ontario, Canada</div>
                </div>
                <div className="text-xs font-mono text-[#CBA95D]">2018 – 2023</div>
              </div>
            </div>
          </section>

          {/* Research Appointments */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-[#CBA95D] font-bold flex items-center gap-2 border-b border-[#2C5F3E] pb-1.5">
              <Building className="w-4 h-4 text-[#CBA95D]" />
              <span>Research Experience</span>
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-[#F1F1F1]">Graduate Research Assistant</div>
                  <div className="text-xs font-mono text-[#CBA95D]">2023 – Present</div>
                </div>
                <div className="text-[#DDC6A4] text-xs mb-2">BYU Neuromechanics Research Group</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#F1F1F1]/85">
                  <li>Conducting doctoral research in Brain-Computer Interfaces (BCI), neuromuscular motor control, and biomechanical modeling.</li>
                  <li>Developing computational algorithms for neural decoding and dynamic musculoskeletal analysis.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Publications */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-[#CBA95D] font-bold flex items-center gap-2 border-b border-[#2C5F3E] pb-1.5">
              <BookOpen className="w-4 h-4 text-[#CBA95D]" />
              <span>Publications & Manuscripts</span>
            </h2>
            <div className="text-xs text-[#DDC6A4]">
              {publications.length === 0 ? (
                <p className="italic">
                  Manuscripts and conference proceedings currently in preparation in the BYU Neuromechanics Research Group.
                </p>
              ) : (
                publications.map((p, idx) => (
                  <div key={p.id} className="text-[#F1F1F1] leading-relaxed">
                    <span className="font-bold text-[#CBA95D]">[{idx + 1}]</span>{' '}
                    <span>{p.authors.join(', ')}.</span>{' '}
                    <span className="font-semibold">"{p.title}."</span>{' '}
                    <span className="italic text-[#CBA95D]">{p.venue}</span>, {p.year}.
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Technical Proficiencies */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-[#CBA95D] font-bold flex items-center gap-2 border-b border-[#2C5F3E] pb-1.5">
              <Wrench className="w-4 h-4 text-[#CBA95D]" />
              <span>Technical Skills</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#0e1f16] border border-[#2C5F3E]">
                <span className="font-bold text-[#CBA95D] block mb-1">Neuromechanics & BCI:</span>
                <span className="text-[#DDC6A4]">Brain-Computer Interfaces, EEG/EMG signal processing, Biomechanical modeling (OpenSim).</span>
              </div>
              <div className="p-3 bg-[#0e1f16] border border-[#2C5F3E]">
                <span className="font-bold text-[#CBA95D] block mb-1">Mechatronics & Control:</span>
                <span className="text-[#DDC6A4]">MATLAB & Simulink, Dynamic Systems, Sensors & DAQ Instrumentation.</span>
              </div>
              <div className="p-3 bg-[#0e1f16] border border-[#2C5F3E]">
                <span className="font-bold text-[#CBA95D] block mb-1">Computation & Programming:</span>
                <span className="text-[#DDC6A4]">Python (NumPy, SciPy, PyTorch), C/C++, Git, LaTeX, Linux.</span>
              </div>
            </div>
          </section>

          {/* Honors */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-[#CBA95D] font-bold flex items-center gap-2 border-b border-[#2C5F3E] pb-1.5">
              <Award className="w-4 h-4 text-[#CBA95D]" />
              <span>Affiliations</span>
            </h2>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#DDC6A4]">
              <li>BYU Neuromechanics Research Group</li>
              <li>Department of Mechanical Engineering, Brigham Young University</li>
            </ul>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C5F3E] bg-[#09140e]">
          <span className="text-xs font-serif text-[#DDC6A4]/70">
            Curriculum Vitae · Brigham Young University
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-[#2C5F3E] hover:bg-[#234d32] text-[#F1F1F1] border border-[#CBA95D] transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#CBA95D]" />
              <span>Download / Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider text-[#DDC6A4] hover:text-[#F1F1F1] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
