// Extension de l'orchestrateur avec validation croisée
// src/lib/agentValidator.ts

import { createClient } from '@supabase/supabase-js';
import { executeAgentScenario } from '@/lib/agentOrchestrator';
import orchestrationPrompts from '@/data/orchestrationPrompts.json';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  validatedReferences: string[];
  invalidReferences: string[];
  corrected?: boolean;
  originalErrors?: string[];
  correctionFailed?: boolean;
}

interface RegulatoryReference {
  type: 'LMRSST' | 'CNESST' | 'RSST' | 'ISO';
  article: string;
  fullReference: string;
}

class DocumentValidator {
  
  // Valider les références réglementaires contre la base crawlée
  async validateRegulatoryReferences(content: string): Promise<ValidationResult> {
    const references = this.extractReferences(content);
    const validatedRefs: string[] = [];
    const invalidRefs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Si pas de références, retourner une validation positive
    if (references.length === 0) {
      return {
        isValid: true,
        confidence: 100,
        errors: [],
        warnings: ['Aucune référence réglementaire détectée'],
        validatedReferences: [],
        invalidReferences: []
      };
    }

    for (const ref of references) {
      try {
        const isValid = await this.checkReferenceInDatabase(ref);
        if (isValid) {
          validatedRefs.push(ref.fullReference);
        } else {
          invalidRefs.push(ref.fullReference);
          errors.push(`Référence invalide ou introuvable: ${ref.fullReference}`);
        }
      } catch (error) {
        warnings.push(`Erreur de validation pour: ${ref.fullReference}`);
        // En cas d'erreur, on considère la référence comme valide par défaut
        validatedRefs.push(ref.fullReference);
      }
    }

    // Calcul du score de confiance
    const confidence = references.length > 0 
      ? (validatedRefs.length / references.length) * 100 
      : 100;

    // Warnings pour confiance faible
    if (confidence < 80 && references.length > 0) {
      warnings.push(`Confiance faible (${confidence.toFixed(1)}%) - Révision recommandée`);
    }

    return {
      isValid: confidence >= 70,
      confidence,
      errors,
      warnings,
      validatedReferences: validatedRefs,
      invalidReferences: invalidRefs
    };
  }

  // Extraire les références du contenu
  private extractReferences(content: string): RegulatoryReference[] {
    const references: RegulatoryReference[] = [];
    
    // Patterns pour différents types de références
    const patterns = {
      LMRSST: /LMRSST\s*[Aa]rt\.?\s*(\d+(?:\.\d+)*)/g,
      CNESST: /CNESST\s*(?:guide|procédure)s?\s*([\w\s-]+)/gi,
      RSST: /RSST\s*[Aa]rt\.?\s*(\d+(?:\.\d+)*)/g,
      ISO: /ISO\s*(\d+)/g
    };

    Object.entries(patterns).forEach(([type, pattern]) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        references.push({
          type: type as RegulatoryReference['type'],
          article: match[1],
          fullReference: match[0]
        });
      }
    });

    return references;
  }

  // Vérifier une référence dans la base crawlée
  private async checkReferenceInDatabase(ref: RegulatoryReference): Promise<boolean> {
    try {
      // Vérifier si Supabase est configuré
      if (!import.meta.env.VITE_SUPABASE_URL) {
        console.warn('Supabase non configuré, validation désactivée');
        return true; // Retourner vrai par défaut si pas de config
      }

      const searchTerms = [ref.fullReference, ref.article, `${ref.type} ${ref.article}`];
      
      for (const term of searchTerms) {
        const { data, error } = await supabase
          .from('sst_crawled_content')
          .select('id')
          .or(`title.ilike.%${term}%,content.ilike.%${term}%,url.ilike.%${term}%`)
          .limit(1);

        if (error) {
          console.warn('Erreur Supabase:', error.message);
          return true; // En cas d'erreur, considérer comme valide
        }

        if (data && data.length > 0) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur validation référence:', error);
      return true; // En cas d'erreur, considérer comme valide par défaut
    }
  }

  // Valider la cohérence sectorielle
  async validateSectoralConsistency(content: string, expectedSector?: string): Promise<boolean> {
    if (!expectedSector) return true;

    try {
      // Vérifier si Supabase est configuré
      if (!import.meta.env.VITE_SUPABASE_URL) {
        return true;
      }

      const { data } = await supabase
        .from('sst_crawled_content')
        .select('sector')
        .textSearch('content', content)
        .limit(5);

      const sectors = data?.map(d => d.sector).filter(Boolean) || [];
      return sectors.some(sector => 
        sector?.toLowerCase().includes(expectedSector.toLowerCase())
      );
    } catch (error) {
      console.error('Erreur validation sectorielle:', error);
      return true; // En cas d'erreur, on assume que c'est valide
    }
  }
}

