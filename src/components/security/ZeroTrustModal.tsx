// src/components/security/ZeroTrustModal.tsx
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ZeroTrustModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const ZeroTrustModal: React.FC<ZeroTrustModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-3xl mx-4 shadow-2xl">
        {/* Header avec branding sécurisé */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AgenticSST Québec™</h2>
            <p className="text-sm text-blue-600 font-medium">Architecture Zero-Trust Certifiée</p>
          </div>
        </div>
        
        {/* Garanties de sécurité */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 text-sm">Isolation Multi-Tenant</h3>
                  <p className="text-xs text-green-700 mt-1">RLS Supabase + cloisonnement strict par organisation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm">Données Souveraines</h3>
                  <p className="text-xs text-blue-700 mt-1">Serveurs Québec + conformité LMRSST + audit trail</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">Supervision Humaine</h3>
                  <p className="text-xs text-amber-700 mt-1">HITL obligatoire + validation expert sur actions critiques</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications et conformité */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900 text-sm">Standards de sécurité respectés</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">BSI IT-Grundschutz</Badge>
            <Badge variant="secondary" className="text-xs">ANSSI Guide</Badge>
            <Badge variant="secondary" className="text-xs">NIST Zero-Trust</Badge>
            <Badge variant="secondary" className="text-xs">ISO 27001 Compatible</Badge>
            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">LMRSST Art. 101</Badge>
          </div>
        </div>

        {/* Message de confiance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Engagement de transparence</h4>
              <p className="text-sm text-blue-800">
                Toutes vos données restent sous votre contrôle. L'IA ne fait que des suggestions que vous 
                devez approuver. Aucune action automatique n'est effectuée sans validation humaine explicite.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            En continuant, vous acceptez l'architecture Zero-Trust et la supervision humaine obligatoire
          </div>
          <Button 
            onClick={onAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            <Shield className="w-4 h-4 mr-2" />
            Accéder de manière sécurisée
          </Button>
        </div>
      </div>
    </div>
  );
};

// Hook pour gérer l'état du modal
export const useZeroTrustModal = () => {
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté (localStorage)
    const accepted = localStorage.getItem('agenticsst-zerotrust-accepted');
    if (accepted === 'true') {
      setIsAccepted(true);
    }
  }, []);

  const acceptZeroTrust = () => {
    localStorage.setItem('agenticsst-zerotrust-accepted', 'true');
    setIsAccepted(true);
  };

  return {
    showModal: !isAccepted,
    acceptZeroTrust
  };
};