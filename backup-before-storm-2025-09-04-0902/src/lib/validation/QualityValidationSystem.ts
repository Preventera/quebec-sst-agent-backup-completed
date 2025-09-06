// src/lib/validation/QualityValidationSystem.ts
// Système de validation croisée pour éviter les hallucinations réglementaires
// et assurer la qualité des références légales générées par SafeVision

interface ValidationResult {
  isValid: boolean;
  confidenceScore: number; // 0-100
  validatedReferences: string[];
  flaggedContent: ValidationFlag[];
  recommendations: string[];
}

interface ValidationFlag {
  type: 'missing_reference' | 'invalid_citation' | 'outdated_regulation' | 'hallucination_risk';
  content: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
}

interface DocumentReference {
  id: string;
  title: string;
  source: string;
  section?: string;
  article?: string;
  lastUpdated: Date;
  isOfficialSource: boolean;
}

class QualityValidationSystem {
  private documentIndex: Map<string, DocumentReference> = new Map();
  private regulationPatterns: RegExp[];
  private officialSources = ['CNESST', 'CSTC', 'RSST', 'LMRSST'];

  constructor() {
    this.initializePatterns();
    this.loadDocumentIndex();
  }

  /**
   * VALIDATION PRINCIPALE
   * Valide le contenu généré par SafeVision
   */
  async validateGeneratedContent(content: string, sourceFilters: any): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      confidenceScore: 100,
      validatedReferences: [],
      flaggedContent: [],
      recommendations: []
    };

    // 1. Extraction des références citées
    const extractedReferences = this.extractReferences(content);
    
    // 2. Validation croisée avec corpus documentaire
    for (const ref of extractedReferences) {
      const validation = await this.validateReference(ref);
      
      if (validation.isValid) {
        result.validatedReferences.push(ref);
      } else {
        result.flaggedContent.push({
          type: 'invalid_citation',
          content: ref,
          severity: 'high',
          suggestion: validation.suggestion || 'Vérifier la référence dans les documents officiels'
        });
        result.confidenceScore -= 15;
        result.isValid = false;
      }
    }

    // 3. Détection d'hallucinations potentielles
    const hallucinations = this.detectHallucinations(content);
    result.flaggedContent.push(...hallucinations);
    
    // 4. Vérification conformité secteur
    const sectorCompliance = this.validateSectorCompliance(content, sourceFilters);
    if (!sectorCompliance.isValid) {
      result.flaggedContent.push(...sectorCompliance.flags);
      result.confidenceScore -= 10;
    }

    // 5. Calcul score final
    result.confidenceScore = Math.max(0, result.confidenceScore - (result.flaggedContent.length * 5));
    result.isValid = result.confidenceScore >= 70;

    // 6. Génération recommandations
    result.recommendations = this.generateRecommendations(result);

    return result;
  }

  /**
   * EXTRACTION DES RÉFÉRENCES
   * Identifie toutes les références légales dans le texte
   */
  private extractReferences(content: string): string[] {
    const references: string[] = [];
    
    // Patterns pour identifier les références
    const patterns = [
      /LMRSST[,\s]*[Aa]rt\.?\s*(\d+)/g,
      /CSTC[,\s]*(\d+(?:\.\d+)*)/g,
      /RSST[,\s]*[Aa]rt\.?\s*(\d+)/g,
      /[Aa]rticle\s*(\d+)/g,
      /[Ss]ection\s*(\d+(?:\.\d+)*)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        references.push(match[0]);
      }
    });

    return [...new Set(references)]; // Supprimer doublons
  }

  /**
   * VALIDATION DE RÉFÉRENCE
   * Vérifie qu'une référence existe dans le corpus documentaire
   */
  private async validateReference(reference: string): Promise<{isValid: boolean, suggestion?: string}> {
    // Recherche dans l'index documentaire
    for (const [id, doc] of this.documentIndex) {
      if (this.referenceMatchesDocument(reference, doc)) {
        return { isValid: true };
      }
    }

    // Si pas trouvé, suggérer des alternatives
    const suggestion = this.findSimilarReferences(reference);
    return { 
      isValid: false, 
      suggestion: suggestion || `Référence "${reference}" non trouvée dans le corpus documentaire`
    };
  }

  /**
   * DÉTECTION D'HALLUCINATIONS
   * Identifie le contenu potentiellement halluciné
   */
  private detectHallucinations(content: string): ValidationFlag[] {
    const flags: ValidationFlag[] = [];

    // 1. Détection de dates inexistantes
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g;
    const dates = content.match(datePattern) || [];
    
    dates.forEach(date => {
      const parsedDate = new Date(date);
      if (parsedDate > new Date() || parsedDate < new Date('2000-01-01')) {
        flags.push({
          type: 'hallucination_risk',
          content: `Date suspecte: ${date}`,
          severity: 'medium',
          suggestion: 'Vérifier la validité de cette date'
        });
      }
    });

    // 2. Détection de références fantaisistes
    const suspiciousPatterns = [
      /CNESST-\d{6,}/g, // Codes CNESST trop longs
      /LMRSST\s+Art\.\s*\d{3,}/g, // Articles LMRSST inexistants
      /Directive\s+\d{4}-\d{3,}/g // Directives avec formats suspects
    ];

    suspiciousPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        flags.push({
          type: 'hallucination_risk',
          content: match,
          severity: 'high',
          suggestion: 'Cette référence semble fantaisiste, vérifier dans les sources officielles'
        });
      });
    });

    return flags;
  }

  /**
   * VALIDATION CONFORMITÉ SECTEUR
   * Vérifie que le contenu correspond au secteur ciblé
   */
  private validateSectorCompliance(content: string, filters: any): {isValid: boolean, flags: ValidationFlag[]} {
    const flags: ValidationFlag[] = [];
    
    // Vérifier cohérence secteur vs contenu
    if (filters.sector === 'construction') {
      const constructionKeywords = ['échafaudage', 'hauteur', 'chute', 'casque', 'harnais'];
      const found = constructionKeywords.some(keyword => 
        content.toLowerCase().includes(keyword)
      );
      
      if (!found) {
        flags.push({
          type: 'invalid_citation',
          content: 'Contenu ne correspond pas au secteur construction',
          severity: 'medium',
          suggestion: 'Ajouter des références spécifiques à la construction'
        });
      }
    }

    return {
      isValid: flags.length === 0,
      flags
    };
  }

  /**
   * GÉNÉRATION DE RECOMMANDATIONS
   */
  private generateRecommendations(result: ValidationResult): string[] {
    const recommendations: string[] = [];

    if (result.confidenceScore < 70) {
      recommendations.push('Score de confiance faible - Réviser le contenu avant publication');
    }

    if (result.flaggedContent.some(f => f.type === 'invalid_citation')) {
      recommendations.push('Vérifier toutes les références légales dans les documents source');
    }

    if (result.flaggedContent.some(f => f.type === 'hallucination_risk')) {
      recommendations.push('Contenu suspect détecté - Validation manuelle recommandée');
    }

    if (result.validatedReferences.length === 0) {
      recommendations.push('Aucune référence validée - Ajouter des citations vérifiables');
    }

    return recommendations;
  }

  /**
   * UTILITAIRES PRIVÉS
   */
  private initializePatterns(): void {
    this.regulationPatterns = [
      /LMRSST/gi,
      /CSTC/gi,
      /RSST/gi,
      /CNESST/gi
    ];
  }

  private loadDocumentIndex(): void {
    // Charger l'index des 196 documents CNESST
    // À implémenter selon votre structure de données
    console.log('Loading document index from corpus...');
  }

  private referenceMatchesDocument(reference: string, doc: DocumentReference): boolean {
    // Logique de matching entre référence et document
    return doc.title.toLowerCase().includes(reference.toLowerCase()) ||
           (doc.section && reference.includes(doc.section)) ||
           (doc.article && reference.includes(doc.article));
  }

  private findSimilarReferences(reference: string): string | null {
    // Recherche de références similaires pour suggestions
    for (const [id, doc] of this.documentIndex) {
      if (this.similarity(reference, doc.title) > 0.7) {
        return `Référence similaire trouvée: ${doc.title}`;
      }
    }
    return null;
  }

  private similarity(str1: string, str2: string): number {
    // Calcul simple de similarité
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * API PUBLIQUE
   */
  
  // Validation rapide pour SafeVision
  async quickValidation(content: string): Promise<{score: number, isReliable: boolean}> {
    const result = await this.validateGeneratedContent(content, {});
    return {
      score: result.confidenceScore,
      isReliable: result.isValid
    };
  }

  // Validation complète avec rapport détaillé
  async fullValidation(content: string, context: any): Promise<ValidationResult> {
    return await this.validateGeneratedContent(content, context);
  }

  // Intégration avec SafeVision
  async validateSafeVisionScript(script: any, sourceFilters: any): Promise<ValidationResult> {
    const scriptContent = typeof script === 'string' ? script : JSON.stringify(script);
    return await this.validateGeneratedContent(scriptContent, sourceFilters);
  }
}

// Instance globale
export const qualityValidator = new QualityValidationSystem();

// Types d'export
export type { ValidationResult, ValidationFlag, DocumentReference };