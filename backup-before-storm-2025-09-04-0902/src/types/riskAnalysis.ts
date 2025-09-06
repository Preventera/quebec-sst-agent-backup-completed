export interface RiskCategory {
  id: string;
  name: string;
}

export interface RiskScore {
  probability: number;
  severity: number;
  score: number;
}

export interface ResidualRisk {
  reduction: number;
  score: number;
}

export interface RiskAnalysisItem {
  id: string;
  sector: string;
  phase: string;
  dangerousSituation: string;
  danger: string;
  risk: string;
  criticalDanger: string;
  injuryDamage: string;
  initialRisk: RiskScore;
  controlMeasures: string;
  criticalControlMeasures: string;
  applicableFrameworks: string[];
  residualRisk: ResidualRisk;
  recommendations?: string;
}

export interface RiskAnalysisMatrix {
  metadata: {
    title: string;
    description: string;
    lastUpdated: string;
    version: string;
  };
  riskCategories: RiskCategory[];
  riskAnalysis: RiskAnalysisItem[];
}

export interface RiskLevel {
  min: number;
  max: number;
  level: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
  color: string;
}

export const RISK_LEVELS: RiskLevel[] = [
  { min: 1, max: 3, level: 'Faible', color: 'green' },
  { min: 4, max: 6, level: 'Modéré', color: 'yellow' },
  { min: 7, max: 12, level: 'Élevé', color: 'orange' },
  { min: 13, max: 25, level: 'Critique', color: 'red' }
];

export const getRiskLevel = (score: number): RiskLevel => {
  return RISK_LEVELS.find(level => score >= level.min && score <= level.max) || RISK_LEVELS[0];
};