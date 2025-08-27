// src/components/security/HITLAdvanced.tsx
// Framework HITL Avancé selon Bannerman pour AgenticSST Québec™
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Clock, User, Shield, 
  Eye, FileCheck, Timer, Brain, Scale 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// Types pour le framework HITL avancé
interface CriticalDecisionGates {
  stakes: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reversibility: 'HIGH' | 'MEDIUM' | 'LOW';
  timeNeeded: 'IMMEDIATE' | 'STANDARD' | 'EXTENDED';
  expertise: 'GENERAL_USER' | 'SST_SPECIALIST' | 'DOMAIN_EXPERT' | 'REGULATORY_AUTHORITY';
  lmrsstArticle?: string;
}

interface HITLAction {
  id: string;
  agentName: string;
  actionType: string;
  description: string;
  recommendation: string;
  riskAssessment: string;
  legalCompliance: string;
  decisionGates: CriticalDecisionGates;
  requiredApprovals: number;
  estimatedImpact: string;
  sources: string[];
}

interface HITLAdvancedProps {
  action: HITLAction;
  onApprove: (action: HITLAction, justification: string) => void;
  onReject: (action: HITLAction, reason: string) => void;
  onEscalate: (action: HITLAction, to: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: 'employee' | 'supervisor' | 'expert' | 'authority';
    certifications: string[];
  };
}

// Composant Circuit Breaker pour décisions critiques
const CircuitBreakerProtocol: React.FC<{
  gates: CriticalDecisionGates;
  onTimeExpired: () => void;
}> = ({ gates, onTimeExpired }) => {
  const [timeRemaining, setTimeRemaining] = useState(
    gates.timeNeeded === 'EXTENDED' ? 24 * 60 * 60 : // 24h
    gates.timeNeeded === 'STANDARD' ? 2 * 60 * 60 : // 2h
    30 * 60 // 30 min
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeExpired]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-amber-800">
        <Timer className="w-4 h-4" />
        <span className="text-sm font-medium">
          Temps d'analyse obligatoire : {formatTime(timeRemaining)}
        </span>
      </div>
      {gates.stakes === 'CRITICAL' && (
        <p className="text-xs text-amber-700 mt-1">
          ⚠️ Décision irréversible - Validation expert requise selon LMRSST Art. {gates.lmrsstArticle || '90'}
        </p>
      )}
    </div>
  );
};

