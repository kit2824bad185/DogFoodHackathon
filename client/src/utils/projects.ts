export interface ProjectMetadata {
  title: string;
  tagline: string;
  category: string;
  team: string;
  avatar: string;
}

export const PROJECT_DIRECTORY: Record<string, ProjectMetadata> = {
  'sub-001': {
    title: 'EcoTrack',
    tagline: 'IoT Sensor Network for Offline Carbon Tracking & Reporting',
    category: 'Hardware & Edge',
    team: 'Team GreenLeaf',
    avatar: '🌱',
  },
  'sub-002': {
    title: 'AetherOS',
    tagline: 'P2P Mesh Collaboration & Offline Virtual Canvas',
    category: 'P2P & Distributed',
    team: 'Team MeshCraft',
    avatar: '🌐',
  },
  'sub-003': {
    title: 'BioPulse',
    tagline: 'Embedded Edge Diagnostic Device for Real-Time Cardiac Arrhythmias',
    category: 'HealthTech & AI',
    team: 'Team NeuralPulse',
    avatar: '💓',
  },
  'sub-004': {
    title: 'SoundWave',
    tagline: 'Offline Neural Speech De-noising & Audio Restoration Engine',
    category: 'Audio & ML',
    team: 'Team WaveForm',
    avatar: '🎧',
  },
  'sub-005': {
    title: 'AgriSense',
    tagline: 'Smart IoT Micro-Climate & Predictive Soil Irrigation System',
    category: 'Sustainability',
    team: 'Team AgriTech',
    avatar: '🌾',
  },
  'sub-006': {
    title: 'OmniDoc',
    tagline: 'Zero-Knowledge Cryptographic Local Medical Record Vault',
    category: 'Security & Privacy',
    team: 'Team CipherHealth',
    avatar: '🔐',
  },
};

export function getProjectInfo(submissionId: string): ProjectMetadata {
  return (
    PROJECT_DIRECTORY[submissionId] || {
      title: submissionId,
      tagline: 'Hackathon Submission Project',
      category: 'General Track',
      team: 'Team Innovators',
      avatar: '📦',
    }
  );
}
