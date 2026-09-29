export interface LearningTrack {
  id: string;
  title: string;
  instructor: string;
  institution: string;
  badgeLogo: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  studentsCount: string;
  skills: string[];
  bannerUrl: string;
  syllabusHighlights: string[];
}

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    id: 'track-agentic-ai',
    title: 'Autonomous AI Agents & Tool Calling Mastery',
    instructor: 'Dr. Andrew Wu & DeepMind Research Fellows',
    institution: 'DeepMind Academy',
    badgeLogo: '🧠',
    category: 'AI & Machine Learning',
    level: 'Intermediate',
    duration: '4 Weeks • 6 Hours/Week',
    rating: 4.96,
    studentsCount: '48,200',
    skills: ['Function Calling', 'Agent Memory Chains', 'Deterministic Evaluators', 'Safety Sandboxing'],
    bannerUrl: 'linear-gradient(135deg, #1e3a8a, #4f46e5)',
    syllabusHighlights: [
      'Deconstructing Agentic Reasoning & ReAct Loops',
      'Deterministic Structured Outputs via JSON Schema',
      'Vector Memory & Retrieval-Augmented Generation (RAG)',
      'Submitting to Hackathons with Live Sandboxed APIs',
    ],
  },
  {
    id: 'track-sqlite-architecture',
    title: 'High-Performance Local-First Systems & SQLite WAL',
    instructor: 'Dr. Martin Kleppmann & Core SRE Team',
    institution: 'MIT Distributed Systems Group',
    badgeLogo: '⚡',
    category: 'Cloud & Systems',
    level: 'Advanced',
    duration: '3 Weeks • 8 Hours/Week',
    rating: 4.98,
    studentsCount: '29,400',
    skills: ['Write-Ahead Logging (WAL)', 'ACID Transactions', 'Concurrency Limits', 'Drizzle ORM'],
    bannerUrl: 'linear-gradient(135deg, #0f172a, #2563eb)',
    syllabusHighlights: [
      'SQLite Internal Architecture: B-Trees & Pagers',
      'WAL Concurrency, Checkpointing, and Single-Writer Paradigms',
      'Zero-Latency Embedded Edge Deployments',
      'Preventing Concurrency Locks in Node.js Microservices',
    ],
  },
  {
    id: 'track-hackathon-pitch',
    title: 'Winning Hackathon Prototyping & Pitch Engineering',
    instructor: 'Garry Tan & YC Hackathon Champions',
    institution: 'Y Combinator Builders',
    badgeLogo: '🚀',
    category: 'Startup & Strategy',
    level: 'All Levels',
    duration: '2 Weeks • 4 Hours/Week',
    rating: 4.94,
    studentsCount: '62,800',
    skills: ['3-Minute Demo Pitch', 'Rapid UI/UX Polish', 'Technical Architecture Slides', 'Judge Engagement'],
    bannerUrl: 'linear-gradient(135deg, #c2410c, #ea580c)',
    syllabusHighlights: [
      'The Anatomy of a 1st Place Hackathon Project',
      'Architecting for Live Demos Without Failure Points',
      'Communicating Complex Math & AI to Non-Technical Judges',
      'From 48-Hour Prototype to Angel Round Funding',
    ],
  },
  {
    id: 'track-quant-finance',
    title: 'Algorithmic Market Making & High-Frequency Trading',
    instructor: 'Citadel Quant Mentors & Prof. Michael Kearns',
    institution: 'Wharton Quantitative Lab',
    badgeLogo: '📊',
    category: 'FinTech & Trading',
    level: 'Advanced',
    duration: '5 Weeks • 10 Hours/Week',
    rating: 4.91,
    studentsCount: '19,100',
    skills: ['Order Book Mechanics', 'Limit Order Queues', 'Market Microstructure', 'C++ Low Latency'],
    bannerUrl: 'linear-gradient(135deg, #1e1b4b, #3b82f6)',
    syllabusHighlights: [
      'Order Book Reconstruction & Level 2 / Level 3 Feeds',
      'Inventory Risk & Avellaneda-Stoikov Market Making',
      'Backtesting with Tick-Level Slippage Models',
      'Live Execution in Simulated Financial Sandboxes',
    ],
  },
];
