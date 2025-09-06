import { lesionsDataIntegrator } from './lesionsDataIntegration';

export interface DiagnosticParams {
  taille: number;
  registreIncidents: boolean;
  formationDate: string;
  programmePrevention: boolean;
  secteur: string;
}

export interface NonConformite {
  message: string;
  article: string;
}

export interface Recommandation {
  message: string;
  article: string;
}

export interface DiagnosticResult {
  secteur: string;
  taille: number;
  conformitéGlobale: boolean;
  nonConformités: NonConformite[];
  recommandations: Recommandation[];
}

export async function diagnosticLMRSST({ 
  taille, 
  registreIncidents, 
  formationDate, 
  programmePrevention, 
  secteur 
}: DiagnosticParams): Promise<DiagnosticResult> {
  const recommandations: Recommandation[] = [];
  const nonConformités: NonConformite[] = [];

  // 1. Programme de prévention ou plan d'action
  if (taille >= 20 && !programmePrevention) {
    nonConformités.push({
      message: "Absence de programme de prévention requis (≥ 20 employés)",
      article: "LMRSST 90"
    });
    recommandations.push({
      message: "Vous devez mettre en place un programme de prévention.",
      article: "LMRSST 90"
    });
  }
  if (taille < 20 && !programmePrevention) {
    recommandations.push({
      message: "Un plan d'action est recommandé pour les entreprises de moins de 20 employés.",
      article: "LMRSST 64"
    });
  }

  // 2. Registre des incidents
  if (!registreIncidents) {
    nonConformités.push({
      message: "Registre des incidents manquant ou incomplet",
      article: "LMRSST 123"
    });
    recommandations.push({
      message: "Vous devez tenir à jour un registre des incidents et accidents.",
      article: "LMRSST 123"
    });
  }

  // 3. Formation SST
  const yearsSinceFormation = new Date().getFullYear() - new Date(formationDate).getFullYear();
  if (yearsSinceFormation > 3) {
    nonConformités.push({
      message: "Formation SST périmée (> 3 ans)",
      article: "LMRSST 27"
    });
    recommandations.push({
      message: "La formation SST doit être renouvelée tous les 3 ans.",
      article: "LMRSST 27"
    });
  }

  // 4. Mécanisme de participation
  if (taille >= 20) {
    recommandations.push({
      message: "Vous devez mettre en place un Comité de santé et sécurité (CoSS).",
      article: "LMRSST 101"
    });
  } else {
    recommandations.push({
      message: "Un agent de liaison en SST (ALSS) doit être désigné.",
      article: "LMRSST 101"
    });
  }

  // Enrichissement avec les données réelles de lésions professionnelles
  const diagnosticBase = {
    secteur,
    taille,
    conformitéGlobale: nonConformités.length === 0,
    nonConformités,
    recommandations
  };

  try {
    // Enrichir avec les données SafetyAgentic
    const diagnosticEnrichi = await lesionsDataIntegrator.enrichirDiagnostic(
      diagnosticBase,
      secteur,
      undefined // Ajouter SCIAN si disponible
    );
    
    return diagnosticEnrichi;
  } catch (error) {
    console.warn('Impossible d\'enrichir le diagnostic avec les données réelles:', error);
    return diagnosticBase;
  }
}