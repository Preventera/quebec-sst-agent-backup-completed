// Moteur de templates DocuGen 2.0 - Pipeline de génération modulaire

import { 
  DocumentTemplate, 
  DocumentGenerationRequest, 
  GeneratedDocument, 
  PipelineExecution,
  PipelineStageResult,
  QualityResult,
  TraceabilityInfo,
  RuleContext,
  GenerationRule
} from '@/types/docugen';
import { getApplicableLaws, getRequiredSubjects, findRelatedArticles } from './legalOntology';
import { createHash } from 'crypto';

// === CATALOGUE DE TEMPLATES === //

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'prog_prev_LMRSST_v2',
    name: 'Programme de prévention (LMRSST)',
    version: '2.1',
    legislation: ['LMRSST', 'LSST'],
    subject: 'programme-prevention',
    targetSectors: ['tous'],
    companySize: 'large',
    priority: 'mandatory',
    agent: 'CoSS',
    templatePath: '/templates/programme_prevention.md.j2',
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
        id: 'company_address',
        name: 'Adresse de l\'établissement',
        type: 'string',
        required: true,
        source: 'user_input',
        description: 'Adresse complète du lieu de travail'
      },
      {
        id: 'company_size',
        name: 'Nombre d\'employés',
        type: 'number',
        required: true,
        source: 'user_input',
        validation: { minValue: 20 },
        description: 'Effectif total de l\'établissement'
      },
      {
        id: 'risk_inventory',
        name: 'Inventaire des risques',
        type: 'array',
        required: true,
        source: 'diagnostic_agent',
        description: 'Risques identifiés par l\'analyse'
      },
      {
        id: 'preventive_measures',
        name: 'Mesures préventives',
        type: 'array',
        required: true,
        source: 'safety_graph',
        description: 'Actions de prévention planifiées'
      },
      {
        id: 'applicable_articles',
        name: 'Articles de loi applicables',
        type: 'array',
        required: true,
        source: 'legal_db',
        description: 'Références légales automatiquement déterminées'
      },
      {
        id: 'committee_members',
        name: 'Membres du comité SST',
        type: 'array',
        required: true,
        source: 'user_input',
        description: 'Composition du comité paritaire'
      }
    ],
    generationRules: [
      {
        id: 'include_committee_section',
        condition: 'company_size >= 20',
        action: 'include_section',
        target: 'comite_sst',
        description: 'Inclure section comité pour >=20 employés'
      },
      {
        id: 'inject_lmrsst_articles',
        condition: 'legislation.includes("LMRSST")',
        action: 'inject_articles',
        target: 'legal_references',
        value: ['LMRSST_90', 'LMRSST_101'],
        description: 'Injecter articles LMRSST pertinents'
      }
    ],
    qualityChecks: [
      {
        id: 'check_company_name',
        name: 'Nom d\'entreprise présent',
        type: 'content_validation',
        rule: 'company_name != null && company_name.length > 0',
        errorMessage: 'Le nom de l\'entreprise est obligatoire',
        severity: 'error'
      },
      {
        id: 'check_article_90',
        name: 'Article 90 LMRSST cité',
        type: 'legal_compliance',
        rule: 'content.includes("Article 90")',
        errorMessage: 'L\'article 90 LMRSST doit être référencé',
        severity: 'error'
      },
      {
        id: 'check_risk_count',
        name: 'Nombre minimum de risques',
        type: 'completeness',
        rule: 'risk_inventory.length >= 3',
        errorMessage: 'Au moins 3 risques doivent être identifiés',
        severity: 'warning'
      }
    ],
    metadata: {
      author: 'Agent CoSS',
      createdDate: '2024-01-15',
      lastModified: '2024-12-03',
      version: '2.1',
      tags: ['LMRSST', 'programme', 'prévention', 'obligatoire'],
      estimatedGenerationTime: 120,
      outputFormats: ['markdown', 'pdf', 'docx', 'html']
    }
  },
  {
    id: 'plan_action_LMRSST_v1',
    name: 'Plan d\'action SST simplifié',
    version: '1.0',
    legislation: ['LMRSST'],
    subject: 'plan-action',
    targetSectors: ['tous'],
    companySize: 'small',
    priority: 'mandatory',
    agent: 'ALSS',
    templatePath: '/templates/plan_action.md.j2',
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
        id: 'company_size',
        name: 'Nombre d\'employés',
        type: 'number',
        required: true,
        source: 'user_input',
        validation: { maxValue: 19 },
        description: 'Effectif (moins de 20)'
      },
      {
        id: 'alss_name',
        name: 'Nom de l\'ALSS',
        type: 'string',
        required: true,
        source: 'user_input',
        description: 'Agent de liaison désigné'
      },
      {
        id: 'priority_actions',
        name: 'Actions prioritaires',
        type: 'array',
        required: true,
        source: 'scian_action',
        description: 'Actions SCIAN adaptées à la taille'
      }
    ],
    generationRules: [
      {
        id: 'limit_small_company',
        condition: 'company_size < 20',
        action: 'include_section',
        target: 'plan_action',
        description: 'Plan d\'action pour petites entreprises'
      }
    ],
    qualityChecks: [
      {
        id: 'check_alss_designation',
        name: 'ALSS désigné',
        type: 'content_validation',
        rule: 'alss_name != null && alss_name.length > 0',
        errorMessage: 'Un agent de liaison doit être désigné',
        severity: 'error'
      }
    ],
    metadata: {
      author: 'Agent ALSS',
      createdDate: '2024-06-01',
      lastModified: '2024-12-03',
      version: '1.0',
      tags: ['LMRSST', 'plan-action', 'PME', 'simplifié'],
      estimatedGenerationTime: 60,
      outputFormats: ['markdown', 'pdf', 'docx']
    }
  },
  {
    id: 'registre_incidents_v1',
    name: 'Registre des incidents et accidents',
    version: '1.2',
    legislation: ['LMRSST'],
    subject: 'registre-incidents',
    targetSectors: ['tous'],
    companySize: 'all',
    priority: 'mandatory',
    agent: 'Sentinelle',
    templatePath: '/templates/registre_incidents.md.j2',
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
        id: 'responsible_person',
        name: 'Responsable du registre',
        type: 'string',
        required: true,
        source: 'user_input',
        description: 'Personne chargée de la tenue du registre'
      }
    ],
    generationRules: [],
    qualityChecks: [
      {
        id: 'check_article_123',
        name: 'Article 123 LMRSST référencé',
        type: 'legal_compliance',
        rule: 'content.includes("Article 123")',
        errorMessage: 'L\'article 123 LMRSST doit être cité',
        severity: 'error'
      }
    ],
    metadata: {
      author: 'Agent Sentinelle',
      createdDate: '2024-03-01',
      lastModified: '2024-12-03',
      version: '1.2',
      tags: ['registre', 'incidents', 'accidents', 'obligatoire'],
      estimatedGenerationTime: 30,
      outputFormats: ['markdown', 'pdf', 'docx']
    }
  },
  {
    id: 'designation_alss_v1',
    name: 'Désignation d\'agent de liaison SST',
    version: '1.0',
    legislation: ['LMRSST'],
    subject: 'agent-liaison',
    targetSectors: ['tous'],
    companySize: 'small',
    priority: 'mandatory',
    agent: 'ALSS',
    templatePath: '/templates/designation_alss.md.j2',
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
        id: 'alss_name',
        name: 'Nom de l\'ALSS',
        type: 'string',
        required: true,
        source: 'user_input',
        description: 'Nom de la personne désignée'
      },
      {
        id: 'alss_position',
        name: 'Poste de l\'ALSS',
        type: 'string',
        required: true,
        source: 'user_input',
        description: 'Fonction dans l\'entreprise'
      }
    ],
    generationRules: [],
    qualityChecks: [
      {
        id: 'check_alss_info',
        name: 'Informations ALSS complètes',
        type: 'completeness',
        rule: 'alss_name.length > 0 && alss_position.length > 0',
        errorMessage: 'Nom et poste de l\'ALSS requis',
        severity: 'error'
      }
    ],
    metadata: {
      author: 'Agent ALSS',
      createdDate: '2024-09-01',
      lastModified: '2024-12-03',
      version: '1.0',
      tags: ['ALSS', 'désignation', 'petite-entreprise'],
      estimatedGenerationTime: 15,
      outputFormats: ['markdown', 'pdf']
    }
  }
];

