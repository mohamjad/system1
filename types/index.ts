export type MeasurementType = 'rate' | 'latency' | 'ratio' | 'count' | 'distribution_shift';

export type SignalCategory = 
  | 'data_quality'
  | 'pipeline_reliability'
  | 'business_impact'
  | 'user_sentiment'
  | 'behavior_drift';

export type SignalStatus = 'normal' | 'watch' | 'triggered';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Signal {
  id: string;
  name: string;
  category: SignalCategory;
  measurementType: MeasurementType;
  currentValue: number;
  baselineValue: number;
  thresholdRule: string;
  confidence: number; // 0.5-1.0
  whyThisMatters: string;
  failureModeTags: string[];
  severityWeight: number; // 1.0-2.0
  lastUpdated: string; // ISO timestamp
}

export interface FailureMode {
  id: string;
  name: string;
  severity: number; // 1-5
  detectability: number; // 1-5
  leadTime: string; // e.g., "2 hours", "1 day"
  primarySignalIds: string[];
  mitigationPlaybook: string[];
}

export interface Incident {
  id: string;
  date: string; // ISO timestamp
  symptom: string;
  rootCauseCategory: string;
  impact: string;
  failureModeId?: string;
  whatWouldHaveCaughtThis: string;
  signalsWereMissing: string[];
  signalsWereTooWeak: string[];
}

export interface StressTest {
  id: string;
  name: string;
  description: string;
  expectedSignalsToFire: string[];
  passed: boolean;
  notes: string;
  lastRun?: string; // ISO timestamp
}

export interface System {
  id: string;
  name: string;
  description: string;
  signals: Signal[];
  failureModes: FailureMode[];
  incidents: Incident[];
  stressTests: StressTest[];
  lastEvaluation: string; // ISO timestamp
  healthScore: number; // 0-100
  riskScore: number; // 0-100
  confidenceScore: number; // 0-100
  riskLevel: RiskLevel;
  topRisks: string[];
}

export interface LearningSuggestion {
  id: string;
  type: 'new_signal' | 'threshold_update' | 'new_stress_test';
  description: string;
  signalId?: string;
  newThreshold?: string;
  newSignal?: Partial<Signal>;
  newStressTest?: Partial<StressTest>;
  reason: string;
}

export interface EvaluationResult {
  healthScore: number;
  riskScore: number;
  confidenceScore: number;
  explanation: string;
  topContributingSignals: Array<{
    signalId: string;
    contribution: number;
  }>;
  activeFailureModes: Array<{
    failureModeId: string;
    riskScore: number;
  }>;
}

export interface HistoricalSignalValue {
  signalId: string;
  timestamp: string; // ISO timestamp
  value: number;
  status: SignalStatus;
}

export interface TimelinePoint {
  timeLabel: string; // e.g., "T-7 days", "T-3 days", "Failure"
  timestamp: string; // ISO timestamp
  signalValues: Array<{
    signalId: string;
    value: number;
    status: SignalStatus;
    wouldHaveTriggered: boolean;
  }>;
  earliestInterventionPossible: boolean;
}

export interface CoverageStrength {
  failureModeId: string;
  signalId: string;
  strength: 'strong' | 'partial' | 'weak' | 'none';
  reason: string;
}

export interface DecisionRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  relatedSignalId?: string;
  relatedFailureModeId?: string;
  relatedIncidentId?: string;
}
