// src/lib/scenarioGenerator.ts
// Générateur de scénarios SST multi-législations contextuel

interface ScenarioGenerationParams {
  secteur_scian: string;
  taille_entreprise: string;
  risque_principal: string;
  article_cstc?: string;
  article_lmrsst?: string;
  complexite: 1 | 2 | 3 | 4 | 5;
  legislation_focus: "LMRSST" | "CSTC" | "MIXED" | "RSST" | "LAMTP";
}

interface GeneratedScenario {
  id: number;
  title: string;
  description: string;
  agents: string[];
  article_lmrsst: string;
  article_cstc?: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  scope: string;
  secteur_scian: string;
  taille_entreprise: string;
  orchestration_prompt: string;
  expected_deliverables: string[];
  legislation_context: string;
}

// Configuration des agents par complexité
const AGENTS_BY_COMPLEXITY = {
  1: ["DiagSST"],
  2: ["DiagSST", "LexiNorm"],
  3: ["Hugo", "DiagSST", "LexiNorm"],
  4: ["Hugo", "DiagSST", "LexiNorm", "Prioris"],
  5: ["Hugo", "DiagSST", "LexiNorm", "Prioris", "DocuGen"]
} as const;

// Mapping risques vers catégories et priorités
const RISK_CATEGORIES = {
  chutes: { category: "Protection chutes", priority: "critical" as const },
  machinerie: { category: "Machinerie lourde", priority: "high" as const },
  substances_dangereuses: { category: "Substances dangereuses", priority: "critical" as const },
  electricite: { category: "Sécurité électrique", priority: "high" as const },
  excavation: { category: "Travaux excavation", priority: "high" as const },
  amiante: { category: "Amiante construction", priority: "critical" as const },
  silice: { category: "Exposition silice", priority: "critical" as const },
  echafaudage: { category: "Échafaudages", priority: "high" as const },
  grue: { category: "Équipements levage", priority: "critical" as const },
  demolition: { category: "Démolition sécurisée", priority: "high" as const }
};

// Secteurs SCIAN vers descriptions
const SCIAN_DESCRIPTIONS = {
  "2361": "Construction résidentielle",
  "2362": "Construction non-résidentielle", 
  "2371": "Travaux génie civil",
  "2381": "Travaux démolition",
  "2383": "Travaux spécialisés construction",
  "2111": "Extraction pétrolière",
  "2121": "Mines charbon",
  "2122": "Mines métalliques",
  "5411": "Services juridiques",
  "6211": "Bureaux médecins"
};

// Articles CSTC par type de risque
const CSTC_ARTICLES_BY_RISK = {
  chutes: "2.9.1",
  machinerie: "2.19.1", 
  substances_dangereuses: "2.10.1",
  electricite: "2.11.1",
  excavation: "2.13.1",
  amiante: "2.10.7",
  silice: "2.10.1",
  echafaudage: "2.14.1",
  grue: "2.20.1",
  demolition: "2.12.1"
};

// Templates de génération de titres
const TITLE_TEMPLATES = {
  chutes: [
    "Protection antichute {context}",
    "Système sécurité hauteur {context}",
    "Prévention chutes {context}"
  ],
  machinerie: [
    "Sécurité {equipment} {context}",
    "Maintenance préventive {equipment}",
    "Formation machinerie {context}"
  ],
  substances_dangereuses: [
    "Exposition {substance} {context}",
    "Contrôle {substance} {context}",
    "Protection {substance} {context}"
  ]
};

// Générateur principal
export class ScenarioGenerator {
  private static nextId = 150; // Commencer après vos scénarios existants (110 + 10 nouveaux)
  
