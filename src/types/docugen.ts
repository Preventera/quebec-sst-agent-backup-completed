// Types pour DocuGen 2.0 - Pipeline modulaire de génération documentaire SST

export interface LegalFramework {
  id: string;
  name: string; // Ex: "LMRSST", "LSST", "CSTC", "RBQ"
  description: string;
  version: string;
  lastUpdated: string;
  articles: LegalArticle[];
}

export interface LegalArticle {
  id: string;
  number: string; // Ex: "90", "101", "123"
  title: string;
  content: string;
  applicabilityConditions: ApplicabilityCondition[];
  relatedSubjects: string[]; // Liens vers subjects SST
  officialUrl?: string; // Lien LégisQuébec
}

export interface ApplicabilityCondition {
  type: 'company_size' | 'sector' | 'risk_level' | 'date' | 'activity';
  operator: '>=' | '<=' | '<' | '>' | '==' | '!=' | 'includes' | 'excludes';
  value: string | number;
  description: string;
}

export interface SSTSubject {
  id: string;
  name: string; // Ex: "Programme de prévention", "EPI", "SIMDUT"
  category: 'prevention' | 'protection' | 'formation' | 'surveillance' | 'urgence';
  description: string;
  applicableLaws: string[]; // IDs des frameworks légaux
  sectors: string[]; // Secteurs concernés
  riskLevels: ('low' | 'medium' | 'high' | 'critical')[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  version: string;
  legislation: string[]; // Ex: ["LMRSST", "LSST"]
  subject: string; // ID du SSTSubject
  targetSectors: string[];
  companySize: 'all' | 'small' | 'large'; // <20, >=20 employés
  priority: 'mandatory' | 'recommended' | 'optional';
  agent: string; // Agent responsable (DocuGen, CoSS, etc.)
  templatePath: string; // Chemin vers le template Jinja2
  placeholders: TemplatePlaceholder[];
  generationRules: GenerationRule[];
  qualityChecks: QualityCheck[];
  metadata: TemplateMetadata;
}

export interface TemplatePlaceholder {
  id: string;
  name: string;
  type: 'string' | 'number' | 'array' | 'object' | 'date' | 'legal_article' | 'risk_inventory';
  required: boolean;
  defaultValue?: any;
  validation?: PlaceholderValidation;
  source: 'user_input' | 'safety_graph' | 'diagnostic_agent' | 'scian_action' | 'legal_db';
  description: string;
}

export interface PlaceholderValidation {
  pattern?: string; // Regex
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
}

export interface GenerationRule {
  id: string;
  condition: string; // JSONata expression
  action: 'include_section' | 'exclude_section' | 'modify_content' | 'inject_articles';
  target: string; // Section ou placeholder cible
  value?: any;
  description: string;
}

export interface QualityCheck {
  id: string;
  name: string;
  type: 'content_validation' | 'legal_compliance' | 'completeness' | 'format_check';
  rule: string; // Expression de validation
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TemplateMetadata {
  author: string;
  createdDate: string;
  lastModified: string;
  version: string;
  tags: string[];
  estimatedGenerationTime: number; // en secondes
  outputFormats: ('markdown' | 'pdf' | 'docx' | 'html')[];
}

// Types pour le moteur de génération

export interface DocumentGenerationRequest {
  templateId: string;
  companyProfile: CompanyProfile;
  diagnosticData?: any;
  scianActions?: string[];
  additionalData?: Record<string, any>;
  outputFormat: 'markdown' | 'pdf' | 'docx' | 'html';
  options: GenerationOptions;
}

export interface CompanyProfile {
  name: string;
  size: number;
  sector: string;
  scianCode?: string;
  address?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  specificActivities?: string[];
  existingMeasures?: string[];
  responsible_person?: string;
  complianceHistory?: ComplianceRecord[];
}

export interface ComplianceRecord {
  date: string;
  type: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  notes?: string;
}

export interface GenerationOptions {
  language: 'fr' | 'en' | 'es';
  includeSignatures: boolean;
  includeTimestamp: boolean;
  generateTOC: boolean; // Table des matières
  addLegalHyperlinks: boolean;
  validityPeriod?: number; // en mois
  customBranding?: BrandingOptions;
}

export interface BrandingOptions {
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  footerText?: string;
}

// Types pour la sortie générée

export interface GeneratedDocument {
  id: string;
  templateId: string;
  content: string;
  format: 'markdown' | 'pdf' | 'docx' | 'html';
  metadata: DocumentMetadata;
  qualityResults: QualityResult[];
  signatures?: DocumentSignature[];
  traceability: TraceabilityInfo;
}

export interface DocumentMetadata {
  title: string;
  company: string;
  generatedDate: string;
  generatedBy: string;
  version: string;
  language: string;
  pageCount?: number;
  wordCount?: number;
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  validUntil?: string;
}

export interface QualityResult {
  checkId: string;
  checkName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export interface DocumentSignature {
  type: 'digital' | 'electronic' | 'wet';
  signedBy: string;
  signedAt: string;
  role: string;
  hash?: string;
  certificate?: string;
}

export interface TraceabilityInfo {
  documentHash: string; // SHA-256
  generationTimestamp: string;
  sourceDataHash: string;
  templatesUsed: string[];
  agentsInvolved: string[];
  legalFrameworkVersions: Record<string, string>;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  details: any;
}

// Types pour l'ontologie légale

export interface LegalOntology {
  frameworks: LegalFramework[];
  subjects: SSTSubject[];
  sectors: SectorDefinition[];
  relationships: OntologyRelationship[];
}

export interface SectorDefinition {
  id: string;
  name: string;
  scianCodes: string[];
  riskProfile: 'low' | 'medium' | 'high' | 'critical';
  specificRequirements: string[];
  parentSector?: string;
}

export interface OntologyRelationship {
  id: string;
  type: 'requires' | 'applies_to' | 'conflicts_with' | 'supersedes' | 'references';
  source: string;
  target: string;
  conditions?: ApplicabilityCondition[];
  strength: number; // 0-1, force de la relation
}

// Types pour le moteur de règles

export interface RuleEngine {
  evaluate(rules: GenerationRule[], context: RuleContext): RuleResult[];
}

export interface RuleContext {
  company: CompanyProfile;
  template: DocumentTemplate;
  currentDate: Date;
  diagnostic?: any;
  safetyGraph?: any;
}

export interface RuleResult {
  ruleId: string;
  matched: boolean;
  value?: any;
  explanation: string;
}

// Types pour la pipeline DocuGen 2.0

export type PipelineStage = 
  | 'data_collection'
  | 'validation_mapping' 
  | 'template_selection'
  | 'ai_filling'
  | 'compilation_export'
  | 'signature_versioning'
  | 'quality_assurance';

export interface PipelineExecution {
  id: string;
  requestId: string;
  stages: PipelineStageResult[];
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  error?: string;
}

export interface PipelineStageResult {
  stage: PipelineStage;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  logs: string[];
}