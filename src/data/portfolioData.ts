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
  subtitle?: string;
  category: 'bci' | 'simulation' | 'software';
  shortDesc: string;
  fullDesc: string;
  metrics: { label: string; value: string }[];
  tools: string[];
  imageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  colabUrl?: string;
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
    bioHeadline: "Mechanical Engineering · Tremor Characterisation & Decomposition · Neuromechanics · BCI",
    bioParagraphs: [
      "I am a Mechanical Engineering Ph.D. student (2025–present) at Brigham Young University conducting research within the BYU Neuromechanics Research Group. Prior to BYU, I completed my Bachelor's degree in Mechanical Engineering at Queen's University (2018–2023).",
      "My primary research focus centers on tremor characterisation and decomposition for Essential Tremor and Parkinson's Disease, investigating neuromuscular oscillations and dynamic motor unit behavior. Additionally, my research interests include Brain-Computer Interfaces (BCI), neural decoding, and dynamic systems control."
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
    { label: "Primary Focus", value: "Tremor Decomposition" },
    { label: "Pathologies", value: "ET & Parkinson's" },
    { label: "Research Interest", value: "BCI Systems" }
  ],

  researchThrusts: [
    {
      id: "tremor-decomposition",
      title: "Tremor Characterisation & Decomposition",
      tagline: "Primary Doctoral Focus · Essential Tremor & Parkinson's Disease",
      description: "Investigating quantitative electrophysiological decomposition and characterisation of pathological involuntary tremors in Essential Tremor (ET) and Parkinson's Disease (PD). Combining surface electromyography (sEMG), kinematic tracking, and signal decomposition to isolate underlying central oscillator dynamics from peripheral mechanical resonances.",
      highlights: [
        "Electrophysiological motor unit decomposition in pathological tremors",
        "Frequency-domain differentiation between Essential Tremor and Parkinsonian tremor",
        "Coupling between central neural drives and mechanical limb kinematics",
        "Biomechanical tremor filtering and adaptive suppression dynamics"
      ],
      methodologies: [
        "sEMG Decomposition",
        "Kinematic Spectral Analysis",
        "Neuromuscular Modeling",
        "Movement Disorder Biomechanics"
      ],
      metrics: [
        { label: "Primary Focus", value: "Essential Tremor" },
        { label: "Pathology", value: "Parkinson's" },
        { label: "Methodology", value: "Decomposition" }
      ],
      iconName: "Activity"
    },
    {
      id: "bci-interfaces",
      title: "Brain-Computer Interfaces (BCI)",
      tagline: "Research Interest · Neural decoding and closed-loop motor interfaces",
      description: "Exploring neural decoding architectures and electrophysiological signal processing (EEG/EMG) to interface biological motor command with computational and assistive dynamic systems as an active research interest.",
      highlights: [
        "Parametric and deep neural decoding from multi-channel EEG",
        "Neuromotor intent classification and continuous kinematics",
        "Investigation of cognitive state (drowsiness/attention) on interface robustness",
        "Closed-loop bio-potential communication frameworks"
      ],
      methodologies: [
        "EEG Signal Processing",
        "Machine Learning",
        "Neural Feature Extraction",
        "Closed-Loop Control"
      ],
      metrics: [
        { label: "Research Area", value: "Neural BCI" },
        { label: "Investigation", value: "Motor Decoding" },
        { label: "Signals", value: "EEG / EMG" }
      ],
      iconName: "BrainCircuit"
    }
  ] as ResearchThrust[],

  publications: [] as Publication[],

  projects: [
    {
      id: "bci-drowsiness-decoding",
      title: "Drowsiness as a Control Parameter for Motor Imagery and Movement Tasks",
      subtitle: "Neural Signal Classification & Control Theory Analysis",
      category: "bci",
      shortDesc: "Quantitative evaluation of parametric neural decoding (LDA, Wavelet Scattering, and CNNs) on a 52-subject 64-channel EEG dataset under varying physiological states.",
      fullDesc: "Framed the human brain's superstructures (cerebral cortex, basal ganglia, cerebellum, thalamus) as traditional control system blocks and investigated the event-related desynchronization/synchronization (ERD/ERS) ratio in the mu (8–12 Hz) and beta (13–30 Hz) bands during motor imagery (MI) and physical movement. Preprocessed 64-channel 512 Hz Biosemi ActiveTwo EEG recordings with 4th-order Butterworth bandpass filtering and Welch's Power Spectral Density (PSD). Implemented and compared Linear Discriminant Analysis (83.5% ± 2.5% accuracy across 50 subjects), a multi-scale Wavelet Scattering Transform with Random Forest (95% preliminary single-subject accuracy), and Convolutional Neural Networks (89.09% accuracy). Linear regression revealed decoding robustness against drowsiness and sleep duration, underscoring resilient hierarchical feature extraction.",
      metrics: [
        { label: "Dataset", value: "52 Subjects (64-ch EEG)" },
        { label: "CNN Accuracy", value: "89.09%" },
        { label: "LDA Accuracy", value: "83.50% (±2.5%)" }
      ],
      tools: [
        "Python",
        "Convolutional Neural Networks (CNN)",
        "Linear Discriminant Analysis (LDA)",
        "Wavelet Scattering Transform (WST)",
        "Welch Power Spectral Density (PSD)",
        "Biosemi ActiveTwo 64-ch EEG"
      ],
      featured: true
    },
    {
      id: "thermodynamic-social-network-heat-eq",
      title: "Modelling Censorship in Complete Graph Social Networks via the Heat Equation",
      subtitle: "Applied Engineering Mathematics & Probabilistic Boundary Conditions",
      category: "simulation",
      shortDesc: "Mathematical discretization of the heat equation and Robin boundary conditions across complete graphs (K₅₀) to model digital social contagion without absolute censorship.",
      fullDesc: "Formulated a thermodynamic analogy for online social networks by modeling digital interactions as heat generation and flux across complete graphs (K₅₀). Adapted the classical Robin boundary condition into a probabilistic, logarithmic digital boundary condition to dissipate opinion 'heat' while discouraging echo chamber formation and avoiding total siloing of users. Simulated discrete, stochastic post generation using dynamic Beta distributions coupled to user temperature and a non-linear 'overloaded heat sink' dissipation function (D ∝ T / [1 + (T/K_bend)³]). Evaluated network stability against severe synchronized shock events (80% node excitation at t=150) to demonstrate shock containment without permanent polarization.",
      metrics: [
        { label: "Graph Topology", value: "Complete Graph K₅₀" },
        { label: "Governing Model", value: "Discrete Heat Eq." },
        { label: "Boundary Type", value: "Probabilistic Robin BC" }
      ],
      tools: [
        "Python",
        "Google Colab",
        "NetworkX Graph Theory",
        "Stochastic Simulation",
        "NumPy & SciPy",
        "Matplotlib Animation"
      ],
      demoUrl: "https://youtu.be/7Pxxj5InVQM",
      colabUrl: "https://colab.research.google.com/drive/1wEq1qe_x5FCmO1mrwU2KQSeMc0eagkqN?usp=sharing",
      featured: true
    },
    {
      id: "nlp-transformers-knowledge-mapping",
      title: "NLP Network Visualization with Transformers for Scientific Literature",
      subtitle: "Undergraduate Thesis · Queen's University (Supervisor: Dr. A. Ableson)",
      category: "software",
      shortDesc: "Automated knowledge graph extraction and interactive network mapping from scientific literature using pre-trained BERT Transformers, SciSpacy, and RESTful APIs.",
      fullDesc: "Developed an automated, generalized natural language processing pipeline for extracting and visualizing knowledge graphs from scientific corpora. Built RESTful API connectors for the Elsevier Developer API to pull full-text articles and metadata. Designed text formatting, tokenization, and part-of-speech (POS) tagging pipelines with spaCy, evaluating domain-specific Transformer architectures (SciSpacy, BioBERT) for Named Entity Recognition (NER), achieving an F1-score of 0.766. Extracted compound, subject, and directional syntactic dependencies as edges into multi-edge directional graphs using NetworkX, rendered into interactive, filterable visual graphs with Bokeh.",
      metrics: [
        { label: "Institution", value: "Queen's University" },
        { label: "NER Model", value: "SciSpacy / BioBERT" },
        { label: "Graph Engine", value: "NetworkX & Bokeh" }
      ],
      tools: [
        "Python",
        "spaCy & SciSpacy",
        "BERT Transformers",
        "NetworkX",
        "Bokeh Interactive Visualization",
        "Elsevier RESTful API"
      ],
      githubUrl: "https://github.com/conchay3",
      featured: false
    }
  ] as Project[],

  skills: {
    bciAndNeuro: [
      "Tremor Characterisation & Decomposition",
      "sEMG / EEG Signal Processing",
      "Motor Unit Decomposition",
      "Biomechanical Modeling (OpenSim)",
      "Motion Capture & Kinematics",
      "Brain-Computer Interfaces (BCI)"
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
        "Primary Focus: Tremor Characterisation & Decomposition for Essential Tremor and Parkinson's Disease.",
        "Research Interests: Brain-Computer Interfaces (BCI), neural decoding, and neuromuscular motor control."
      ],
      skills: ["Tremor Decomposition", "Essential Tremor", "Parkinson's Disease", "BCI", "Neuromechanics"]
    },
    {
      id: "time-2",
      type: "research",
      role: "Graduate Research Assistant",
      organization: "BYU Neuromechanics Research Group",
      location: "Provo, UT",
      period: "2025 – Present",
      description: [
        "Investigating pathological tremor dynamics and decomposition in Essential Tremor and Parkinson's Disease.",
        "Developing analytical frameworks for motor unit decomposition and neural interface decoding."
      ],
      skills: ["Tremor Characterisation", "sEMG Decomposition", "Neural Interfaces"]
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
        "Undergraduate Thesis: NLP Network Visualization with Transformers for Generalizable Knowledge Mapping in Scientific Literature (Supervisor: Dr. A. Ableson).",
        "Comprehensive training in mechanical engineering, dynamic systems, numerical analysis, and materials."
      ],
      skills: ["Mechanical Engineering", "Dynamics", "Numerical Methods", "Undergraduate Thesis"]
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
