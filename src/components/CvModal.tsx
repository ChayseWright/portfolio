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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-black border-2 border-white/40 shadow-2xl flex flex-col overflow-hidden font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-neutral-950">
          <div className="flex items-center gap-2 text-white text-xs uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 bg-white" />
            <span>Curriculum Vitae · Academic Record</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold text-black bg-white hover:bg-neutral-200 border border-white transition-all"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-black" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
              aria-label="Close CV modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Content */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8 bg-black text-white">
          
          {/* Header */}
          <div className="border-b-2 border-white/20 pb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                {personal.name}
              </h1>
              <p className="text-base font-serif text-neutral-300 italic mt-1">
                {personal.title}
              </p>
              <p className="text-xs font-serif text-neutral-400 mt-0.5">
                {personal.lab} · {personal.university}
              </p>
            </div>
            <div className="text-xs font-serif text-neutral-400 text-center sm:text-right space-y-1">
              <div>{personal.email}</div>
              <div>{personal.location}</div>
              <div className="text-neutral-300">{personal.department}</div>
            </div>
          </div>

          {/* Education */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-white/20 pb-1.5">
              <GraduationCap className="w-4 h-4 text-neutral-400" />
              <span>Education</span>
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-white">Ph.D. in Mechanical Engineering</div>
                  <div className="text-neutral-400">Brigham Young University, Provo, UT</div>
                  <div className="text-xs text-neutral-400 italic">Specialization: Neuromechanics, Brain-Computer Interfaces (BCI)</div>
                </div>
                <div className="text-xs font-mono text-white">2025 – Present</div>
              </div>

              <div className="flex justify-between items-start pt-2">
                <div>
                  <div className="font-bold text-white">B.Sc. in Mechanical Engineering</div>
                  <div className="text-neutral-400">Queen's University, Kingston, Ontario, Canada</div>
                </div>
                <div className="text-xs font-mono text-white">2018 – 2023</div>
              </div>
            </div>
          </section>

          {/* Research Appointments */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-white/20 pb-1.5">
              <Building className="w-4 h-4 text-neutral-400" />
              <span>Research Experience</span>
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-white">Graduate Research Assistant</div>
                  <div className="text-xs font-mono text-white">2025 – Present</div>
                </div>
                <div className="text-neutral-400 text-xs mb-2">BYU Neuromechanics Research Group</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                  <li>Conducting doctoral research in Brain-Computer Interfaces (BCI), neuromuscular motor control, and biomechanical modeling.</li>
                  <li>Developing computational algorithms for neural decoding and dynamic musculoskeletal analysis.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Publications */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-white/20 pb-1.5">
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span>Publications & Manuscripts</span>
            </h2>
            <div className="text-xs text-neutral-400">
              {publications.length === 0 ? (
                <p className="italic">
                  Manuscripts and conference proceedings currently in preparation in the BYU Neuromechanics Research Group.
                </p>
              ) : (
                publications.map((p, idx) => (
                  <div key={p.id} className="text-white leading-relaxed">
                    <span className="font-bold text-white">[{idx + 1}]</span>{' '}
                    <span>{p.authors.join(', ')}.</span>{' '}
                    <span className="font-semibold">"{p.title}."</span>{' '}
                    <span className="italic text-neutral-300">{p.venue}</span>, {p.year}.
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Technical Proficiencies */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-white/20 pb-1.5">
              <Wrench className="w-4 h-4 text-neutral-400" />
              <span>Technical Skills</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-neutral-950 border border-white/20">
                <span className="font-bold text-white block mb-1">Neuromechanics & BCI:</span>
                <span className="text-neutral-300">Brain-Computer Interfaces, EEG/EMG signal processing, Biomechanical modeling (OpenSim).</span>
              </div>
              <div className="p-3 bg-neutral-950 border border-white/20">
                <span className="font-bold text-white block mb-1">Mechatronics & Control:</span>
                <span className="text-neutral-300">MATLAB & Simulink, Dynamic Systems, Sensors & DAQ Instrumentation.</span>
              </div>
              <div className="p-3 bg-neutral-950 border border-white/20">
                <span className="font-bold text-white block mb-1">Computation & Programming:</span>
                <span className="text-neutral-300">Python (NumPy, SciPy, PyTorch), C/C++, Git, LaTeX, Linux.</span>
              </div>
            </div>
          </section>

          {/* Affiliations */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-white/20 pb-1.5">
              <Award className="w-4 h-4 text-neutral-400" />
              <span>Affiliations</span>
            </h2>
            <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
              <li>BYU Neuromechanics Research Group</li>
              <li>Department of Mechanical Engineering, Brigham Young University</li>
            </ul>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/20 bg-neutral-950">
          <span className="text-xs font-serif text-neutral-500">
            Curriculum Vitae · Brigham Young University
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-white hover:bg-neutral-200 text-black border border-white transition-all"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Download / Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
