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
    title: "Ph.D. Candidate in Mechanical Engineering",
    lab: "Neuromechanics Research Group",
    labUrl: "https://neuromechanics.byu.edu",
    department: "Department of Mechanical Engineering",
    university: "Brigham Young University (BYU)",
    location: "Provo, Utah, USA",
    email: "chaysew@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    bioHeadline: "Mechanical Engineering · Neuromechanics · Brain-Computer Interfaces (BCI)",
    bioParagraphs: [
      "I am a Mechanical Engineering Ph.D. candidate at Brigham Young University conducting research within the BYU Neuromechanics Research Group.",
      "My core research interests center on Brain-Computer Interfaces (BCI), neuromuscular motor control, biomechanical modeling, and the engineering of neural prosthetics and assistive technologies to understand and enhance human movement."
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
    { label: "Institution", value: "BYU", suffix: "" },
    { label: "Laboratory", value: "Neuromechanics", suffix: "" },
    { label: "Core Discipline", value: "BCI & MechE", suffix: "" },
    { label: "Status", value: "Ph.D. Candidate", suffix: "" }
  ],

  researchThrusts: [
    {
      id: "bci-interfaces",
      title: "Brain-Computer Interfaces (BCI)",
      tagline: "Cortical & neuromuscular interface architectures for motor decoding",
      description: "Investigating real-time decoding architectures for electrophysiological signals (EEG/EMG) to interface biological neural command with mechanical and robotic systems.",
      highlights: [
        "Real-time signal processing and feature extraction",
        "Neuromotor intent classification and continuous kinematics",
        "Closed-loop interface synthesis and latency considerations"
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
        { label: "Modality", value: "EEG / EMG" }
      ],
      iconName: "BrainCircuit"
    },
    {
      id: "neuromechanics-dynamics",
      title: "Neuromechanics & Biomechanical Dynamics",
      tagline: "Characterizing neuromotor control through dynamic modeling",
      description: "Applying rigid-body dynamics, musculoskeletal simulations, and experimental biomechanics to understand how the nervous system regulates limb stiffness, coordinates muscles, and adapts to perturbations.",
      highlights: [
        "Dynamic modeling of human musculoskeletal structures",
        "Experimental kinematic and kinetic motion capture analysis",
        "Joint impedance and neuromuscular stabilization"
      ],
      methodologies: [
        "Musculoskeletal Dynamics",
        "OpenSim / Biomechanical Modeling",
        "Motion Capture",
        "Kinematic Analysis"
      ],
      metrics: [
        { label: "Domain", value: "Biomechanics" },
        { label: "Analysis", value: "Dynamics" },
        { label: "System", value: "Upper Limb" }
      ],
      iconName: "Activity"
    },
    {
      id: "robotic-prosthetics",
      title: "Bio-Mechatronic Systems & Assistive Devices",
      tagline: "Designing physical hardware that interfaces with biological mechanics",
      description: "Engineering actuated mechanisms, sensorized testbenches, and robotic orthoses/prostheses tailored to complement physiological motor function.",
      highlights: [
        "Mechanical CAD design, analysis, and prototyping",
        "Actuation and sensor integration for bio-mechatronic systems",
        "Benchtop experimental characterization and validation"
      ],
      methodologies: [
        "Mechanical Design (CAD/FEA)",
        "Mechatronic Prototyping",
        "Sensors & DAQ",
        "Control Systems"
      ],
      metrics: [
        { label: "Domain", value: "Mechatronics" },
        { label: "Design", value: "Parametric CAD" },
        { label: "Control", value: "Closed-Loop" }
      ],
      iconName: "Bot"
    }
  ] as ResearchThrust[],

  // Empty publications list awaiting Chayse's input
  publications: [] as Publication[],

  // Empty projects list awaiting Chayse's input
  projects: [] as Project[],

  skills: {
    bciAndNeuro: [
      { name: "Brain-Computer Interfaces (BCI)", level: 95 },
      { name: "EEG / EMG Signal Processing", level: 92 },
      { name: "Biomechanical Modeling (OpenSim)", level: 90 },
      { name: "Motion Capture & Kinematic Analysis", level: 88 },
      { name: "Bio-potential Instrumentation", level: 90 }
    ],
    mechanicalAndCAD: [
      { name: "SolidWorks & Parametric CAD", level: 95 },
      { name: "Finite Element Analysis (FEA)", level: 88 },
      { name: "Rapid Prototyping & Fabrication", level: 92 },
      { name: "Mechanism Synthesis & Linkages", level: 90 },
      { name: "Geometric Dimensioning & Tolerancing (GD&T)", level: 86 }
    ],
    mechatronicsAndControl: [
      { name: "MATLAB & Simulink", level: 95 },
      { name: "Embedded Systems (C / C++)", level: 88 },
      { name: "Dynamic Systems & Control", level: 90 },
      { name: "Data Acquisition (DAQ Instrumentation)", level: 92 },
      { name: "Actuator Selection & Sizing", level: 88 }
    ],
    computationAndCoding: [
      { name: "Python (NumPy, SciPy, PyTorch)", level: 94 },
      { name: "C / C++", level: 88 },
      { name: "Git Version Control", level: 92 },
      { name: "LaTeX Scientific Typesetting", level: 95 },
      { name: "Linux Environments", level: 86 }
    ]
  },

  timeline: [
    {
      id: "time-1",
      type: "education",
      role: "Ph.D. Candidate in Mechanical Engineering",
      organization: "Brigham Young University (BYU)",
      location: "Provo, UT",
      period: "2023 - Present",
      description: [
        "Department of Mechanical Engineering.",
        "Member of the BYU Neuromechanics Research Group.",
        "Primary Research: Brain-Computer Interfaces (BCI), Neuromechanics, Biomechanical Modeling."
      ],
      skills: ["BCI", "Neuromechanics", "Biomechanical Modeling", "Mechanical Engineering"]
    },
    {
      id: "time-2",
      type: "research",
      role: "Graduate Research Assistant",
      organization: "BYU Neuromechanics Research Group",
      location: "Provo, UT",
      period: "2023 - Present",
      description: [
        "Conducting doctoral research in neural interfaces, neuromotor biomechanics, and robotic instrumentation.",
        "Developing computational algorithms for neural decoding and dynamic musculoskeletal analysis."
      ],
      skills: ["BCI", "Neural Decoding", "CAD", "Biomechanics"]
    },
    {
      id: "time-3",
      type: "education",
      role: "B.S. in Mechanical Engineering",
      organization: "Brigham Young University (BYU)",
      location: "Provo, UT",
      period: "2019 - 2023",
      description: [
        "Department of Mechanical Engineering, Brigham Young University.",
        "Rigorous foundation in mechanical design, dynamics, thermodynamics, fluid mechanics, and materials science."
      ],
      skills: ["Mechanical Design", "SolidWorks", "Dynamics", "Mechatronics"]
    }
  ] as TimelineItem[],

  news: [] as NewsItem[],

  contact: {
    labName: "Neuromechanics Research Group",
    institution: "Brigham Young University",
    department: "Department of Mechanical Engineering",
    building: "Engineering Building (EB)",
    office: "EB 350 / Lab 120",
    address: "Provo, UT 84602, USA",
    email: "chaysew@gmail.com",
    labSite: "https://neuromechanics.byu.edu",
    availability: "Open to research collaborations, academic postdoctoral inquiries, and industrial R&D dialogues."
  }
};