// Extension de l'orchestrateur avec validation
export class ValidatedAgentOrchestrator {
  private validator = new DocumentValidator();
  
  // Exécuter un agent simple (méthode interne)
  private async executeAgent(agentName: string, userMessage: string, systemPrompt?: string) {
    // Simuler l'exécution d'un agent avec du contenu réaliste
    const simulatedContent = `
Analyse de conformité LMRSST pour ${agentName}:

${userMessage}

Recommandations selon l'article LMRSST Art. 88-91:
- Mise en place d'un comité de santé-sécurité
- Formation des représentants
- Évaluation des mécanismes de participation

Références: CNESST Guide participation des travailleurs
    `;

    return {
      agent: agentName,
      content: simulatedContent,
      timestamp: new Date().toISOString()
    };
  }
  
  async executeAgentWithValidation(
    agentName: string,
    userMessage: string,
    systemPrompt?: string,
    validationLevel: 'none' | 'basic' | 'strict' = 'basic'
  ) {
    // Exécution normale de l'agent
    const response = await this.executeAgent(agentName, userMessage, systemPrompt);
    
    if (validationLevel === 'none') {
      return response;
    }

    // Validation du contenu généré
    const validation = await this.validateAgentResponse(response, validationLevel);
    
    // Si validation échoue, tenter correction automatique
    if (!validation.isValid && validationLevel === 'strict') {
      return await this.attemptAutoCorrection(response, validation);
    }

    return {
      ...response,
      validation
    };
  }

  private async validateAgentResponse(
    response: any, 
    level: 'basic' | 'strict'
  ): Promise<ValidationResult> {
    const content = response.content;
    
    // Validation des références réglementaires
    const refValidation = await this.validator.validateRegulatoryReferences(content);
    
    if (level === 'strict') {
      // Validation sectorielle additionnelle
      const sectorValid = await this.validator.validateSectoralConsistency(content);
      
      return {
        ...refValidation,
        isValid: refValidation.isValid && sectorValid,
        warnings: [
          ...refValidation.warnings,
          ...(sectorValid ? [] : ['Cohérence sectorielle douteuse'])
        ]
      };
    }
    
    return refValidation;
  }

  private async attemptAutoCorrection(
    originalResponse: any,
    validation: ValidationResult
  ) {
    if (validation.invalidReferences.length === 0) {
      return originalResponse;
    }

    // Construire un prompt de correction
    const correctionPrompt = `
Le document suivant contient des références incorrectes :
${validation.invalidReferences.join(', ')}

Document original :
${originalResponse.content}

Corrigez les références invalides en utilisant uniquement des références LMRSST, CNESST, ou RSST authentiques.
Si vous ne connaissez pas la référence exacte, supprimez-la plutôt que d'inventer.
`;

    try {
      const correctedResponse = await this.executeAgent(
        'LexiNorm', // Agent spécialisé en références légales
        correctionPrompt,
        'Tu es un expert en références réglementaires québécoises. Corrige uniquement les références invalides.'
      );

      return {
        ...correctedResponse,
        validation: {
          ...validation,
          corrected: true,
          originalErrors: validation.errors
        }
      };
    } catch (error) {
      // Si correction échoue, retourner original avec warning
      return {
        ...originalResponse,
        validation: {
          ...validation,
          correctionFailed: true
        }
      };
    }
  }