  static generateScenario(params: ScenarioGenerationParams): GeneratedScenario {
    const riskConfig = RISK_CATEGORIES[params.risque_principal] || 
      { category: "Sécurité générale", priority: "medium" as const };
    
    const agents = AGENTS_BY_COMPLEXITY[params.complexite];
    const sectorDescription = SCIAN_DESCRIPTIONS[params.secteur_scian] || "Secteur général";
    
    // Génération contextuelle du titre
    const title = this.generateTitle(params, sectorDescription);
    const description = this.generateDescription(params, sectorDescription);
    const scope = this.generateScope(params);
    const orchestrationPrompt = this.generateOrchestrationPrompt(params, agents);
    const deliverables = this.generateDeliverables(params);
    
    const scenario: GeneratedScenario = {
      id: this.nextId++,
      title,
      description,
      agents: [...agents],
      article_lmrsst: params.article_lmrsst || "Art. 51",
      article_cstc: params.article_cstc || CSTC_ARTICLES_BY_RISK[params.risque_principal],
      category: riskConfig.category,
      priority: riskConfig.priority,
      scope,
      secteur_scian: params.secteur_scian,
      taille_entreprise: params.taille_entreprise,
      orchestration_prompt: orchestrationPrompt,
      expected_deliverables: deliverables,
      legislation_context: this.getLegislationContext(params)
    };
    
    return scenario;
  }
  
