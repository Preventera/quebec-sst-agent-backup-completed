// Intégration Safety Graph pour DocuGen 2.0
// Injection automatique des données diagnostiques et d'analyse de risques

import { supabase } from "@/integrations/supabase/client";

export interface SafetyGraphData {
  diagnosticResults: DiagnosticResult[];
  riskInventory: RiskItem[];
  preventiveMeasures: PreventiveMeasure[];
  complianceHistory: ComplianceRecord[];
  scianActions: ScianAction[];
}

export interface DiagnosticResult {
  id: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
  priority: number;
  dateAssessed: string;
}

export interface RiskItem {
  id: string;
  hazardType: string;
  location: string;
  severity: number;
  probability: number;
  riskScore: number;
  controlMeasures: string[];
  status: 'identified' | 'controlled' | 'mitigated' | 'eliminated';
}

export interface PreventiveMeasure {
  id: string;
  description: string;
  targetRisk: string;
  implementation: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  responsible: string;
  cost: number;
  effectiveness: number;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
}

export interface ComplianceRecord {
  date: string;
  type: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  notes?: string;
  corrective_actions?: string[];
}

export interface ScianAction {
  id: string;
  scianCode: string;
  description: string;
  mandatory: boolean;
  deadline?: string;
  implemented: boolean;
  evidence?: string[];
}

export class SafetyGraphIntegrator {
  
