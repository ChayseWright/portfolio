export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: 'journal' | 'conference' | 'preprint' | 'patent';
  doi?: string;
  pdfUrl?: string;
  codeUrl?: string;
  bibtex: string;
  abstract: string;
  featured?: boolean;
  tags: string[];
}

export interface Project {
  id: string;
  title: string;
  category: 'hardware' | 'bci' | 'simulation' | 'software';
  shortDesc: string;
  fullDesc: string;
  metrics: { label: string; value: string }[];
  tools: string[];
  imageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  paperUrl?: string;
  featured?: boolean;
}

export interface ResearchThrust {
  id: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  methodologies: string[];
  metrics: { label: string; value: string }[];
  iconName: string;
}

export interface TimelineItem {
  id: string;
  type: 'education' | 'research' | 'industry' | 'teaching';
  role: string;
  organization: string;
  location: string;
  period: string;
  description: string[];
  skills?: string[];
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'paper' | 'award' | 'conference' | 'lab';
  link?: string;
}

export const portfolioData = {
  personal: {
    name: "Chayse Wright",
    title: "Ph.D. Student in Mechanical Engineering",
    lab: "Neuromechanics Research Group",
    labUrl: "https://neuromechanics.byu.edu",
    department: "Department of Mechanical Engineering",
    university: "Brigham Young University (BYU)",
    location: "Provo, Utah, USA",
    email: "chaysew@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    bioHeadline: "Mechanical Engineering · Neuromechanics · Brain-Computer Interfaces (BCI)",
    bioParagraphs: [
      "I am a second-year Mechanical Engineering Ph.D. student at Brigham Young University conducting research within the BYU Neuromechanics Research Group. Prior to BYU, I completed my Bachelor's degree in Mechanical Engineering at Queen's University in Kingston (2018–2023).",
      "My core research interests center on Brain-Computer Interfaces (BCI), neuromuscular motor control, and biomechanical modeling."
    ],
    resumePdfUrl: "#",
    links: {
      scholar: "https://scholar.google.com",
      github: "https://github.com/ChayseWright",
      linkedin: "https://linkedin.com",
      orcid: "https://orcid.org",
      email: "mailto:chaysew@gmail.com",
      byuLab: "https://neuromechanics.byu.edu"
    }
  },

  stats: [
    { label: "Current Program", value: "Ph.D. Student" },
    { label: "Graduate Lab", value: "Neuromechanics" },
    { label: "Graduate School", value: "BYU" },
    { label: "Undergraduate", value: "Queen's Univ." }
  ],

  researchThrusts: [
    {
      id: "bci-interfaces",
      title: "Brain-Computer Interfaces (BCI)",
      tagline: "Cortical and neuromuscular interface architectures for motor decoding",
      description: "Investigating decoding architectures for electrophysiological signals (EEG/EMG) to interface biological neural command with mechanical and assistive systems.",
      highlights: [
        "Real-time signal processing and feature extraction",
        "Neuromotor intent classification and continuous kinematics",
        "Interface synthesis and latency considerations"
      ],
      methodologies: [
        "EEG / HD-sEMG",
        "Neural Signal Processing",
        "Machine Learning",
        "Closed-Loop Control"
      ],
      metrics: [
        { label: "Domain", value: "BCI" },
        { label: "Focus", value: "Decoding" },
        { label: "Signals", value: "EEG / EMG" }
      ],
      iconName: "BrainCircuit"
    },
    {
      id: "neuromechanics-dynamics",
      title: "Neuromechanics & Biomechanical Dynamics",
      tagline: "Characterizing neuromotor control through dynamic modeling",
      description: "Applying rigid-body dynamics, musculoskeletal simulations, and experimental biomechanics to understand how the nervous system regulates limb stabilization and adapts to perturbations.",
      highlights: [
        "Dynamic modeling of musculoskeletal structures",
        "Kinematic and kinetic motion capture analysis",
        "Joint impedance and neuromuscular control"
      ],
      methodologies: [
        "Musculoskeletal Dynamics",
        "Biomechanical Modeling",
        "Motion Capture",
        "Kinematic Analysis"
      ],
      metrics: [
        { label: "Domain", value: "Neuromechanics" },
        { label: "Analysis", value: "Dynamics" },
        { label: "Model", value: "Musculoskeletal" }
      ],
      iconName: "Activity"
    }
  ] as ResearchThrust[],

  publications: [] as Publication[],

  projects: [] as Project[],

  // Clean toolchain without CAD section, without percentages
  skills: {
    bciAndNeuro: [
      "Brain-Computer Interfaces (BCI)",
      "EEG / EMG Signal Processing",
      "Biomechanical Modeling (OpenSim)",
      "Motion Capture & Kinematic Analysis",
      "Bio-potential Instrumentation",
      "Lab Streaming Layer (LSL)"
    ],
    mechatronicsAndControl: [
      "MATLAB & Simulink",
      "Dynamic Systems & Control",
      "Data Acquisition (DAQ Instrumentation)",
      "Embedded Systems",
      "Actuator & Sensor Integration"
    ],
    computationAndCoding: [
      "Python (NumPy, SciPy, PyTorch)",
      "C / C++",
      "Git Version Control",
      "LaTeX Scientific Typesetting",
      "Linux Environments"
    ]
  },

  timeline: [
    {
      id: "time-1",
      type: "education",
      role: "Ph.D. Student in Mechanical Engineering",
      organization: "Brigham Young University (BYU)",
      location: "Provo, UT",
      period: "2025 – Present",
      description: [
        "Department of Mechanical Engineering, Brigham Young University.",
        "Graduate researcher in the BYU Neuromechanics Research Group.",
        "Primary Focus: Brain-Computer Interfaces (BCI), Neuromechanics, Biomechanical Modeling."
      ],
      skills: ["BCI", "Neuromechanics", "Biomechanical Modeling", "Mechanical Engineering"]
    },
    {
      id: "time-2",
      type: "research",
      role: "Graduate Research Assistant",
      organization: "BYU Neuromechanics Research Group",
      location: "Provo, UT",
      period: "2025 – Present",
      description: [
        "Conducting doctoral research in neural interfaces and neuromotor biomechanics.",
        "Developing computational algorithms for neural decoding and dynamic musculoskeletal analysis."
      ],
      skills: ["BCI", "Neural Decoding", "Biomechanics"]
    },
    {
      id: "time-3",
      type: "education",
      role: "B.Sc. in Mechanical Engineering",
      organization: "Queen's University",
      location: "Kingston, Ontario, Canada",
      period: "2018 – 2023",
      description: [
        "Department of Mechanical and Materials Engineering, Queen's University.",
        "Comprehensive training in mechanical engineering, dynamic systems, numerical analysis, and materials."
      ],
      skills: ["Mechanical Engineering", "Dynamics", "Numerical Methods"]
    }
  ] as TimelineItem[],

  news: [] as NewsItem[],

  contact: {
    labName: "Neuromechanics Research Group",
    institution: "Brigham Young University",
    department: "Department of Mechanical Engineering",
    location: "Provo, Utah, USA",
    email: "chaysew@gmail.com",
    labSite: "https://neuromechanics.byu.edu",
    availability: "Open to research discussions, academic inquiries, and collaborative dialogues."
  }
};
