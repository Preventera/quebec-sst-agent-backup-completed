// src/pages/HITLTest.tsx
// Page de test temporaire pour valider le composant HITL
import React from 'react';
import { HITLAdvanced } from '@/components/security/HITLAdvanced';

const HITLTest: React.FC = () => {
  // Données de test pour simuler une action critique
  const testAction = {
    id: 'test-001',
    agentName: 'DocuGen',
    actionType: 'Génération Programme de Prévention',
    description: 'Générer un programme de prévention LMRSST conforme',
    recommendation: 'Créer un document Programme de prévention (LMRSST) conforme aux exigences légales pour une entreprise de 25 employés du secteur manufacturier.',
    riskAssessment: 'Impact organisationnel ÉLEVÉ - Document légalement contraignant qui engage la responsabilité de l\'employeur selon LMRSST.',
    legalCompliance: 'LMRSST Art. 59 - Programme de prévention obligatoire pour entreprises +20 travailleurs. Document doit être approuvé par le comité SST.',
    decisionGates: {
      stakes: 'HIGH' as const,
      reversibility: 'LOW' as const,
      timeNeeded: 'STANDARD' as const,
      expertise: 'SST_SPECIALIST' as const,
      lmrsstArticle: '59'
    },
    requiredApprovals: 1,
    estimatedImpact: 'Création d\'obligations légales contraignantes pour l\'organisation',
    sources: ['LMRSST Art. 59', 'CNESST Guide PP-001', 'Jurisprudence 2024']
  };

  // Utilisateur de test
  const testUser = {
    id: 'user-001',
    name: 'Marie Tremblay',
    role: 'supervisor' as const, // Peut approuver SST_SPECIALIST
    certifications: ['CNESST-Formation', 'Premier-Secours']
  };

  const handleApprove = (action: any, justification: string) => {
    console.log('✅ ACTION APPROUVÉE');
    console.log('Action:', action.id);
    console.log('Justification:', justification);
    alert(`✅ Action approuvée!\n\nAction: ${action.actionType}\nJustification: ${justification}`);
  };

  const handleReject = (action: any, reason: string) => {
    console.log('❌ ACTION REJETÉE');
    console.log('Action:', action.id);
    console.log('Raison:', reason);
    alert(`❌ Action rejetée!\n\nAction: ${action.actionType}\nRaison: ${reason}`);
  };

  const handleEscalate = (action: any, to: string) => {
    console.log('⬆️ ACTION ESCALADÉE');
    console.log('Action:', action.id);
    console.log('Escaladée vers:', to);
    alert(`⬆️ Action escaladée!\n\nAction: ${action.actionType}\nVers: ${to}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test HITL Advanced
          </h1>
          <p className="text-gray-600">
            Page de test pour valider le composant Human-in-the-Loop
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Utilisateur de test :</strong> {testUser.name} ({testUser.role})
              <br />
              <strong>Certifications :</strong> {testUser.certifications.join(', ')}
            </p>
          </div>
        </div>

        <HITLAdvanced
          action={testAction}
          currentUser={testUser}
          onApprove={handleApprove}
          onReject={handleReject}
          onEscalate={handleEscalate}
        />

        <div className="mt-8 p-4 bg-gray-100 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Instructions de test :</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Vérifiez que tous les éléments s'affichent correctement</li>
            <li>• L'utilisateur "supervisor" peut approuver cette action "SST_SPECIALIST"</li>
            <li>• Essayez d'approuver avec une justification</li>
            <li>• Vérifiez que les alertes JavaScript fonctionnent</li>
            <li>• Inspectez la console pour voir les logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HITLTest;