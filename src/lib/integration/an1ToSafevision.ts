export interface AN1ToSafeVisionMapping {
  recommendationId: string;
  safevisionScenario: string;
  scriptPrompt: string;
  targetAudience: string;
  estimatedDuration: string;
}

export const mapAN1ToSafeVision = (an1Recommendation: any): AN1ToSafeVisionMapping => {
  // Mapping des recommandations AN1 vers scénarios SafeVision
  const mappings = {
    "formation_echafaudages": {
      safevisionScenario: "CONST_001",
      scriptPrompt: "Formation échafaudages sécurisés PME construction",
      targetAudience: "PME Construction 1-25 employés",
      estimatedDuration: "45min"
    },
    "audit_epi": {
      safevisionScenario: "CONST_002", 
      scriptPrompt: "Audit équipements protection trimestriel",
      targetAudience: "Responsables SST construction",
      estimatedDuration: "30min"
    }
  };
  
  return mappings[an1Recommendation.type] || null;
};