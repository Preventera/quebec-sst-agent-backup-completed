// === TYPES DATAFORGE À AJOUTER DANS src/types/index.ts (ou créer le fichier) ===

// === TYPES EXISTANTS AGENTICSST (gardez-les) ===
// ... vos types existants ...

// === NOUVEAUX TYPES DATAFORGE ===

export interface LegalReference {
  code: string;
  title: string;
  type: 'Loi' | 'Règlement';
  source: string;
  lastUpdate: string;
  url: string;
}

export interface ComplianceRule {
  id: string;
  condition: (context: DocumentContext) => boolean;
  obligations: string[];
  legalRefs: string[];
  severity: 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'CRITIQUE';
  sector: string[];
}

export interface DocumentContext {
  keywords: string[];
  sector: string;
  scianCode: string;
  employeeCount: number;
  durationMonths?: number;
  detectedSubstances: string[];
  chemicalInventory: string[];
  riskLevel: string;
  documentType?: string;
  detectedRegulations?: string[];
}

export interface NonConformity {
  id: string;
  legal_reference: string;
  severity: 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'CRITIQUE';
  description: string;
  recommended_action: string;
  article_text?: string;
  deadline_days?: number;
  responsible?: string;
}

export interface Obligation {
  id: string;
  article: string;
  theme: string;
  description: string;
  isCompliant: boolean;
  legalRefs: string[];
  actionType: 'formation' | 'documentation' | 'evaluation_risque' | 'conformite_legale' | 'comite_sst' | 'surveillance' | 'communication';
  severity: 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'CRITIQUE';
  estimatedDuration: string;
  estimatedCost?: number;
}

export interface ActionPlan {
  immediate_actions: ActionItem[];
  short_term_actions: ActionItem[];
  long_term_actions: ActionItem[];
  estimated_total_cost: number;
  estimated_total_duration: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responsible: string;
  deadline: string;
  estimated_cost: number;
  legal_reference: string;
  agents_recommended: string[];
}

export interface GeneratedScenario {
  id: string;
  title: string;
  description: string;
  agents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  legislation_context: string;
  secteur_scian: string;
  action_type: string;
  estimated_duration: string;
  dataforge_generated: boolean;
  legal_basis?: string;
  compliance_gap?: string;
}

export interface ComplianceAnalysisResult {
  document_id: string;
  conformity_score: number;
  triggered_rules: string[];
  legal_references: LegalReference[];
  non_conformities: NonConformity[];
  obligations: Obligation[];
  action_plan: ActionPlan;
  generated_scenarios: GeneratedScenario[];
  validation_timestamp: Date;
  dataforge_version: string;
  processing_time?: number;
  confidence_level?: number;
}

export interface DocumentMetadata {
  id: string;
  type: string;
  sector: string;
  uploadedAt: Date;
  source: string;
  fileSize?: number;
  fileName?: string;
  employeeCount?: number;
  companyName?: string;
  analysisType?: string;
}

// === TYPES POUR L'INTERFACE UTILISATEUR ===
export interface DataForgeAnalysisState {
  isLoading: boolean;
  result: ComplianceAnalysisResult | null;
  error: string | null;
  analysisStartTime: Date | null;
  processingStep: string;
}

export interface DataForgeUIProps {
  onAnalysisComplete: (result: ComplianceAnalysisResult) => void;
  onError: (error: string) => void;
  documentContent: string;
  documentType: string;
  sector: string;
}