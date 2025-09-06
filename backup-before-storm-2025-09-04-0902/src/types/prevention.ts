// TypeScript models based on Python data models for prevention program
export enum HierarchyLevel {
  ELIMINATION = "Élimination à la source",
  SUBSTITUTION = "Substitution",
  ENGINEERING = "Contrôles techniques",
  AWARENESS = "Sensibilisation et formation",
  ADMINISTRATIVE = "Mesures administratives",
  PPE = "Équipements de protection individuelle"
}

export enum MeasureStatus {
  PLANNED = "Planifiée",
  IN_PROGRESS = "En cours",
  COMPLETED = "Complétée",
  DELAYED = "Retardée",
  CANCELLED = "Annulée"
}

export enum RiskCategory {
  MECHANICAL = "Mécanique",
  ELECTRICAL = "Électrique",
  CHEMICAL = "Chimique",
  BIOLOGICAL = "Biologique",
  ERGONOMIC = "Ergonomique",
  PHYSICAL = "Physique",
  PSYCHOSOCIAL = "Psychosocial",
  FALL = "Chute",
  FIRE = "Incendie",
  OTHER = "Autre"
}

export enum PriorityLevel {
  LOW = "Faible",
  MODERATE = "Modéré",
  HIGH = "Élevé",
  CRITICAL = "Critique"
}

export interface CompanyProfile {
  name: string;
  scianCode: string;
  employeesCount: number;
  priorityGroup: 1 | 2 | 3;
  activities: string[];
  equipments: string[];
  address?: string;
  city?: string;
  province: string;
  postalCode?: string;
  sizeCategory: "Petite" | "Moyenne" | "Grande";
  hasMandatoryCommittee: boolean;
}

export interface Risk {
  id: string;
  description: string;
  category: RiskCategory;
  probability: number; // 1-5
  severity: number; // 1-5
  frequency: number; // 1-5
  zone: string;
  regulationReferences: string[];
  specificSector?: string;
  riskIndex: number; // P × G × F
  priorityLevel: PriorityLevel;
}

export interface PreventiveMeasure {
  id: string;
  description: string;
  hierarchyLevel: HierarchyLevel;
  riskId: string;
  responsible: string;
  regulationReferences: string[];
  riskReduction: number; // 0-100
  deadline?: Date;
  estimatedCost?: number;
  implementationSteps: string[];
  status: MeasureStatus;
  creationDate: Date;
  completionDate?: Date;
  comments: string;
  isOverdue: boolean;
  daysUntilDeadline?: number;
  complianceScore: number; // 0-100
}

export interface SSTCommittee {
  workerRepresentatives: number;
  employerRepresentatives: number;
  meetingFrequency: string;
  roles: Record<string, string>;
  bestPractices: string[];
  nextMeetingDate?: Date;
  lastMeetingDate?: Date;
  lastMeetingMinutes?: string;
}

export interface EmergencyProcedure {
  title: string;
  type: string;
  steps: string[];
  responsiblePersons: string[];
  emergencyContacts: Record<string, string>;
  equipmentLocations: Record<string, string>;
  lastRevisionDate?: Date;
  lastDrillDate?: Date;
}

export interface TrainingPlan {
  title: string;
  description: string;
  targetAudience: string[];
  duration: number;
  frequency: string;
  trainer: string;
  materials: string[];
  isMandatory: boolean;
  regulationReferences: string[];
}

export interface PreventionProgram {
  id: string;
  company: CompanyProfile;
  risks: Risk[];
  preventiveMeasures: PreventiveMeasure[];
  sstCommittee?: SSTCommittee;
  emergencyProcedures: EmergencyProcedure[];
  trainingPlans: TrainingPlan[];
  sections: Record<string, string>;
  creationDate: Date;
  approvalDate?: Date;
  approvedBy?: string;
  revisionDate?: Date;
  compliancePercentage: number;
  overdueMessagesCount: number;
}

export interface ScianAction {
  id: string;
  scianCategorie: string;
  scenarioPhase: string;
  activiteTravaux: string;
  risque: string;
  categorieProgramme: string;
  composanteSmsst: string;
  sujetSst: string;
  etapeWorkflow: string;
  actionRapide: string;
  but: string;
  referentiels: string[];
  sousEtapes: string[];
  explication: string;
}