// === MOTEUR DE GÉNÉRATION === //

export class DocuGenEngine {
  private templates: DocumentTemplate[];
  
  constructor() {
    this.templates = DOCUMENT_TEMPLATES;
  }

  async generateDocument(request: DocumentGenerationRequest): Promise<GeneratedDocument> {
    const execution = this.initializePipeline(request);
    
    try {
      // Stage 1: Data Collection & Validation
      const validationResult = await this.executeStage(execution, 'data_collection', async () => {
        return this.validateRequest(request);
      });

      // Stage 2: Template Selection
      const templateResult = await this.executeStage(execution, 'template_selection', async () => {
        return this.selectTemplate(request);
      });

      // Stage 3: Legal Context Mapping
      const legalResult = await this.executeStage(execution, 'validation_mapping', async () => {
        return this.mapLegalContext(request, templateResult.output);
      });

      // Stage 4: AI Content Generation
      const contentResult = await this.executeStage(execution, 'ai_filling', async () => {
        return this.generateContent(request, templateResult.output, legalResult.output);
      });

      // Stage 5: Quality Assurance
      const qualityResult = await this.executeStage(execution, 'quality_assurance', async () => {
        return this.performQualityChecks(contentResult.output, templateResult.output);
      });

      // Stage 6: Export & Signatures
      const exportResult = await this.executeStage(execution, 'compilation_export', async () => {
        return this.compileAndExport(contentResult.output, request.outputFormat);
      });

      // Stage 7: Traceability
      const traceResult = await this.executeStage(execution, 'signature_versioning', async () => {
        return this.generateTraceability(request, exportResult.output);
      });

      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime();

      return {
        id: execution.id,
        templateId: request.templateId,
        content: exportResult.output.content,
        format: request.outputFormat,
        metadata: exportResult.output.metadata,
        qualityResults: qualityResult.output,
        traceability: traceResult.output
      };

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private initializePipeline(request: DocumentGenerationRequest): PipelineExecution {
    return {
      id: this.generateId(),
      requestId: request.templateId + '_' + Date.now(),
      stages: [],
      status: 'running',
      startTime: new Date().toISOString()
    };
  }

  private async executeStage<T>(
    execution: PipelineExecution,
    stage: any,
    stageFunction: () => Promise<T>
  ): Promise<PipelineStageResult & { output: T }> {
    const stageResult: PipelineStageResult = {
      stage,
      status: 'running',
      startTime: new Date().toISOString(),
      logs: []
    };

    execution.stages.push(stageResult);

    try {
      const output = await stageFunction();
      stageResult.status = 'completed';
      stageResult.endTime = new Date().toISOString();
      stageResult.duration = new Date(stageResult.endTime).getTime() - 
                            new Date(stageResult.startTime!).getTime();
      stageResult.output = output;
      
      return { ...stageResult, output };
    } catch (error) {
      stageResult.status = 'failed';
      stageResult.endTime = new Date().toISOString();
      stageResult.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async validateRequest(request: DocumentGenerationRequest): Promise<any> {
    const template = this.templates.find(t => t.id === request.templateId);
    if (!template) {
      throw new Error(`Template ${request.templateId} not found`);
    }

    // Validate required placeholders
    for (const placeholder of template.placeholders) {
      if (placeholder.required) {
        const value = this.getPlaceholderValue(placeholder, request);
        if (value === null || value === undefined || value === '') {
          throw new Error(`Required placeholder ${placeholder.name} is missing`);
        }
      }
    }

    return { valid: true };
  }

  private async selectTemplate(request: DocumentGenerationRequest): Promise<DocumentTemplate> {
    const template = this.templates.find(t => t.id === request.templateId);
    if (!template) {
      throw new Error(`Template ${request.templateId} not found`);
    }

    // Verify template applicability
    const profile = request.companyProfile;
    
    // Check company size compatibility
    if (template.companySize === 'small' && profile.size >= 20) {
      throw new Error('Template for small companies not applicable to companies with 20+ employees');
    }
    if (template.companySize === 'large' && profile.size < 20) {
      throw new Error('Template for large companies not applicable to companies with <20 employees');
    }

    // Check sector compatibility
    if (!template.targetSectors.includes('tous') && !template.targetSectors.includes(profile.sector)) {
      throw new Error(`Template not applicable to sector: ${profile.sector}`);
    }

    return template;
  }

  private async mapLegalContext(request: DocumentGenerationRequest, template: DocumentTemplate): Promise<any> {
    const profile = request.companyProfile;
    
    // Get applicable laws and articles
    const applicableLaws = getApplicableLaws(profile.size, profile.sector);
    const requiredSubjects = getRequiredSubjects(profile.size, profile.sector, profile.riskLevel);
    const relatedArticles = findRelatedArticles(template.subject);

    return {
      applicableLaws,
      requiredSubjects,
      relatedArticles,
      complianceMatrix: this.buildComplianceMatrix(template, applicableLaws)
    };
  }

  private async generateContent(
    request: DocumentGenerationRequest, 
    template: DocumentTemplate, 
    legalContext: any
  ): Promise<any> {
    // Collect data for all placeholders
    const templateData: Record<string, any> = {};
    
    for (const placeholder of template.placeholders) {
      templateData[placeholder.id] = this.getPlaceholderValue(placeholder, request, legalContext);
    }

    // Apply generation rules
    const processedData = this.applyGenerationRules(template.generationRules, templateData, request);

    // Generate content using template
    const content = await this.renderTemplate(template, processedData);

    return {
      content,
      templateData: processedData,
      metadata: {
        title: template.name,
        company: request.companyProfile.name,
        generatedDate: new Date().toISOString(),
        generatedBy: template.agent,
        version: template.version,
        language: request.options.language,
        approvalStatus: 'draft'
      }
    };
  }

  private async performQualityChecks(contentResult: any, template: DocumentTemplate): Promise<QualityResult[]> {
    const results: QualityResult[] = [];

    for (const check of template.qualityChecks) {
      const result = this.executeQualityCheck(check, contentResult, template);
      results.push(result);
    }

    return results;
  }

  private async compileAndExport(contentResult: any, format: string): Promise<any> {
    // Simple compilation for now - in real implementation would use Pandoc or similar
    let compiledContent = contentResult.content;

    // Add headers, footers, TOC based on format
    if (format === 'pdf' || format === 'html') {
      compiledContent = this.addDocumentStructure(compiledContent, contentResult.metadata);
    }

    return {
      content: compiledContent,
      metadata: contentResult.metadata,
      format
    };
  }

  private async generateTraceability(request: DocumentGenerationRequest, exportResult: any): Promise<TraceabilityInfo> {
    const contentHash = this.generateHash(exportResult.content);
    const sourceDataHash = this.generateHash(JSON.stringify(request));

    return {
      documentHash: contentHash,
      generationTimestamp: new Date().toISOString(),
      sourceDataHash,
      templatesUsed: [request.templateId],
      agentsInvolved: ['DocuGen'],
      legalFrameworkVersions: {
        'LMRSST': '2021',
        'LSST': 'S-2.1'
      },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'document_generated',
          user: 'system',
          details: { templateId: request.templateId }
        }
      ]
    };
  }

  // Helper methods

  private getPlaceholderValue(placeholder: any, request: DocumentGenerationRequest, legalContext?: any): any {
    switch (placeholder.source) {
      case 'user_input':
        return this.extractFromProfile(placeholder.id, request.companyProfile, request.additionalData);
      case 'diagnostic_agent':
        return request.diagnosticData || [];
      case 'safety_graph':
        return request.scianActions || [];
      case 'legal_db':
        return legalContext?.relatedArticles || [];
      default:
        return placeholder.defaultValue;
    }
  }

  private extractFromProfile(placeholderId: string, profile: any, additionalData?: any): any {
    const mapping: Record<string, string> = {
      'company_name': 'name',
      'company_size': 'size',
      'company_address': 'address',
      'alss_name': 'alss_name',
      'alss_position': 'alss_position',
      'responsible_person': 'responsible_person'
    };

    const profileKey = mapping[placeholderId];
    if (profileKey && profile[profileKey] !== undefined) {
      return profile[profileKey];
    }

    return additionalData?.[placeholderId];
  }

  private applyGenerationRules(rules: GenerationRule[], data: any, request: DocumentGenerationRequest): any {
    const processedData = { ...data };
    
    for (const rule of rules) {
      if (this.evaluateRuleCondition(rule.condition, data, request)) {
        this.applyRuleAction(rule, processedData);
      }
    }

    return processedData;
  }

  private evaluateRuleCondition(condition: string, data: any, request: DocumentGenerationRequest): boolean {
    // Simple condition evaluation - in real implementation would use JSONata
    try {
      // Replace variables in condition
      let evaluatedCondition = condition;
      evaluatedCondition = evaluatedCondition.replace('company_size', data.company_size?.toString() || '0');
      
      // Simple evaluation for basic conditions
      if (evaluatedCondition.includes('>=')) {
        const [left, right] = evaluatedCondition.split('>=').map(s => s.trim());
        return parseInt(left) >= parseInt(right);
      }
      
      return true;
    } catch {
      return false;
    }
  }

  private applyRuleAction(rule: GenerationRule, data: any): void {
    switch (rule.action) {
      case 'include_section':
        data[`include_${rule.target}`] = true;
        break;
      case 'inject_articles':
        if (rule.value && Array.isArray(rule.value)) {
          data[rule.target] = rule.value;
        }
        break;
    }
  }

  private async renderTemplate(template: DocumentTemplate, data: any): Promise<string> {
    // Simple template rendering - in real implementation would use Jinja2 or similar
    let content = this.getBaseTemplate(template.subject);
    
    // Replace placeholders
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      const replacement = Array.isArray(value) ? value.join('\n- ') : String(value);
      content = content.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return content;
  }

  private getBaseTemplate(subject: string): string {
    // Base templates for each subject
    const templates: Record<string, string> = {
      'programme-prevention': `# PROGRAMME DE PRÉVENTION

**Entreprise:** {{company_name}}
**Adresse:** {{company_address}}
**Nombre d'employés:** {{company_size}}
**Date d'élaboration:** {{generated_date}}

## RÉFÉRENCES LÉGALES

{{applicable_articles}}

## 1. IDENTIFICATION DES RISQUES

{{risk_inventory}}

## 2. MESURES DE PRÉVENTION

{{preventive_measures}}

## 3. MÉCANISMES DE PARTICIPATION

{{include_comite_sst}}

**Approuvé par le comité SST le:** _____________________`,

      'plan-action': `# PLAN D'ACTION EN SANTÉ ET SÉCURITÉ

**Entreprise:** {{company_name}}
**Nombre d'employés:** {{company_size}}
**Agent de liaison:** {{alss_name}}

## ACTIONS PRIORITAIRES

{{priority_actions}}

**Signature de l'employeur:** _____________________
**Signature de l'ALSS:** _____________________`,

      'registre-incidents': `# REGISTRE DES INCIDENTS ET ACCIDENTS

**Entreprise:** {{company_name}}
**Responsable:** {{responsible_person}}

Conforme à l'article 123 de la LMRSST.

| Date | Incident | Action prise |
|------|----------|--------------|
|      |          |              |`,

      'agent-liaison': `# DÉSIGNATION D'AGENT DE LIAISON SST

**Entreprise:** {{company_name}}
**Agent désigné:** {{alss_name}}
**Poste:** {{alss_position}}

Conforme à l'article 101 de la LMRSST.`
    };

    return templates[subject] || '# Document SST\n\n{{company_name}}';
  }

  private executeQualityCheck(check: any, contentResult: any, template: DocumentTemplate): QualityResult {
    try {
      const passed = this.evaluateQualityRule(check.rule, contentResult, template);
      return {
        checkId: check.id,
        checkName: check.name,
        status: passed ? 'pass' : 'fail',
        message: passed ? 'Check passed' : check.errorMessage
      };
    } catch (error) {
      return {
        checkId: check.id,
        checkName: check.name,
        status: 'warning',
        message: `Check error: ${error}`
      };
    }
  }

  private evaluateQualityRule(rule: string, contentResult: any, template: DocumentTemplate): boolean {
    // Simple rule evaluation
    if (rule.includes('content.includes')) {
      const match = rule.match(/content\.includes\("([^"]+)"\)/);
      if (match) {
        return contentResult.content.includes(match[1]);
      }
    }

    if (rule.includes('!= null')) {
      const field = rule.split(' ')[0];
      return contentResult.templateData[field] != null;
    }

    return true;
  }

  private buildComplianceMatrix(template: DocumentTemplate, applicableLaws: any[]): any {
    return {
      templateRequirements: template.legislation,
      applicableLaws: applicableLaws.map(law => law.id),
      coverage: template.legislation.every(req => 
        applicableLaws.some(law => law.id.startsWith(req))
      )
    };
  }

  private addDocumentStructure(content: string, metadata: any): string {
    const header = `---
title: ${metadata.title}
company: ${metadata.company}
generated: ${metadata.generatedDate}
version: ${metadata.version}
---

`;
    return header + content;
  }

  private generateHash(content: string): string {
    // Simple hash generation - in Node.js would use crypto
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private generateId(): string {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Public methods for template management

  getTemplatesByCompanyProfile(size: number, sector: string): DocumentTemplate[] {
    return this.templates.filter(template => {
      // Check size compatibility
      if (template.companySize === 'small' && size >= 20) return false;
      if (template.companySize === 'large' && size < 20) return false;

      // Check sector compatibility
      if (!template.targetSectors.includes('tous') && !template.targetSectors.includes(sector)) {
        return false;
      }

      return true;
    });
  }

  getTemplateById(id: string): DocumentTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }
}

// Export singleton instance
export const docuGenEngine = new DocuGenEngine();