  private static generateTitle(params: ScenarioGenerationParams, sector: string): string {
    const templates = TITLE_TEMPLATES[params.risque_principal] || [
      "Gestion {risk} {context}",
      "Contrôle {risk} {context}",
      "Sécurité {risk} {context}"
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const context = `${sector.toLowerCase()} ${params.taille_entreprise} employés`;
    
    return template
      .replace("{risk}", params.risque_principal)
      .replace("{context}", context)
      .replace("{equipment}", this.getEquipmentByRisk(params.risque_principal))
      .replace("{substance}", this.getSubstanceByRisk(params.risque_principal));
  }
  
  private static generateDescription(params: ScenarioGenerationParams, sector: string): string {
    const actionVerbs = ["Orchestrer", "Mobiliser", "Activer", "Déployer"];
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    
    const agents = AGENTS_BY_COMPLEXITY[params.complexite];
    const agentsText = agents.slice(0, 2).join(" et ");
    
    return `${verb} ${agentsText} pour gestion ${params.risque_principal} ${sector.toLowerCase()} ${params.taille_entreprise} employés.`;
  }
  
  private static generateScope(params: ScenarioGenerationParams): string {
    const riskShort = params.risque_principal.substring(0, 8);
    const sectorShort = params.secteur_scian.substring(2);
    return `${riskShort}_${sectorShort}_${params.taille_entreprise.replace("-", "_")}`;
  }
  
  private static generateOrchestrationPrompt(params: ScenarioGenerationParams, agents: readonly string[]): string {
    const verb = agents.length > 2 ? "Orchestrer" : "Mobiliser";
    const agentsText = agents.slice(0, 3).join(", ");
    const article = params.legislation_focus === "CSTC" ? 
      `Art. ${CSTC_ARTICLES_BY_RISK[params.risque_principal]} CSTC` :
      `${params.article_lmrsst || "Art. 51"} LMRSST`;
    
    return `${verb} ${agentsText} pour ${params.risque_principal} ${SCIAN_DESCRIPTIONS[params.secteur_scian]?.toLowerCase()} conformément ${article}.`;
  }
  
  private static generateDeliverables(params: ScenarioGenerationParams): string[] {
    const baseDeliverables = {
      chutes: ["Plan protection chutes", "Procédures travail hauteur", "Formation sécurité"],
      machinerie: ["Manuel utilisation", "Programme maintenance", "Formation opérateurs"],
      substances_dangereuses: ["Plan contrôle exposition", "Procédures manipulation", "Surveillance médicale"]
    };
    
    return baseDeliverables[params.risque_principal] || [
      "Procédures sécurisées",
      "Plan formation",
      "Documents conformité"
    ];
  }
  
  private static getLegislationContext(params: ScenarioGenerationParams): string {
    switch (params.legislation_focus) {
      case "CSTC": return "CSTC+LMRSST";
      case "RSST": return "RSST+LMRSST";
      case "LAMTP": return "LAMTP+LMRSST";
      case "MIXED": return "MULTI";
      default: return "LMRSST";
    }
  }
  
  private static getEquipmentByRisk(risk: string): string {
    const equipment = {
      machinerie: "excavatrice",
      grue: "grue mobile",
      demolition: "marteau hydraulique"
    };
    return equipment[risk] || "équipement";
  }
  
  private static getSubstanceByRisk(risk: string): string {
    const substances = {
      substances_dangereuses: "silice",
      amiante: "amiante",
      silice: "silice crystalline"
    };
    return substances[risk] || "substance";
  }
  
  // Génération massive basée sur combinatoire
  static generateBatch(baseParams: Partial<ScenarioGenerationParams>, count: number = 10): GeneratedScenario[] {
    const scenarios: GeneratedScenario[] = [];
    
    const secteurs = ["2361", "2362", "2371"];
    const tailles = ["5-19", "20-49", "50-99"];
    const risques = ["chutes", "machinerie", "substances_dangereuses"];
    const complexites = [2, 3, 4] as const;
    
    let generated = 0;
    for (const secteur of secteurs) {
      for (const taille of tailles) {
        for (const risque of risques) {
          for (const complexite of complexites) {
            if (generated >= count) break;
            
            const fullParams: ScenarioGenerationParams = {
              secteur_scian: secteur,
              taille_entreprise: taille,
              risque_principal: risque,
              complexite,
              legislation_focus: "CSTC",
              ...baseParams
            };
            
            scenarios.push(this.generateScenario(fullParams));
            generated++;
          }
          if (generated >= count) break;
        }
        if (generated >= count) break;
      }
      if (generated >= count) break;
    }
    
    return scenarios;
  }
}

// Utilitaires pour analyse documentaire
export class DocumentAnalyzer {
  static analyzeDocument(content: string): {
    detectedSector: string | null;
    detectedRisks: string[];
    detectedLegislation: string[];
    recommendedParams: Partial<ScenarioGenerationParams>;
  } {
    const analysis = {
      detectedSector: null as string | null,
      detectedRisks: [] as string[],
      detectedLegislation: [] as string[],
      recommendedParams: {} as Partial<ScenarioGenerationParams>
    };
    
    const contentLower = content.toLowerCase();
    
    // Détection secteur
    if (contentLower.includes("construction") || contentLower.includes("chantier")) {
      analysis.detectedSector = "2362";
    }
    if (contentLower.includes("résidentiel") || contentLower.includes("maison")) {
      analysis.detectedSector = "2361";
    }
    
    // Détection risques
    const riskKeywords = {
      chutes: ["chute", "hauteur", "échelle", "toit", "échafaud"],
      machinerie: ["machine", "équipement", "grue", "excavat"],
      substances_dangereuses: ["silice", "amiante", "poussière", "chimique"],
      electricite: ["électr", "courant", "voltage", "circuit"]
    };
    
    Object.entries(riskKeywords).forEach(([risk, keywords]) => {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        analysis.detectedRisks.push(risk);
      }
    });
    
    // Détection législation
    if (contentLower.includes("cstc") || contentLower.includes("construction")) {
      analysis.detectedLegislation.push("CSTC");
    }
    if (contentLower.includes("lmrsst") || contentLower.includes("comité")) {
      analysis.detectedLegislation.push("LMRSST");
    }
    
    // Recommandations
    analysis.recommendedParams = {
      secteur_scian: analysis.detectedSector || "2362",
      risque_principal: analysis.detectedRisks[0] || "chutes",
      legislation_focus: analysis.detectedLegislation.includes("CSTC") ? "CSTC" : "LMRSST",
      complexite: analysis.detectedRisks.length > 2 ? 4 : 3
    };
    
    return analysis;
  }
}

// Export par défaut
export default ScenarioGenerator;