  /**
   * Récupère toutes les données du Safety Graph pour une entreprise
   */
  async getSafetyGraphData(companyId: string): Promise<SafetyGraphData> {
    try {
      console.log('Fetching Safety Graph data for company:', companyId);
      
      // Pour l'instant, on simule les données en attendant que les types Supabase soient mis à jour
      // Après régénération des types, on utilisera les vraies requêtes
      
      // Simulation des données diagnostiques
      const mockDiagnosticData = [
        {
          id: '1',
          company_id: companyId,
          category: 'Équipements',
          risk_level: 'high',
          description: 'Machines dangereuses non protégées',
          recommendations: ['Installer des protecteurs', 'Former les employés'],
          priority: 1,
          date_assessed: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockRiskData = [
        {
          id: '1',
          company_id: companyId,
          hazard_type: 'Chute de hauteur',
          location: 'Atelier',
          severity: 4,
          probability: 3,
          risk_score: 12,
          control_measures: ['Garde-corps'],
          status: 'identified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockMeasuresData = [
        {
          id: '1',
          company_id: companyId,
          description: 'Installer garde-corps',
          target_risk: '1',
          implementation: 'immediate',
          responsible: 'Superviseur',
          cost: 5000,
          effectiveness: 5,
          priority: 1,
          status: 'planned',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockComplianceData = [
        {
          id: '1',
          company_id: companyId,
          date: new Date().toISOString(),
          type: 'Évaluation générale',
          status: 'partial',
          notes: 'Améliorations nécessaires',
          corrective_actions: ['Formation du personnel'],
          created_at: new Date().toISOString()
        }
      ];

      const mockScianData = [
        {
          id: '1',
          company_id: companyId,
          scian_code: '311',
          description: 'Formation SIMDUT obligatoire',
          mandatory: true,
          deadline: null,
          implemented: false,
          evidence: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return {
        diagnosticResults: this.mapDiagnosticResults(mockDiagnosticData),
        riskInventory: this.mapRiskInventory(mockRiskData),
        preventiveMeasures: this.mapPreventiveMeasures(mockMeasuresData),
        complianceHistory: this.mapComplianceHistory(mockComplianceData),
        scianActions: this.mapScianActions(mockScianData)
      };

    } catch (error) {
      console.error('Error in getSafetyGraphData:', error);
      throw new Error('Failed to fetch Safety Graph data');
    }
  }

  /**
   * Prépare les placeholders pour le template à partir des données Safety Graph
   */
  preparePlaceholders(safetyData: SafetyGraphData, companyProfile: any): Record<string, any> {
    const placeholders: Record<string, any> = {};

    // Informations de base de l'entreprise
    placeholders.COMPANY_NAME = companyProfile.name;
    placeholders.COMPANY_SIZE = companyProfile.size;
    placeholders.COMPANY_SECTOR = companyProfile.sector;
    placeholders.RISK_LEVEL = companyProfile.riskLevel;

    // Inventaire des risques
    placeholders.HIGH_RISKS = safetyData.riskInventory
      .filter(risk => risk.riskScore >= 15)
      .map(risk => `${risk.hazardType} (${risk.location})`)
      .join(', ');

    placeholders.CRITICAL_RISKS = safetyData.riskInventory
      .filter(risk => risk.riskScore >= 20)
      .length;

    // Mesures préventives prioritaires
    placeholders.PRIORITY_MEASURES = safetyData.preventiveMeasures
      .filter(measure => measure.implementation === 'immediate')
      .map(measure => measure.description)
      .slice(0, 5);

    // Actions SCIAN obligatoires
    placeholders.MANDATORY_SCIAN_ACTIONS = safetyData.scianActions
      .filter(action => action.mandatory && !action.implemented)
      .map(action => action.description);

    // Statut de conformité récent
    const recentCompliance = safetyData.complianceHistory[0];
    placeholders.LAST_COMPLIANCE_STATUS = recentCompliance?.status || 'unknown';
    placeholders.LAST_COMPLIANCE_DATE = recentCompliance?.date || 'Non disponible';

    // Recommandations du diagnostic
    placeholders.TOP_RECOMMENDATIONS = safetyData.diagnosticResults
      .filter(result => result.riskLevel === 'high' || result.riskLevel === 'critical')
      .flatMap(result => result.recommendations)
      .slice(0, 10);

    // Générer tableau des risques pour inclusion dans le document
    placeholders.RISK_TABLE = this.generateRiskTable(safetyData.riskInventory);

    // Générer plan d'action pour inclusion dans le document
    placeholders.ACTION_PLAN = this.generateActionPlan(safetyData.preventiveMeasures);

    return placeholders;
  }

  /**
   * Génère un tableau HTML des risques pour inclusion dans le document
   */
  private generateRiskTable(risks: RiskItem[]): string {
    if (risks.length === 0) return 'Aucun risque identifié.';

    let table = `
<table border="1" style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f5f5f5;">
      <th style="padding: 8px;">Type de danger</th>
      <th style="padding: 8px;">Localisation</th>
      <th style="padding: 8px;">Score de risque</th>
      <th style="padding: 8px;">Statut</th>
    </tr>
  </thead>
  <tbody>`;

    risks.slice(0, 10).forEach(risk => {
      table += `
    <tr>
      <td style="padding: 8px;">${risk.hazardType}</td>
      <td style="padding: 8px;">${risk.location}</td>
      <td style="padding: 8px; text-align: center;">${risk.riskScore}</td>
      <td style="padding: 8px;">${this.translateStatus(risk.status)}</td>
    </tr>`;
    });

    table += `
  </tbody>
</table>`;

    return table;
  }

  /**
   * Génère un plan d'action pour inclusion dans le document
   */
  private generateActionPlan(measures: PreventiveMeasure[]): string {
    if (measures.length === 0) return 'Aucune mesure préventive définie.';

    let plan = `
<ol>`;

    measures
      .filter(measure => measure.status !== 'completed')
      .slice(0, 15)
      .forEach(measure => {
        plan += `
  <li>
    <strong>${measure.description}</strong><br>
    Responsable: ${measure.responsible}<br>
    Délai: ${this.translateImplementation(measure.implementation)}<br>
    Statut: ${this.translateMeasureStatus(measure.status)}
  </li>`;
      });

    plan += `
</ol>`;

    return plan;
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'identified': 'Identifié',
      'controlled': 'Contrôlé',
      'mitigated': 'Atténué',
      'eliminated': 'Éliminé'
    };
    return statusMap[status] || status;
  }

  private translateImplementation(implementation: string): string {
    const implMap: Record<string, string> = {
      'immediate': 'Immédiat',
      'short_term': 'Court terme (1-3 mois)',
      'medium_term': 'Moyen terme (3-12 mois)',
      'long_term': 'Long terme (>12 mois)'
    };
    return implMap[implementation] || implementation;
  }

  private translateMeasureStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'planned': 'Planifié',
      'in_progress': 'En cours',
      'completed': 'Complété',
      'delayed': 'Retardé'
    };
    return statusMap[status] || status;
  }

  // Méthodes de mapping des données de la base
  private mapDiagnosticResults(data: any[]): DiagnosticResult[] {
    return data.map(item => ({
      id: item.id,
      category: item.category || 'Général',
      riskLevel: item.risk_level || 'medium',
      description: item.description || '',
      recommendations: item.recommendations || [],
      priority: item.priority || 1,
      dateAssessed: item.date_assessed || new Date().toISOString()
    }));
  }

  private mapRiskInventory(data: any[]): RiskItem[] {
    return data.map(item => ({
      id: item.id,
      hazardType: item.hazard_type || 'Non spécifié',
      location: item.location || 'Non spécifié',
      severity: item.severity || 1,
      probability: item.probability || 1,
      riskScore: item.risk_score || 1,
      controlMeasures: item.control_measures || [],
      status: item.status || 'identified'
    }));
  }

  private mapPreventiveMeasures(data: any[]): PreventiveMeasure[] {
    return data.map(item => ({
      id: item.id,
      description: item.description || '',
      targetRisk: item.target_risk || '',
      implementation: item.implementation || 'short_term',
      responsible: item.responsible || 'À déterminer',
      cost: item.cost || 0,
      effectiveness: item.effectiveness || 1,
      status: item.status || 'planned'
    }));
  }

  private mapComplianceHistory(data: any[]): ComplianceRecord[] {
    return data.map(item => ({
      date: item.date || new Date().toISOString(),
      type: item.type || 'Évaluation générale',
      status: item.status || 'partial',
      notes: item.notes,
      corrective_actions: item.corrective_actions
    }));
  }

  private mapScianActions(data: any[]): ScianAction[] {
    return data.map(item => ({
      id: item.id,
      scianCode: item.scian_code || '',
      description: item.description || '',
      mandatory: item.mandatory || false,
      deadline: item.deadline,
      implemented: item.implemented || false,
      evidence: item.evidence || []
    }));
  }
}

// Instance singleton
export const safetyGraphIntegrator = new SafetyGraphIntegrator();