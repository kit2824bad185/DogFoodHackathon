export interface Criterion {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  maxScore: number;
  sortOrder: number;
}

export interface Rubric {
  id: string;
  name: string;
  description?: string | null;
  criteria: Criterion[];
}

export interface ScoreItem {
  id?: string;
  criterionId: string;
  value: number;
  feedback?: string | null;
}

export interface ScoreDetails {
  id: string;
  assignmentId: string;
  totalRawScore: number;
  totalNormalizedScore?: number | null;
  isFinal: boolean;
  submittedAt: string;
  items?: ScoreItem[];
}

export interface Assignment {
  id: string;
  judgeId: string;
  submissionId: string;
  status: 'pending' | 'scored' | 'conflict';
  assignedAt: string;
  isScored?: boolean;
  score?: {
    id: string;
    totalRawScore: number;
    isFinal: boolean;
    submittedAt: string;
  } | null;
}

export interface AssignmentDetailsResponse {
  assignment: {
    id: string;
    judgeId: string;
    submissionId: string;
    status: 'pending' | 'scored' | 'conflict';
    assignedAt: string;
  };
  rubric: Rubric;
  score: ScoreDetails | null;
}

export interface NormalizationResultItem {
  submissionId: string;
  trackId?: string | null;
  aggregateZScore: number;
  finalNormalizedScore: number;
  rawScoreAverage: number;
  rank: number;
  calculatedAt?: string;
}

export interface JudgeStatItem {
  judgeId: string;
  meanScore: number;
  stdDev: number;
  sampleCount: number;
}

export interface NormalizationRunResponse {
  runId: string;
  judgeStats: JudgeStatItem[];
  results: NormalizationResultItem[];
  calculatedAt?: string;
}

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: 'judge' | 'organizer' | 'participant' | 'admin';
  title: string;
  avatar: string;
}
