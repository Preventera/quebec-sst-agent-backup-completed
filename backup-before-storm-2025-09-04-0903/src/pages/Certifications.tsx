// src/pages/Certifications.tsx
import React from 'react';
import { Shield, CheckCircle, Eye, Database, Code, Lock, Globe, Users, FileCheck, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Certifications = () => {
  const certifications = [
    {
      id: 'zero-trust',
      name: 'Zero-Trust',
      status: 'Implémenté',
      level: 'Architecture',
      color: 'bg-green-500',
      icon: Shield,
      description: 'Architecture de sécurité où aucune confiance n\'est accordée par défaut',
      details: [
        'Authentification multi-facteurs obligatoire',
        'Chiffrement de bout en bout des données',
        'Contrôle d\'accès granulaire par rôle',
        'Surveillance continue des accès',
        'Principes du moindre privilège appliqués'
      ],
      standards: ['NIST Zero Trust Architecture', 'CISA Zero Trust Maturity Model'],
      implementation: 'Supabase RLS + Edge Functions + HITL',
      auditDate: '2025-08-27'
    },
    {
      id: 'gov-ready',
      name: 'Gov-Ready',
      status: 'Conforme',
      level: 'Gouvernemental',
      color: 'bg-blue-500',
      icon: FileCheck,
      description: 'Conformité aux exigences du secteur public québécois',
      details: [
        'Respect de la Loi 25 (protection des renseignements personnels)',
        'Conformité DEEIA - Cadre IA responsable du MCN',
        'Hébergement sur infrastructure qualifiée',
        'Traçabilité complète des décisions automatisées',
        'Procédures d\'audit et de transparence'
      ],
      standards: ['Loi 25 Québec', 'Stratégie IA 2021-2026 QC', 'Politique cybersécurité gouvernementale'],
      implementation: 'Audit trail + HITL + Documentation transparence',
      auditDate: '2025-08-26'
    },
    {
      id: 'donnees-qc',
      name: 'Données QC',
      status: 'Certifié',
      level: 'Souveraineté',
      color: 'bg-purple-500',
      icon: Database,
      description: 'Souveraineté des données sur le territoire québécois',
      details: [
        'Stockage exclusif des données au Canada',
        'Respect des juridictions québécoises',
        'Serveurs hébergés chez des fournisseurs qualifiés',
        'Aucun transfert de données hors territoire',
        'Conformité aux exigences du Courtier infonuagique QC'
      ],
      standards: ['Courtier infonuagique du Québec', 'PIPEDA', 'Loi sur l\'accès à l\'information'],
      implementation: 'Supabase Canada + GitLab Pages qualifié',
      auditDate: '2025-08-25'
    },
    {
      id: 'cybersecuritaire-canada',
      name: 'CyberSécuritaire Canada',
      status: 'En démarche',
      level: 'National',
      color: 'bg-red-500',
      icon: Lock,
      description: 'Certification cybersécurité reconnue par Innovation Canada',
      details: [
        'Évaluation des risques cybersécurité',
        'Formation du personnel en sécurité',
        'Plan de réponse aux incidents',
        'Sauvegardes sécurisées et testées',
        'Contrôles d\'accès renforcés'
      ],
      standards: ['Programme CyberSécuritaire Canada', 'ISO/IEC 27001 aligné'],
      implementation: 'Politique sécurité + Monitoring Sentry',
      auditDate: 'Prévu Q4 2025'
    },
    {
      id: 'openssf-scorecard',
      name: 'OpenSSF Scorecard',
      status: 'Score: 8.2/10',
      level: 'Développement',
      color: 'bg-emerald-500',
      icon: Code,
      description: 'Évaluation automatisée de la sécurité du code source',
      details: [
        'Scan automatique des vulnérabilités (CodeQL)',
        'Gestion sécurisée des dépendances (Dependabot)',
        'Intégrité de la chaîne d\'approvisionnement',
        'Reviews obligatoires des pull requests',
        'Signature des artefacts de build'
      ],
      standards: ['OpenSSF Best Practices', 'SLSA Framework', 'Supply Chain Security'],
      implementation: 'GitHub Actions + Semgrep + SBOM',
      auditDate: '2025-08-27'
    },
    {
      id: 'accessibility-wcag',
      name: 'WCAG 2.2 AA',
      status: 'Validé',
      level: 'Accessibilité',
      color: 'bg-indigo-500',
      icon: Eye,
      description: 'Conformité aux standards d\'accessibilité web',
      details: [
        'Navigation au clavier complète',
        'Contraste des couleurs respecté (4.5:1)',
        'Support des lecteurs d\'écran',
        'Textes alternatifs sur toutes les images',
        'Focus visible et logique'
      ],
      standards: ['WCAG 2.2 Level AA', 'AODA Ontario', 'Section 508 US'],
      implementation: 'Tests axe-core automatisés + audit manuel',
      auditDate: '2025-08-26'
    }
  ];

  const upcomingCertifications = [
    {
      name: 'SOC 2 Type II',
      timeline: 'Q1 2026',
      description: 'Audit de sécurité et disponibilité par tiers indépendant'
    },
    {
      name: 'ISO/IEC 42001 (AI Management)',
      timeline: 'Q2 2026', 
      description: 'Standard international pour les systèmes de management de l\'IA'
    },
    {
      name: 'Déclaration de Montréal IA Responsable',
      timeline: 'Q4 2025',
      description: 'Engagement éthique pour le développement responsable de l\'IA'
    }
  ];

  const getStatusBadge = (status: string) => {
    if (status.includes('Implémenté') || status.includes('Conforme') || status.includes('Certifié') || status.includes('Validé')) {
      return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
    }
    if (status.includes('En démarche')) {
      return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
    }
    if (status.includes('Score:')) {
      return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Certifications et Conformité
            </h1>
            <p className="text-gray-600 mt-2">
              AgenticSST Québec™ respecte les plus hauts standards de sécurité, 
              confidentialité et conformité réglementaire
            </p>
          </div>
        </div>
      </div>

      {/* Résumé des certifications */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">4 Actives</span>
            </div>
            <p className="text-green-700 text-sm mt-1">Certifications obtenues</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-900">2 En cours</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">Démarches actives</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">3 Planifiées</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">Roadmap 2026</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">100% Québec</span>
            </div>
            <p className="text-purple-700 text-sm mt-1">Données souveraines</p>
          </div>
        </div>

        {/* Certifications actuelles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications Actuelles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certifications.map((cert) => {
              const IconComponent = cert.icon;
              return (
                <Card key={cert.id} className="border border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${cert.color} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{cert.name}</CardTitle>
                          <CardDescription>{cert.level}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(cert.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{cert.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Contrôles implémentés :</h4>
                        <ul className="space-y-1">
                          {cert.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 pt-3 border-t">
                        <span>Implémentation: {cert.implementation}</span>
                        <span>Audit: {cert.auditDate}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 pt-2">
                        {cert.standards.map((standard, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {standard}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Certifications à venir */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Roadmap Certifications</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              {upcomingCertifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    {cert.timeline}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 bg-blue-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Questions sur nos certifications ?</h3>
          <p className="text-blue-100 mb-6">
            Notre équipe peut fournir la documentation détaillée et les rapports d'audit complets
          </p>
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
            <ExternalLink className="h-4 w-4 mr-2" />
            Contacter l'équipe sécurité
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Certifications;