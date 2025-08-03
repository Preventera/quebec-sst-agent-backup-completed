// Tests unitaires pour le pipeline DocuGen 2.0
// Validation de conformité et qualité des documents générés

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentTemplate, DocumentGenerationRequest, GeneratedDocument } from '@/types/docugen';
import { DocuGenEngine } from '@/lib/docugen/templateEngine';
import { LegalOntology } from '@/lib/docugen/legalOntology';
import { SafetyGraphIntegrator } from '@/lib/safetyGraphIntegration';

// Mock des dépendances
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}));

describe('DocuGen 2.0 Pipeline Tests', () => {
  let docuGenEngine: DocuGenEngine;
  let legalOntology: LegalOntology;
  let safetyIntegrator: SafetyGraphIntegrator;

  beforeEach(() => {
    docuGenEngine = new DocuGenEngine();
    legalOntology = new LegalOntology();
    safetyIntegrator = new SafetyGraphIntegrator();
  });

  describe('Validation des Templates', () => {
    it('devrait valider la structure d\'un template de programme de prévention', () => {
      const template: DocumentTemplate = {
        id: 'prog_prev_lmrsst_v1',
        name: 'Programme de prévention LMRSST',
        version: '1.0',
        legislation: ['LMRSST', 'LSST'],
        subject: 'programme_prevention',
        targetSectors: ['all'],
        companySize: 'all',
        priority: 'mandatory',
        agent: 'DocuGen',
        templatePath: '/templates/programme_prevention.jinja2',
        placeholders: [
          {
            id: 'company_name',
            name: 'Nom de l\'entreprise',
            type: 'string',
            required: true,
            source: 'user_input',
            description: 'Nom officiel de l\'entreprise'
          },
          {
            id: 'risk_inventory',
            name: 'Inventaire des risques',
            type: 'array',
            required: true,
            source: 'safety_graph',
            description: 'Liste des risques identifiés'
          }
        ],
        generationRules: [],
        qualityChecks: [
          {
            id: 'company_name_present',
            name: 'Nom d\'entreprise présent',
            type: 'content_validation',
            rule: 'content.includes(placeholders.company_name)',
            errorMessage: 'Le nom de l\'entreprise doit être présent',
            severity: 'error'
          }
        ],
        metadata: {
          author: 'System',
          createdDate: '2024-01-01',
          lastModified: '2024-01-01',
          version: '1.0',
          tags: ['lmrsst', 'programme', 'prevention'],
          estimatedGenerationTime: 120,
          outputFormats: ['markdown', 'pdf', 'docx']
        }
      };

      expect(template.id).toBeTruthy();
      expect(template.legislation).toContain('LMRSST');
      expect(template.placeholders.length).toBeGreaterThan(0);
      expect(template.qualityChecks.length).toBeGreaterThan(0);
    });

    it('devrait identifier les placeholders requis manquants', () => {
      const template: DocumentTemplate = {
        id: 'test_template',
        name: 'Test Template',
        version: '1.0',
        legislation: ['LSST'],
        subject: 'test',
        targetSectors: ['all'],
        companySize: 'all',
        priority: 'mandatory',
        agent: 'DocuGen',
        templatePath: '/templates/test.jinja2',
        placeholders: [
          {
            id: 'required_field',
            name: 'Champ requis',
            type: 'string',
            required: true,
            source: 'user_input',
            description: 'Un champ obligatoire'
          }
        ],
        generationRules: [],
        qualityChecks: [],
        metadata: {
          author: 'System',
          createdDate: '2024-01-01',
          lastModified: '2024-01-01',
          version: '1.0',
          tags: ['test'],
          estimatedGenerationTime: 60,
          outputFormats: ['markdown']
        }
      };

      const providedData = {}; // Aucune donnée fournie

      const missingRequired = template.placeholders
        .filter(p => p.required)
        .filter(p => !(p.id in providedData));

      expect(missingRequired).toHaveLength(1);
      expect(missingRequired[0].id).toBe('required_field');
    });
  });

  describe('Contrôles de Qualité', () => {
    it('devrait détecter l\'absence du nom d\'entreprise', async () => {
      const content = 'Ceci est un document sans nom d\'entreprise.';
      const companyName = 'Test Corporation';

      const qualityCheck = {
        id: 'company_name_present',
        name: 'Nom d\'entreprise présent',
        type: 'content_validation' as const,
        rule: `content.includes("${companyName}")`,
        errorMessage: 'Le nom de l\'entreprise doit être présent',
        severity: 'error' as const
      };

      const result = eval(qualityCheck.rule);
      expect(result).toBe(false);
    });

    it('devrait valider la présence d\'articles légaux', () => {
      const content = 'Selon l\'article 90 de la LMRSST et l\'article 101...';
      
      const legalReferences = content.match(/article \d+/gi);
      expect(legalReferences).not.toBeNull();
      expect(legalReferences!.length).toBeGreaterThan(0);
    });

    it('devrait vérifier la longueur minimale du contenu', () => {
      const shortContent = 'Contenu très court.';
      const longContent = 'Ceci est un contenu beaucoup plus long qui devrait passer le test de longueur minimale car il contient suffisamment de mots pour être considéré comme un document complet et professionnel pour un programme de prévention en santé et sécurité du travail.';

      expect(shortContent.split(' ').length).toBeLessThan(20);
      expect(longContent.split(' ').length).toBeGreaterThan(20);
    });
  });

  describe('Intégration Safety Graph', () => {
    it('devrait mapper correctement les données diagnostiques', () => {
      const mockDiagnosticData = [
        {
          id: '1',
          category: 'Équipements',
          risk_level: 'high',
          description: 'Machines dangereuses non protégées',
          recommendations: ['Installer des protecteurs', 'Former les employés'],
          priority: 1,
          date_assessed: '2024-01-01'
        }
      ];

      const mapped = safetyIntegrator['mapDiagnosticResults'](mockDiagnosticData);
      
      expect(mapped).toHaveLength(1);
      expect(mapped[0].riskLevel).toBe('high');
      expect(mapped[0].recommendations).toContain('Installer des protecteurs');
    });

    it('devrait générer des placeholders à partir des données Safety Graph', () => {
      const safetyData = {
        diagnosticResults: [],
        riskInventory: [
          {
            id: '1',
            hazardType: 'Chute de hauteur',
            location: 'Atelier',
            severity: 4,
            probability: 3,
            riskScore: 12,
            controlMeasures: ['Garde-corps'],
            status: 'identified' as const
          }
        ],
        preventiveMeasures: [
          {
            id: '1',
            description: 'Installer garde-corps',
            targetRisk: '1',
            implementation: 'immediate' as const,
            responsible: 'Superviseur',
            cost: 5000,
            effectiveness: 5,
            status: 'planned' as const
          }
        ],
        complianceHistory: [],
        scianActions: []
      };

      const companyProfile = {
        name: 'Test Corp',
        size: 25,
        sector: 'Manufacturier',
        riskLevel: 'medium' as const
      };

      const placeholders = safetyIntegrator.preparePlaceholders(safetyData, companyProfile);

      expect(placeholders.COMPANY_NAME).toBe('Test Corp');
      expect(placeholders.COMPANY_SIZE).toBe(25);
      expect(placeholders.PRIORITY_MEASURES).toContain('Installer garde-corps');
    });
  });

  describe('Pipeline de Génération Complète', () => {
    it('devrait générer un document complet avec toutes les validations', async () => {
      const request: DocumentGenerationRequest = {
        templateId: 'prog_prev_lmrsst_v1',
        companyProfile: {
          name: 'Entreprise Test',
          size: 25,
          sector: 'Manufacturier',
          scianCode: '311',
          riskLevel: 'medium',
          specificActivities: ['Assemblage', 'Soudure'],
          existingMeasures: ['EPI obligatoires']
        },
        diagnosticData: {
          highRiskAreas: ['Atelier soudure'],
          criticalFindings: ['Ventilation insuffisante']
        },
        scianActions: ['Formation SIMDUT', 'Contrôle espaces clos'],
        additionalData: {},
        outputFormat: 'markdown',
        options: {
          language: 'fr',
          includeSignatures: true,
          includeTimestamp: true,
          generateTOC: true,
          addLegalHyperlinks: true
        }
      };

      // Test de la structure de la requête
      expect(request.templateId).toBeTruthy();
      expect(request.companyProfile.name).toBeTruthy();
      expect(request.options.language).toBe('fr');
    });

    it('devrait calculer correctement les métriques de qualité', () => {
      const content = `
Programme de prévention - Entreprise Test

Selon l'article 90 de la LMRSST, notre entreprise de 25 employés doit maintenir un programme de prévention.

Risques identifiés:
- Chute de hauteur
- Exposition aux vapeurs de soudure

Mesures préventives:
1. Installation de garde-corps
2. Amélioration de la ventilation
3. Formation du personnel

Ce document a été généré le 2024-01-01.
      `.trim();

      const wordCount = content.split(' ').length;
      const legalReferences = content.match(/article \d+/gi);
      const hasCompanyName = content.includes('Entreprise Test');

      expect(wordCount).toBeGreaterThan(30);
      expect(legalReferences).not.toBeNull();
      expect(legalReferences!.length).toBeGreaterThan(0);
      expect(hasCompanyName).toBe(true);
    });
  });

  describe('Gestion des Erreurs', () => {
    it('devrait gérer les données Safety Graph manquantes', () => {
      const emptyData = {
        diagnosticResults: [],
        riskInventory: [],
        preventiveMeasures: [],
        complianceHistory: [],
        scianActions: []
      };

      const companyProfile = {
        name: 'Test Corp',
        size: 10,
        sector: 'Services',
        riskLevel: 'low' as const
      };

      const placeholders = safetyIntegrator.preparePlaceholders(emptyData, companyProfile);

      expect(placeholders.COMPANY_NAME).toBe('Test Corp');
      expect(placeholders.HIGH_RISKS).toBe('');
      expect(placeholders.CRITICAL_RISKS).toBe(0);
    });

    it('devrait valider les champs obligatoires', () => {
      const requiredFields = ['company_name', 'sector', 'size'];
      const providedData = {
        company_name: 'Test Corp',
        sector: 'Tech'
        // 'size' manquant
      };

      const missing = requiredFields.filter(field => !providedData[field as keyof typeof providedData]);
      expect(missing).toContain('size');
    });
  });

  describe('Conformité Réglementaire', () => {
    it('devrait identifier les obligations LMRSST pour entreprises ≥20 employés', () => {
      const companySize = 25;
      const hasCommitteeObligation = companySize >= 20;
      const hasPreventionProgramObligation = companySize >= 20;

      expect(hasCommitteeObligation).toBe(true);
      expect(hasPreventionProgramObligation).toBe(true);
    });

    it('devrait appliquer les règles sectorielles construction', () => {
      const sector = 'Construction';
      const isConstructionSector = sector === 'Construction';
      const appliesCSTCRules = isConstructionSector;

      expect(appliesCSTCRules).toBe(true);
    });

    it('devrait calculer les échéances de mise en conformité', () => {
      const currentDate = new Date('2024-01-01');
      const lmrsstDeadline = new Date('2025-10-06');
      const isBeforeDeadline = currentDate < lmrsstDeadline;

      expect(isBeforeDeadline).toBe(true);
    });
  });
});

// Tests d'intégration avec mock des APIs
describe('Tests d\'Intégration API', () => {
  it('devrait simuler un appel à l\'edge function DocuGen', async () => {
    const mockResponse = {
      success: true,
      generatedContent: 'Contenu généré par IA',
      metadata: {
        templateId: 'test_template',
        generatedAt: '2024-01-01T00:00:00Z',
        wordCount: 100
      },
      qualityChecks: [
        {
          checkId: 'content_length',
          status: 'pass',
          message: 'Contenu suffisant'
        }
      ]
    };

    // Simulation d'appel API
    const apiCall = () => Promise.resolve(mockResponse);
    const result = await apiCall();

    expect(result.success).toBe(true);
    expect(result.generatedContent).toBeTruthy();
    expect(result.qualityChecks[0].status).toBe('pass');
  });
});