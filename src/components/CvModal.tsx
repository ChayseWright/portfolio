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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/70 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>CURRICULUM VITAE · ACADEMIC DOSSIER</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
              aria-label="Close CV modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Content */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-950/40 text-slate-200 font-sans">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {personal.name}
              </h1>
              <p className="text-sm font-mono text-cyan-400 mt-1">
                {personal.title}
              </p>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {personal.lab} · {personal.university}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 text-center sm:text-right space-y-1">
              <div>{personal.email}</div>
              <div>{personal.location}</div>
              <div className="text-cyan-400">{personal.department}</div>
            </div>
          </div>

          {/* Education */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Education</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-100">Ph.D. in Mechanical Engineering</div>
                  <div className="text-slate-400">Brigham Young University, Provo, UT</div>
                  <div className="text-xs text-slate-400 italic">Specialization: Neuromechanics, BCI, Biomechanical Motor Control</div>
                </div>
                <div className="text-xs font-mono text-slate-400">2023 – Present (Exp. 2027)</div>
              </div>

              <div className="flex justify-between items-start pt-2">
                <div>
                  <div className="font-bold text-slate-100">B.S. in Mechanical Engineering</div>
                  <div className="text-slate-400">Brigham Young University, Provo, UT</div>
                  <div className="text-xs text-slate-400 italic">Magna Cum Laude · Tau Beta Pi Engineering Honor Society</div>
                </div>
                <div className="text-xs font-mono text-slate-400">2019 – 2023</div>
              </div>
            </div>
          </section>

          {/* Research Appointments */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Research Experience</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-slate-100">Graduate Research Fellow</div>
                  <div className="text-xs font-mono text-slate-400">2023 – Present</div>
                </div>
                <div className="text-slate-400 text-xs mb-2">BYU Neuromechanics Research Group · Advisor: Dr. Steven Charles</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  <li>Engineered closed-loop Brain-Computer Interface (BCI) decoding pipelines for multi-DOF prosthetic hands with sub-50ms latency.</li>
                  <li>Synthesized OpenSim 32-muscle dynamic musculoskeletal arm simulations with real-time Simulink co-simulation.</li>
                  <li>Constructed instrumented series-elastic tremor suppression testbenches with 6-DOF force/torque sensing.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Publications */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Peer-Reviewed Publications</span>
            </h2>
            <div className="space-y-3 text-xs">
              {publications.map((p, idx) => (
                <div key={p.id} className="text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-200">[{idx + 1}]</span>{' '}
                  <span className="text-slate-400">{p.authors.join(', ')}.</span>{' '}
                  <span className="font-semibold text-slate-100">"{p.title}."</span>{' '}
                  <span className="italic text-cyan-300">{p.venue}</span>, {p.year}.{' '}
                  {p.doi && <span className="text-[11px] font-mono text-slate-500">doi:{p.doi}</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Technical Proficiencies */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Technical Skills</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">Neuromechanics & BCI:</span>
                <span className="text-slate-300">EEG/sEMG signal processing, Motor decoding, OpenSim, LSL, Delsys, Vicon Mocap.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">CAD & Mechanical:</span>
                <span className="text-slate-300">SolidWorks CSWP, ANSYS FEA, GD&T, CNC Machining, FDM/SLA/Carbon-fiber prototyping.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">Mechatronics & Control:</span>
                <span className="text-slate-300">MATLAB/Simulink, Embedded C++ (STM32/ESP32), SEA Actuators, NI-DAQmx, ROS 2.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">Computation & Programming:</span>
                <span className="text-slate-300">Python (NumPy, SciPy, PyTorch, MNE), C++, Git, LaTeX, Linux RT.</span>
              </div>
            </div>
          </section>

          {/* Honors & Awards */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Honors & Affiliations</span>
            </h2>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>BYU Graduate Research Fellowship Award (2026)</li>
              <li>Tau Beta Pi National Engineering Honor Society (2022 - Present)</li>
              <li>Graduated Magna Cum Laude, Brigham Young University (2023)</li>
              <li>IEEE Engineering in Medicine and Biology Society (EMBS) Member</li>
              <li>American Society of Mechanical Engineers (ASME) Member</li>
            </ul>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <span className="text-xs font-mono text-slate-500">
            Official Curriculum Vitae · Last Updated: 2026
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download / Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