// Évaluation du niveau d'autorité requis
const AuthorityLevelIndicator: React.FC<{
  required: CriticalDecisionGates['expertise'];
  current: HITLAdvancedProps['currentUser']['role'];
  certifications: string[];
}> = ({ required, current, certifications }) => {
  const canApprove = (
    (required === 'GENERAL_USER') ||
    (required === 'SST_SPECIALIST' && ['supervisor', 'expert', 'authority'].includes(current)) ||
    (required === 'DOMAIN_EXPERT' && ['expert', 'authority'].includes(current)) ||
    (required === 'REGULATORY_AUTHORITY' && current === 'authority')
  );

  return (
    <div className={`rounded-lg p-3 mb-4 ${
      canApprove ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        <Scale className={`w-4 h-4 ${canApprove ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`text-sm font-medium ${
          canApprove ? 'text-green-800' : 'text-red-800'
        }`}>
          Niveau d'autorité : {required.replace('_', ' ')}
        </span>
      </div>
      {!canApprove && (
        <p className="text-xs text-red-700 mt-1">
          ⚠️ Votre niveau d'autorisation ({current}) est insuffisant pour cette décision
        </p>
      )}
    </div>
  );
};

export const HITLAdvanced: React.FC<HITLAdvancedProps> = ({ 
  action, onApprove, onReject, onEscalate, currentUser 
}) => {
  const [justification, setJustification] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCircuitBreaker, setShowCircuitBreaker] = useState(
    action.decisionGates.stakes === 'CRITICAL'
  );
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [collaborativeInput, setCollaborativeInput] = useState('');

  const canApprove = (
    (action.decisionGates.expertise === 'GENERAL_USER') ||
    (action.decisionGates.expertise === 'SST_SPECIALIST' && 
     ['supervisor', 'expert', 'authority'].includes(currentUser.role)) ||
    (action.decisionGates.expertise === 'DOMAIN_EXPERT' && 
     ['expert', 'authority'].includes(currentUser.role)) ||
    (action.decisionGates.expertise === 'REGULATORY_AUTHORITY' && 
     currentUser.role === 'authority')
  );

  const getStakesColor = (stakes: string) => {
    switch (stakes) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApprove = () => {
    if (!canApprove) {
      onEscalate(action, action.decisionGates.expertise);
      return;
    }
    onApprove(action, justification);
  };

  const handleReject = () => {
    onReject(action, rejectionReason);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Brain className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Validation HITL Requise</CardTitle>
              <p className="text-sm text-gray-600">
                {action.agentName} • {action.actionType}
              </p>
            </div>
          </div>
          <Badge className={`${getStakesColor(action.decisionGates.stakes)}`}>
            {action.decisionGates.stakes}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Circuit Breaker pour décisions critiques */}
        {showCircuitBreaker && (
          <CircuitBreakerProtocol 
            gates={action.decisionGates}
            onTimeExpired={() => setAnalysisComplete(true)}
          />
        )}

        {/* Indicateur d'autorité */}
        <AuthorityLevelIndicator
          required={action.decisionGates.expertise}
          current={currentUser.role}
          certifications={currentUser.certifications}
        />

        {/* Recommandation de l'agent */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">Recommandation de l'Agent</h4>
              <p className="text-sm text-blue-800 mb-3">{action.recommendation}</p>
              <div className="text-xs text-blue-600">
                <strong>Impact estimé :</strong> {action.estimatedImpact}
              </div>
            </div>
          </div>
        </div>

        {/* Évaluation des risques et conformité */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h5 className="font-medium text-orange-900 text-sm">Évaluation des Risques</h5>
            </div>
            <p className="text-xs text-orange-800">{action.riskAssessment}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h5 className="font-medium text-purple-900 text-sm">Conformité Légale</h5>
            </div>
            <p className="text-xs text-purple-800">{action.legalCompliance}</p>
          </div>
        </div>

        {/* Intelligence collaborative */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-600" />
            <h5 className="font-medium text-gray-900 text-sm">Intelligence Collaborative</h5>
          </div>
          <Textarea
            placeholder="Ajoutez votre contexte terrain, expérience similaire, ou considérations spécifiques..."
            value={collaborativeInput}
            onChange={(e) => setCollaborativeInput(e.target.value)}
            className="text-sm"
            rows={3}
          />
        </div>

        {/* Sources et références */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-4 h-4 text-gray-600" />
            <h5 className="font-medium text-gray-900 text-sm">Sources consultées</h5>
          </div>
          <div className="flex flex-wrap gap-1">
            {action.sources.map((source, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        </div>

        {/* Justification pour approbation */}
        {canApprove && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Justification de votre décision (obligatoire pour audit)
            </label>
            <Textarea
              placeholder="Expliquez les raisons de votre approbation/rejet..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="text-sm"
              rows={3}
            />
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 border-t">
          {canApprove ? (
            <>
              <Button
                onClick={handleApprove}
                disabled={!justification.trim() || (showCircuitBreaker && !analysisComplete)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Approuver & Exécuter
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onEscalate(action, action.decisionGates.expertise)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <AlertTriangle className="w-4 h-4" />
              Escalader à {action.decisionGates.expertise.replace('_', ' ')}
            </Button>
          )}
          
          <Button variant="outline" onClick={() => window.history.back()}>
            Annuler
          </Button>
        </div>

        {/* Informations de traçabilité */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3" />
            <span className="font-medium">Audit Trail</span>
          </div>
          <p>
            Cette décision sera enregistrée avec votre identité ({currentUser.name}) 
            et horodatage pour conformité LMRSST et traçabilité organisationnelle.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook pour utiliser le HITL avancé
export const useHITLAdvanced = () => {
  const [pendingActions, setPendingActions] = useState<HITLAction[]>([]);

  const submitForApproval = (action: HITLAction) => {
    setPendingActions(prev => [...prev, action]);
  };

  const approveAction = async (action: HITLAction, justification: string) => {
    // Enregistrer dans l'audit trail
    const auditEntry = {
      actionId: action.id,
      userId: 'current-user-id', // À remplacer par l'ID réel
      decision: 'approved',
      justification,
      timestamp: new Date().toISOString(),
      collaborativeInput: '', // Si applicable
    };

    // Envoyer à votre backend Supabase
    console.log('Audit entry:', auditEntry);
    
    // Retirer de la liste des actions en attente
    setPendingActions(prev => prev.filter(a => a.id !== action.id));
  };

  const rejectAction = async (action: HITLAction, reason: string) => {
    const auditEntry = {
      actionId: action.id,
      userId: 'current-user-id',
      decision: 'rejected',
      reason,
      timestamp: new Date().toISOString(),
    };

    console.log('Audit entry:', auditEntry);
    setPendingActions(prev => prev.filter(a => a.id !== action.id));
  };

  const escalateAction = async (action: HITLAction, to: string) => {
    const auditEntry = {
      actionId: action.id,
      userId: 'current-user-id',
      decision: 'escalated',
      escalatedTo: to,
      timestamp: new Date().toISOString(),
    };

    console.log('Audit entry:', auditEntry);
    // Garder dans pendingActions mais changer le niveau requis
  };

  return {
    pendingActions,
    submitForApproval,
    approveAction,
    rejectAction,
    escalateAction
  };
};

export default HITLAdvanced;