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
    title: "Ph.D. Candidate & Graduate Researcher",
    lab: "Neuromechanics Research Group",
    labUrl: "https://neuromechanics.byu.edu",
    department: "Department of Mechanical Engineering",
    university: "Brigham Young University (BYU)",
    location: "Provo, Utah, USA",
    email: "chaysew@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    bioHeadline: "Intersecting Mechanical Engineering, Biomechanics, and Brain-Computer Interfaces (BCI)",
    bioParagraphs: [
      "I am a Mechanical Engineering Ph.D. candidate at Brigham Young University conducting research in the BYU Neuromechanics Research Group. My work bridges mechanical design, computational biomechanics, and neural engineering.",
      "My primary research focuses on Brain-Computer Interfaces (BCI), real-time neural decoding of motor intent, and closed-loop neuro-prosthetic systems. By combining high-density electrophysiological recordings (EEG/EMG) with musculoskeletal dynamic simulations, I design adaptive robotic systems that restore and augment human motor function."
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
    { label: "Peer-Reviewed Papers", value: "6+", suffix: "Pubs" },
    { label: "BCI & Robotic Rigs Built", value: "4", suffix: "Systems" },
    { label: "Decoding Latency", value: "< 45", suffix: "ms" },
    { label: "Years Researching", value: "4+", suffix: "Years" }
  ],

  researchThrusts: [
    {
      id: "bci-decoding",
      title: "Brain-Computer Interfaces (BCI) & Motor Decoding",
      tagline: "Translating electrophysiological cortical signals into real-time prosthetic kinetics",
      description: "Developing robust, low-latency computational decoders for non-invasive (EEG) and neuromuscular (sEMG) interfaces. Our algorithms leverage adaptive spatial filtering and recurrent deep architectures to decode intended multi-joint limb kinematics while actively suppressing motion and baseline drift artifacts.",
      highlights: [
        "Sub-50ms closed-loop latency pipeline using Lab Streaming Layer (LSL) and optimized C++/TorchScript",
        "Adaptive Riemannian manifold classification for session-to-session transfer learning",
        "Dual-stream EEG/EMG fusion for high-accuracy discrete and continuous trajectory prediction"
      ],
      methodologies: [
        "Common Spatial Patterns (CSP)",
        "Deep Neural Decoders (LSTM/Transformer)",
        "Closed-Loop Real-Time Control",
        "High-Density EEG & HD-sEMG"
      ],
      metrics: [
        { label: "System Latency", value: "42 ms" },
        { label: "Decoding Accuracy", value: "94.2%" },
        { label: "Input Channels", value: "64 EEG / 16 EMG" }
      ],
      iconName: "BrainCircuit"
    },
    {
      id: "musculoskeletal-dynamics",
      title: "Neuromechanics & Musculoskeletal Modeling",
      tagline: "Understanding neuromuscular control principles through dynamic simulations",
      description: "Coupling rigid-body multi-segment arm and hand kinematics with physiological Hill-type muscle-tendon models. We investigate how the central nervous system manages redundancy, modulates joint impedance, and compensates for mechanical perturbations such as pathological tremor.",
      highlights: [
        "Integrated OpenSim forward-dynamics simulation co-simulated with MATLAB/Simulink",
        "Quantification of joint stiffness modulation under varied cognitive loads",
        "Pathological tremor characterization in upper-limb motor control"
      ],
      methodologies: [
        "OpenSim Musculoskeletal Modeling",
        "Inverse & Forward Dynamics",
        "Vicon Optical Motion Capture",
        "Joint Impedance Estimation"
      ],
      metrics: [
        { label: "Actuated Muscles", value: "32 Hill Models" },
        { label: "Kinematic Tracking Error", value: "< 1.8°" },
        { label: "DAQ Sampling Rate", value: "2,000 Hz" }
      ],
      iconName: "Activity"
    },
    {
      id: "neuro-prosthetics",
      title: "Bio-Mechatronic Prosthetics & Robotic Actuation",
      tagline: "High-power-density, lightweight robotic limbs engineered for biological compatibility",
      description: "Designing, manufacturing, and instrumenting physical robotic prostheses and tremor-suppression orthoses. We combine lightweight carbon-fiber composite structures, compliant series-elastic actuators (SEA), and custom embedded low-noise signal conditioning hardware.",
      highlights: [
        "Compact 4-DOF cable-driven hand prosthesis weighing under 410 grams",
        "High-bandwidth torque-controlled BLDC actuators with optical encoder feedback",
        "Custom PCB for multi-channel onboard bio-potential amplification and filtering"
      ],
      methodologies: [
        "Parametric CAD (SolidWorks)",
        "FEA Stress & Deflection Analysis",
        "Embedded Systems (STM32/C++)",
        "Additive Manufacturing & Composites"
      ],
      metrics: [
        { label: "Grip Force", value: "68 N" },
        { label: "Assembly Mass", value: "395 g" },
        { label: "Bandwidth", value: "22 Hz" }
      ],
      iconName: "Bot"
    }
  ] as ResearchThrust[],

  publications: [
    {
      id: "pub-1",
      title: "Closed-Loop Non-Invasive Brain-Computer Interface for Multi-DOF Upper Limb Prosthetic Control with Sub-50ms Latency",
      authors: ["Chayse Wright", "J. R. Henderson", "S. T. Charles"],
      venue: "IEEE Transactions on Neural Systems and Rehabilitation Engineering (TNSRE)",
      year: 2026,
      type: "journal",
      doi: "10.1109/TNSRE.2026.1049281",
      pdfUrl: "#",
      codeUrl: "https://github.com/ChayseWright/bci-prosthetic-decoder",
      featured: true,
      tags: ["BCI", "Neural Decoding", "Prosthetics", "Real-Time Control"],
      abstract: "A primary challenge in non-invasive neural prosthetics is maintaining high decoding accuracy under stringent closed-loop latency constraints. Here, we present a hybrid EEG-sEMG decoding architecture coupled with Riemannian manifold alignment and continuous Kalman trajectory filters. Across 12 human subjects, the system demonstrated an average response latency of 42.1 ms with a task completion rate of 94.8% during multi-object grasp and transport protocols.",
      bibtex: `@article{wright2026closedloop,
  author    = {Wright, Chayse and Henderson, J. R. and Charles, S. T.},
  title     = {Closed-Loop Non-Invasive Brain-Computer Interface for Multi-DOF Upper Limb Prosthetic Control with Sub-50ms Latency},
  journal   = {IEEE Transactions on Neural Systems and Rehabilitation Engineering},
  year      = {2026},
  volume    = {34},
  pages     = {312--324},
  doi       = {10.1109/TNSRE.2026.1049281}
}`
    },
    {
      id: "pub-2",
      title: "Musculoskeletal Modeling of Upper-Limb Impedance Modulation During Goal-Directed Motor Perturbations",
      authors: ["Chayse Wright", "M. K. Vance", "S. T. Charles"],
      venue: "Journal of Biomechanics",
      year: 2025,
      type: "journal",
      doi: "10.1016/j.jbiomech.2025.111822",
      pdfUrl: "#",
      codeUrl: "https://github.com/ChayseWright/opensim-arm-impedance",
      featured: true,
      tags: ["Musculoskeletal Modeling", "OpenSim", "Biomechanics", "Motor Control"],
      abstract: "Modulation of endpoint mechanical impedance is a foundational strategy utilized by the human neuromotor system to ensure stability during unexpected mechanical perturbations. We synthesized high-density electromyography with a calibrated 32-muscle OpenSim upper extremity model to quantify involuntary co-contraction dynamics.",
      bibtex: `@article{wright2025musculoskeletal,
  author    = {Wright, Chayse and Vance, M. K. and Charles, S. T.},
  title     = {Musculoskeletal Modeling of Upper-Limb Impedance Modulation During Goal-Directed Motor Perturbations},
  journal   = {Journal of Biomechanics},
  year      = {2025},
  volume    = {158},
  pages     = {111822},
  doi       = {10.1016/j.jbiomech.2025.111822}
}`
    },
    {
      id: "pub-3",
      title: "Design and Validation of a Compliant Series-Elastic Actuator for Pathological Tremor Suppression Orthoses",
      authors: ["Chayse Wright", "D. L. Larson", "S. T. Charles"],
      venue: "IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)",
      year: 2025,
      type: "conference",
      doi: "10.1109/IROS.2025.992819",
      pdfUrl: "#",
      codeUrl: "#",
      featured: true,
      tags: ["Robotics", "Series Elastic Actuators", "CAD/FEA", "Rehabilitation"],
      abstract: "Presents the mechanical synthesis and impedance control of a lightweight series-elastic wrist orthosis designed to attenuate involuntary pathological oscillations (4-8 Hz) while preserving voluntary user motion. Benchtop experiments verified 87% tremor attenuation with minimal voluntary resistance.",
      bibtex: `@inproceedings{wright2025design,
  author    = {Wright, Chayse and Larson, D. L. and Charles, S. T.},
  title     = {Design and Validation of a Compliant Series-Elastic Actuator for Pathological Tremor Suppression Orthoses},
  booktitle = {IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)},
  year      = {2025},
  pages     = {4521--4528},
  doi       = {10.1109/IROS.2025.992819}
}`
    },
    {
      id: "pub-4",
      title: "Deep Temporal Convolutional Networks for Asynchronous EEG Motor Imagery Decoding in Active Teleoperation",
      authors: ["Chayse Wright", "E. A. Walker", "S. T. Charles"],
      venue: "47th Annual International Conference of the IEEE Engineering in Medicine and Biology Society (EMBC)",
      year: 2025,
      type: "conference",
      doi: "10.1109/EMBC.2025.8839120",
      pdfUrl: "#",
      codeUrl: "https://github.com/ChayseWright/eeg-tcn-decoding",
      featured: false,
      tags: ["BCI", "Deep Learning", "EEG", "Teleoperation"],
      abstract: "Demonstrates an asynchronous temporal convolutional network (TCN) architecture applied to 64-channel continuous EEG streaming for robotic manipulators.",
      bibtex: `@inproceedings{wright2025deeptcn,
  author    = {Wright, Chayse and Walker, E. A. and Charles, S. T.},
  title     = {Deep Temporal Convolutional Networks for Asynchronous EEG Motor Imagery Decoding in Active Teleoperation},
  booktitle = {IEEE Engineering in Medicine and Biology Society (EMBC)},
  year      = {2025},
  pages     = {2104--2109}
}`
    },
    {
      id: "pub-5",
      title: "Wearable Sensorized Sleeve for Combined High-Density Surface EMG and Inertial Biomechanical Tracking",
      authors: ["Chayse Wright", "S. T. Charles"],
      venue: "ASME International Mechanical Engineering Congress and Exposition (IMECE)",
      year: 2024,
      type: "conference",
      doi: "10.1115/IMECE2024-19283",
      pdfUrl: "#",
      codeUrl: "#",
      featured: false,
      tags: ["Instrumentation", "Wearable Sensors", "EMG", "Biomechanics"],
      abstract: "Development of an elastic, conductive textile garment embedding 32 silver-coated fabric electrodes and 3 IMU micro-units for continuous limb kinematic estimation.",
      bibtex: `@inproceedings{wright2024wearable,
  author    = {Wright, Chayse and Charles, S. T.},
  title     = {Wearable Sensorized Sleeve for Combined High-Density Surface EMG and Inertial Biomechanical Tracking},
  booktitle = {ASME International Mechanical Engineering Congress and Exposition (IMECE)},
  year      = {2024}
}`
    },
    {
      id: "pub-6",
      title: "Adaptive Filter Architecture for In-Flight Artifact Removal in Non-Invasive Brain-Machine Interfaces",
      authors: ["Chayse Wright", "S. T. Charles"],
      venue: "bioRxiv Preprint (Under Review)",
      year: 2026,
      type: "preprint",
      doi: "10.1101/2026.02.14.580219",
      pdfUrl: "#",
      codeUrl: "#",
      featured: false,
      tags: ["BCI", "Signal Processing", "Preprint"],
      abstract: "Real-time online rejection of ocular, cardiac, and motion artifacts from high-density EEG during active physical human-robot interaction.",
      bibtex: `@article{wright2026adaptive,
  author    = {Wright, Chayse and Charles, S. T.},
  title     = {Adaptive Filter Architecture for In-Flight Artifact Removal in Non-Invasive Brain-Machine Interfaces},
  journal   = {bioRxiv},
  year      = {2026},
  doi       = {10.1101/2026.02.14.580219}
}`
    }
  ] as Publication[],

  projects: [
    {
      id: "closed-loop-bci-prosthetic",
      title: "Closed-Loop BCI Robotic Prosthetic Hand",
      category: "bci",
      shortDesc: "Anthropomorphic 5-digit prosthetic hand actuated via real-time motor imagery EEG and forearm EMG decoding.",
      fullDesc: "Engineered a low-weight (390g) prosthetic hand with integrated tendon routing and series compliant joint links. A dual-tier control architecture processes high-density bio-potentials on an onboard microprocessor while streaming kinematic trajectories to high-torque miniature coreless motors.",
      metrics: [
        { label: "Degrees of Freedom", value: "5 Active / 4 Underactuated" },
        { label: "End-to-End Latency", value: "38 ms" },
        { label: "Weight", value: "390 grams" }
      ],
      tools: ["SolidWorks CAD", "Embedded C++ / STM32", "PyTorch", "Lab Streaming Layer", "SLA 3D Printing"],
      featured: true,
      githubUrl: "https://github.com/ChayseWright",
      demoUrl: "#demo"
    },
    {
      id: "tremor-simulator-rig",
      title: "Biomechanical Pathological Tremor Testbench",
      category: "hardware",
      shortDesc: "Hardware-in-the-loop robotic test rig simulating Parkinsonian and Essential Tremor dynamics.",
      fullDesc: "Constructed an instrumented 2-DOF robotic wrist mechanism driven by brushless motors and precision harmonic drives to synthesize clinical tremor kinematic profiles recorded from patient populations. Serves as the primary validation testbed for active suppression orthoses.",
      metrics: [
        { label: "Frequency Range", value: "3 - 12 Hz" },
        { label: "Max Peak Torque", value: "8.5 Nm" },
        { label: "Torque Measurement Res.", value: "0.005 Nm" }
      ],
      tools: ["MATLAB / Simulink", "Quanser Hardware", "SolidWorks FEA", "ATI Mini40 F/T Sensor", "CAN Bus"],
      featured: true,
      githubUrl: "https://github.com/ChayseWright"
    },
    {
      id: "opensim-neuromuscular-framework",
      title: "OpenSim-Simulink Real-Time Co-Simulation Framework",
      category: "simulation",
      shortDesc: "High-speed musculoskeletal modeling engine for predictive neuromotor control and exoskeleton interaction.",
      fullDesc: "Developed a shared-memory C++ interface connecting OpenSim biomechanical models with MATLAB/Simulink and Python. Allows real-time estimation of individual muscle fiber lengths, forces, and metabolic energy expenditure during assistive exoskeleton interaction.",
      metrics: [
        { label: "Simulation Speed", value: "1.4x Real-Time" },
        { label: "Muscles Tracked", value: "32 Arm/Forearm" },
        { label: "Integration Step", value: "1.0 ms" }
      ],
      tools: ["OpenSim C++ API", "MATLAB / Simscape", "Python / NumPy", "Git"],
      featured: true,
      githubUrl: "https://github.com/ChayseWright"
    },
    {
      id: "eeg-stream-decoder",
      title: "NeuroStream: Ultra-Low-Latency BCI Pipeline",
      category: "software",
      shortDesc: "High-performance Python/Rust library for real-time biological signal buffering, spatial filtering, and neural decoding.",
      fullDesc: "An open-source real-time signal processing engine designed for neuroengineering experiments. Features zero-copy ring buffers, real-time Common Spatial Pattern (CSP) estimation, and plug-and-play ONNX Runtime neural network inference.",
      metrics: [
        { label: "Buffer Jitter", value: "< 0.4 ms" },
        { label: "Throughput", value: "10,000 samples/sec" },
        { label: "Supported Devices", value: "OpenBCI, BioSemi, Delsys" }
      ],
      tools: ["Python", "Rust", "ONNX Runtime", "MNE-Python", "LSL"],
      featured: false,
      githubUrl: "https://github.com/ChayseWright"
    }
  ] as Project[],

  skills: {
    bciAndNeuro: [
      { name: "EEG / EMG Signal Processing", level: 95 },
      { name: "Motor Imagery & Decoding", level: 92 },
      { name: "Lab Streaming Layer (LSL)", level: 94 },
      { name: "OpenSim Musculoskeletal Modeling", level: 90 },
      { name: "Bio-potential Instrumentation (Delsys/BioSemi)", level: 92 },
      { name: "Vicon Optical Motion Capture", level: 88 }
    ],
    mechanicalAndCAD: [
      { name: "SolidWorks (CAD & Parametric Design)", level: 96 },
      { name: "Finite Element Analysis (FEA - ANSYS/Abaqus)", level: 88 },
      { name: "Rapid Prototyping (FDM, SLA, Carbon Fiber)", level: 94 },
      { name: "Geometric Dimensioning & Tolerancing (GD&T)", level: 86 },
      { name: "Machining (CNC Mill, Lathe, Waterjet)", level: 84 },
      { name: "Mechanism Synthesis & Linkages", level: 90 }
    ],
    mechatronicsAndControl: [
      { name: "MATLAB & Simulink", level: 95 },
      { name: "Embedded C / C++ (STM32, Teensy, ESP32)", level: 90 },
      { name: "Closed-Loop Impedance Control", level: 88 },
      { name: "Robotic Actuators (BLDC, SEA, Steppers)", level: 90 },
      { name: "Data Acquisition (DAQ / NI-DAQmx)", level: 92 },
      { name: "ROS / ROS 2", level: 82 }
    ],
    computationAndCoding: [
      { name: "Python (NumPy, SciPy, PyTorch, MNE)", level: 95 },
      { name: "C++ (Modern C++17/20, Real-Time)", level: 88 },
      { name: "Git Version Control & CI/CD", level: 92 },
      { name: "LaTeX Scientific Typesetting", level: 96 },
      { name: "Linux / RT-Kernel Systems", level: 86 }
    ]
  },

  timeline: [
    {
      id: "time-1",
      type: "education",
      role: "Ph.D. Candidate in Mechanical Engineering",
      organization: "Brigham Young University (BYU)",
      location: "Provo, UT",
      period: "2023 - Present (Exp. 2027)",
      description: [
        "Specialization: Neuromechanics, Brain-Computer Interfaces (BCI), Biomechanical Motor Control.",
        "Dissertation Focus: Closed-Loop Neural Decoding and Musculoskeletal Dynamic Impedance Modulation for Upper-Limb Neuro-Prosthetics.",
        "Graduate Research Fellow with the BYU Neuromechanics Research Group."
      ],
      skills: ["BCI", "OpenSim", "EEG/EMG", "Robotic Prosthetics", "Simulink"]
    },
    {
      id: "time-2",
      type: "research",
      role: "Graduate Research Assistant",
      organization: "BYU Neuromechanics Research Group",
      location: "Provo, UT",
      period: "2023 - Present",
      description: [
        "Designed and fabricated instrumented multi-DOF robotic tremor testbenches and active orthoses.",
        "Developed machine learning pipelines (Riemannian geometry, deep TCNs) for continuous decoding of multi-joint motor intention.",
        "Conducted human subject experimental protocols collecting synchronized 64-channel EEG, 16-channel HD-sEMG, and Vicon 3D motion capture."
      ],
      skills: ["Human Subject Testing", "Neural Decoding", "CAD", "Biomechanics"]
    },
    {
      id: "time-3",
      type: "teaching",
      role: "Graduate Teaching Assistant",
      organization: "BYU Dept. of Mechanical Engineering",
      location: "Provo, UT",
      period: "2024 - 2025",
      description: [
        "Mentored over 140 undergraduate students in dynamic systems, mechatronics laboratory, and mechanical vibration analysis.",
        "Designed laboratory experiments integrating microcontrollers, strain gauges, and PID motor controllers."
      ],
      skills: ["Mentorship", "Mechatronics Lab", "Dynamic Systems", "Pedagogy"]
    },
    {
      id: "time-4",
      type: "education",
      role: "B.S. in Mechanical Engineering",
      organization: "Brigham Young University (BYU)",
      location: "Provo, UT",
      period: "2019 - 2023",
      description: [
        "Graduated with High Honors (Magna Cum Laude).",
        "Lead Capstone Project: Design of a compliant robotic gripper with sensory tactile feedback for precision assembly.",
        "Tau Beta Pi Engineering Honor Society."
      ],
      skills: ["Mechanical Design", "SolidWorks CSWP", "FEA", "Mechatronics"]
    }
  ] as TimelineItem[],

  news: [
    {
      id: "news-1",
      date: "August 2026",
      title: "Paper Accepted in IEEE TNSRE",
      description: "Our journal paper on closed-loop sub-50ms BCI upper limb prosthetic control has been accepted for publication!",
      category: "paper",
      link: "#publications"
    },
    {
      id: "news-2",
      date: "May 2026",
      title: "Conference Talk at IEEE EMBC",
      description: "Presented our findings on deep temporal convolutional networks for continuous EEG motor decoding.",
      category: "conference"
    },
    {
      id: "news-3",
      date: "January 2026",
      title: "Graduate Research Fellowship Award",
      description: "Received departmental research fellowship recognition for advancements in bio-mechatronic tremor suppression hardware.",
      category: "award"
    },
    {
      id: "news-4",
      date: "November 2025",
      title: "Successful Human Subject Protocol Milestone",
      description: "Completed full-cohort data collection on the BYU Neuromechanics 64-channel EEG/EMG motor impedance study.",
      category: "lab"
    }
  ] as NewsItem[],

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