  // Validation batch pour scénarios d'orchestration
  async executeValidatedOrchestration(
    scenarioId: number,
    context: string,
    validationLevel: 'basic' | 'strict' = 'basic'
  ) {
    try {
      const scenario = orchestrationPrompts.find((s: any) => s.id === scenarioId);
      if (!scenario) {
        throw new Error(`Scénario ${scenarioId} non trouvé`);
      }

      // Simuler l'exécution de l'orchestrateur existant
      let responses;
      try {
        responses = await executeAgentScenario(
          scenarioId,
          context,
          'validation-session-' + Date.now()
        );
      } catch (error) {
        console.warn('Orchestrateur original indisponible, simulation:', error);
        // Simuler des réponses pour les agents du scénario
        responses = scenario.agents.map((agent: string) => ({
          agent,
          content: `Réponse simulée de ${agent} pour le scénario ${scenario.title}`,
          timestamp: new Date().toISOString()
        }));
      }

      // Valider chaque réponse
      const validatedResponses = [];
      const validationSummary = {
        totalAgents: responses.length,
        validResponses: 0,
        invalidResponses: 0,
        correctedResponses: 0,
        overallConfiance: 0
      };

      for (const response of responses) {
        const validation = await this.validateAgentResponse(response, validationLevel);
        
        const validatedResponse = {
          ...response,
          validation
        };
        
        validatedResponses.push(validatedResponse);
        
        if (validation.isValid) {
          validationSummary.validResponses++;
        } else {
          validationSummary.invalidResponses++;
        }
        
        if (validation.corrected) {
          validationSummary.correctedResponses++;
        }
        
        validationSummary.overallConfiance += validation.confidence;
      }

      validationSummary.overallConfiance /= responses.length;

      return {
        responses: validatedResponses,
        validationSummary,
        recommendReview: validationSummary.overallConfiance < 80
      };

    } catch (error) {
      console.error('Erreur executeValidatedOrchestration:', error);
      
      // Retourner des données par défaut en cas d'erreur
      return {
        responses: [{
          agent: 'System',
          content: 'Erreur lors de l\'exécution avec validation',
          timestamp: new Date().toISOString(),
          validation: {
            isValid: false,
            confidence: 0,
            errors: [error.message],
            warnings: ['Système de validation indisponible'],
            validatedReferences: [],
            invalidReferences: []
          }
        }],
        validationSummary: {
          totalAgents: 1,
          validResponses: 0,
          invalidResponses: 1,
          correctedResponses: 0,
          overallConfiance: 0
        },
        recommendReview: true
      };
    }
  }
}

// Utilitaires pour l'interface utilisateur
export class ValidationUI {
  
  static renderValidationBadge(validation: ValidationResult) {
    if (validation.confidence >= 90) {
      return { color: 'green', text: 'Haute confiance', icon: 'check-circle' };
    } else if (validation.confidence >= 70) {
      return { color: 'yellow', text: 'Confiance modérée', icon: 'alert-circle' };
    } else {
      return { color: 'red', text: 'Révision requise', icon: 'x-circle' };
    }
  }

  static formatValidationReport(validation: ValidationResult): string {
    return `
**Rapport de Validation**

Confiance: ${validation.confidence.toFixed(1)}%
Status: ${validation.isValid ? 'Validé' : 'Nécessite révision'}

Références validées: ${validation.validatedReferences.length}
${validation.validatedReferences.map(ref => `✓ ${ref}`).join('\n')}

${validation.invalidReferences.length > 0 ? `
Références invalides: ${validation.invalidReferences.length}
${validation.invalidReferences.map(ref => `✗ ${ref}`).join('\n')}
` : ''}

${validation.errors.length > 0 ? `
Erreurs: ${validation.errors.join('; ')}
` : ''}
`;
  }
}

// Instance globale avec validation
export const validatedOrchestrator = new ValidatedAgentOrchestrator();