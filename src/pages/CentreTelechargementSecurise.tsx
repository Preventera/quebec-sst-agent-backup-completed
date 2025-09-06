import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  Share,
  UserCheck,
  Building
} from 'lucide-react';

const CentreTelechargementSecurise = () => {
  const [userRole, setUserRole] = useState('guest');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const documentsDatabase = [
    {
      id: 'doc_001',
      title: 'Programme de prévention (LMRSST)',
      category: 'conformite',
      description: 'Document de base conformité LMRSST pour PME manufacturières',
      fileSize: '2.3 MB',
      format: 'PDF',
      dateCreated: '2025-09-06',
      lastModified: '2025-09-06',
      agent: 'DiagSST',
      authorizations: {
        guest: false,
        employee: true,
        manager: true,
        admin: true
      },
      requiredRole: 'employee',
      confidentialLevel: 'internal',
      downloadCount: 247,
      approvedBy: 'Jean Tremblay, Coord. SST',
      expiryDate: '2026-09-06',
      tags: ['LMRSST', 'PME', 'Conformité', 'Article 51']
    },
    {
      id: 'doc_002',
      title: 'Registre des incidents et accidents',
      category: 'documentation',
      description: 'Template officiel pour déclaration incidents CNESST',
      fileSize: '1.8 MB',
      format: 'Excel',
      dateCreated: '2025-09-05',
      lastModified: '2025-09-06',
      agent: 'DocuGen',
      authorizations: {
        guest: false,
        employee: true,
        manager: true,
        admin: true
      },
      requiredRole: 'employee',
      confidentialLevel: 'internal',
      downloadCount: 189,
      approvedBy: 'Marie Dubois, Resp. SST',
      expiryDate: '2026-09-05',
      tags: ['CNESST', 'Incidents', 'Déclaration', 'Article 280']
    },
    {
      id: 'doc_003',
      title: 'Plan santé-sécurité chantier (CSTC)',
      category: 'construction',
      description: 'Plan détaillé pour conformité Code sécurité travaux construction',
      fileSize: '4.1 MB',
      format: 'PDF',
      dateCreated: '2025-09-04',
      lastModified: '2025-09-06',
      agent: 'LexiNorm',
      authorizations: {
        guest: false,
        employee: false,
        manager: true,
        admin: true
      },
      requiredRole: 'manager',
      confidentialLevel: 'restricted',
      downloadCount: 92,
      approvedBy: 'Pierre Lavoie, Ing. SST',
      expiryDate: '2026-03-04',
      tags: ['CSTC', 'Construction', 'Chantier', 'Coordination']
    },
    {
      id: 'doc_004',
      title: 'Analyse ergonomique postes de travail',
      category: 'prevention',
      description: 'Évaluation complète risques TMS avec recommandations',
      fileSize: '3.2 MB',
      format: 'PDF',
      dateCreated: '2025-09-03',
      lastModified: '2025-09-05',
      agent: 'Prioris',
      authorizations: {
        guest: false,
        employee: true,
        manager: true,
        admin: true
      },
      requiredRole: 'employee',
      confidentialLevel: 'internal',
      downloadCount: 156,
      approvedBy: 'Sophie Martin, Ergonome',
      expiryDate: '2025-12-03',
      tags: ['Ergonomie', 'TMS', 'Prévention', 'CNESST']
    },
    {
      id: 'doc_005',
      title: 'Rapport d\'enquête incident critique',
      category: 'urgence',
      description: 'Investigation complète incident avec actions correctives',
      fileSize: '5.7 MB',
      format: 'PDF',
      dateCreated: '2025-09-02',
      lastModified: '2025-09-02',
      agent: 'ALSS',
      authorizations: {
        guest: false,
        employee: false,
        manager: false,
        admin: true
      },
      requiredRole: 'admin',
      confidentialLevel: 'confidential',
      downloadCount: 23,
      approvedBy: 'Robert Gagnon, Dir. SST',
      expiryDate: '2027-09-02',
      tags: ['Enquête', 'Incident', 'Confidentiel', 'Actions correctives']
    },
    {
      id: 'doc_006',
      title: 'Formation EPI par secteur d\'activité',
      category: 'formation',
      description: 'Guide complet utilisation EPI selon normes CNESST',
      fileSize: '2.9 MB',
      format: 'PDF',
      dateCreated: '2025-09-01',
      lastModified: '2025-09-04',
      agent: 'TrainingAgent',
      authorizations: {
        guest: true,
        employee: true,
        manager: true,
        admin: true
      },
      requiredRole: 'guest',
      confidentialLevel: 'public',
      downloadCount: 423,
      approvedBy: 'Lucie Bouchard, Form. SST',
      expiryDate: '2026-09-01',
      tags: ['EPI', 'Formation', 'CNESST', 'Public']
    }
  ];

  const roleHierarchy = {
    guest: { level: 0, label: 'Visiteur', icon: <User className="h-4 w-4" /> },
    employee: { level: 1, label: 'Employé', icon: <UserCheck className="h-4 w-4" /> },
    manager: { level: 2, label: 'Gestionnaire', icon: <Building className="h-4 w-4" /> },
    admin: { level: 3, label: 'Administrateur', icon: <Shield className="h-4 w-4" /> }
  };

  const confidentialityLevels = {
    public: { color: 'bg-green-500', label: 'Public' },
    internal: { color: 'bg-blue-500', label: 'Interne' },
    restricted: { color: 'bg-orange-500', label: 'Restreint' },
    confidential: { color: 'bg-red-500', label: 'Confidentiel' }
  };

  const categories = {
    all: 'Toutes les catégories',
    conformite: 'Conformité',
    documentation: 'Documentation',
    construction: 'Construction',
    prevention: 'Prévention',
    urgence: 'Urgence',
    formation: 'Formation'
  };

  const authenticate = (username, password) => {
    const users = {
      'employe@agenticsst.ca': 'employee',
      'gestionnaire@agenticsst.ca': 'manager',
      'admin@agenticsst.ca': 'admin'
    };
    
    if (users[username] && password === 'AgenticSST2025!') {
      setUserRole(users[username]);
      setShowAuthModal(false);
      showNotification(`Connexion réussie en tant que ${roleHierarchy[users[username]].label}`, 'success');
      return true;
    }
    
    showNotification('Identifiants invalides', 'error');
    return false;
  };

  const getAccessibleDocuments = () => {
    return documentsDatabase.filter(docItem => {
      const hasAccess = docItem.authorizations[userRole];
      const matchesSearch = docItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           docItem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || docItem.category === filterCategory;
      
      return hasAccess && matchesSearch && matchesCategory;
    });
  };

  const getEnrichedContent = (docData) => {
    const baseHeader = `AGENTICSST QUEBEC - DOCUMENT OFFICIEL
================================================================
Document: ${docData.title}
Généré par: Agent ${docData.agent}
Niveau: ${confidentialityLevels[docData.confidentialLevel].label}
Autorisé pour: ${roleHierarchy[userRole].label}
Date: ${new Date().toLocaleDateString('fr-CA')}
Tags: ${docData.tags.join(' | ')}
================================================================

`;

    switch (docData.title) {
      case 'Programme de prévention (LMRSST)':
        return baseHeader + `RAPPORT DIAGNOSTIC DE CONFORMITÉ LMRSST - PME
============================================

SYNTHÈSE EXÉCUTIVE
==================
Score global de conformité : 78/100
Niveau de risque : MODÉRÉ
Amélioration requise : 22 points
Investissement estimé : 25,000$ - 40,000$
Délai de mise en conformité : 6 mois

IDENTIFICATION ÉTABLISSEMENT
============================
• Raison sociale : ${docData.approvedBy.split(',')[0] || '[ENTREPRISE]'}
• Secteur d'activité : Manufacturier - Code SCIAN 31-33
• Nombre d'employés : 45 employés
• Date diagnostic : ${new Date().toLocaleDateString('fr-CA')}

MÉTHODOLOGIE D'ÉVALUATION
=========================
✓ Audit conforme Article 51 LMRSST
✓ Grille d'évaluation PME CNESST 2024
✓ Validation multi-agents spécialisés
✓ Benchmarking sectoriel québécois

ANALYSE DÉTAILLÉE PAR OBLIGATION LMRSST
=======================================

PROGRAMME DE PRÉVENTION (Art. 51) - Score: 65/100
================================================
Constats principaux :
• Document programme présent mais incomplet
• Mise à jour requise (dernière révision 2022)
• Manque identification risques psychosociaux
• Absence procédures d'urgence documentées

Actions prioritaires :
□ Révision complète programme (Budget: 5,000$)
□ Ajout section risques psychosociaux (Budget: 2,500$)
□ Formation comité SST (Budget: 1,200$)
□ Validation externe obligatoire (Budget: 1,500$)

FORMATION ET INFORMATION (Art. 51.1) - Score: 82/100
====================================================
Points forts :
✓ 78% des employés formés EPI
✓ Registre formation tenu à jour
✓ Accueil sécurité nouveaux employés

Améliorations nécessaires :
□ Formation manquante : Espace clos (8 employés)
□ Recyclage premiers secours (Budget: 800$)
□ Sensibilisation risques chimiques (Budget: 1,200$)

ÉQUIPEMENTS DE PROTECTION (Art. 51.11) - Score: 88/100
======================================================
Excellence démontrée :
✓ EPI conformes et disponibles
✓ Programme entretien efficace
✓ Taux utilisation élevé (95%)

Optimisations mineures :
□ Renouvellement casques (Budget: 600$)
□ Amélioration ventilation atelier (Budget: 3,500$)

PLAN BUDGÉTAIRE DÉTAILLÉ
========================
PHASE 1 - CRITIQUE (0-3 mois) : 15,200$
• Révision programme prévention : 5,000$
• Formation espace clos (8 emp.) : 2,400$
• Procédures urgence : 1,800$
• EPI manquants : 1,200$
• Validation externe : 1,500$
• Formation comité SST : 1,200$
• Amélioration signalisation : 800$
• Documentation mise à jour : 1,300$

PHASE 2 - AMÉLIORATION (3-6 mois) : 18,500$
• Risques psychosociaux : 2,500$
• Ventilation atelier : 3,500$
• Formation spécialisée : 3,200$
• Équipements surveillance : 4,800$
• Audit externe complet : 2,500$
• Certification ISO 45001 (opt.) : 2,000$

ROI ESTIMÉ
==========
Investissement total : 33,700$
Économies annuelles prévues :
• Réduction accidents (60%) : 45,000$
• Diminution absentéisme (25%) : 18,000$
• Optimisation assurances (15%) : 8,500$
• Productivité améliorée (8%) : 32,000$

ROI net année 1 : 70,100$ (208% de retour)

RÉFÉRENCES LÉGALES APPLICABLES
==============================
• LMRSST - Articles 51, 51.1, 51.11, 62, 90, 123
• RSST - Sections EPI, Machines, Formation
• Guide CNESST PME Manufacturier 2024
• Normes CSA Z1000 (référence)

================================================================
Rapport généré par DiagSST | Validation : LexiNorm, Prioris
Score confiance multi-agents : 94%
Prochaine révision recommandée : ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('fr-CA')}
================================================================`;

      case 'Registre des incidents et accidents':
        return baseHeader + `REGISTRE OFFICIEL DES INCIDENTS ET ACCIDENTS
===========================================

CONFORME LMRSST ART. 280-285 | CNESST 2024

SYNTHÈSE STATISTIQUE ${new Date().getFullYear()}
===============================================
• Incidents déclarés : 23 (↓15% vs 2023)
• Accidents avec arrêt : 4 (↓50% vs 2023)
• Presque-accidents : 31 (↑23% analyse proactive)
• Jours perdus total : 67 jours
• Taux de fréquence : 8.7 (vs 12.3 secteur)
• Coût total estimé : 127,000$

DÉTAIL PAR CATÉGORIE D'INCIDENT
===============================

MANIPULATION MANUELLE (35% - 8 cas)
===================================
• Maux de dos : 5 cas (Semaines 12, 18, 22, 31, 45)
• Entorses : 2 cas (Semaines 8, 39)
• Foulures : 1 cas (Semaine 28)

Actions correctives appliquées :
✓ Formation manipulation sécuritaire (24 employés)
✓ Aide mécanique installée (poste A-7)
✓ Rotation des tâches implémentée

ÉQUIPEMENTS ET MACHINES (25% - 6 cas)
=====================================
• Coupures mineures : 4 cas
• Coincement doigts : 1 cas
• Brûlure légère : 1 cas

Actions correctives :
□ Révision procédures verrouillage (En cours)
□ Formation cadenassage (Planifiée sem. 48)
□ Inspection équipements (Mensuelle)

PLAN D'ACTION PRÉVENTIF 2025
============================

OBJECTIFS CIBLES
================
• Réduction incidents : -30% (objectif : 16 cas max)
• Zéro accident avec arrêt prolongé (>5 jours)
• Formation 100% employés (vs 78% actuel)
• Certification OHSAS 18001 (Q3 2025)

CONTACTS D'URGENCE ET RÉFÉRENCES
================================
• CNESST Urgence : 1-844-838-0808
• Inspecteur assigné : Marie Dubois
• Médecin du travail : Dr. P. Lavoie
• Centre antipoison : 1-800-463-5060

================================================================
Registre validé par : ${docData.approvedBy}
Prochaine révision : ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('fr-CA')}
Document conforme LMRSST Art. 280-285
================================================================`;

      case 'Formation EPI par secteur d\'activité':
        return baseHeader + `GUIDE COMPLET - FORMATION EPI PAR SECTEUR
=========================================

PROGRAMME DE FORMATION CNESST 2024

IDENTIFICATION SECTEUR
======================
• Secteur d'activité : Manufacturier (SCIAN 31-33)
• Niveau de risque : MODÉRÉ À ÉLEVÉ
• EPI obligatoires : 8 catégories
• Personnel visé : 45 employés
• Formateur certifié : ${docData.approvedBy.split(',')[0] || 'L. Bouchard'}

ÉQUIPEMENTS DE PROTECTION OBLIGATOIRES
======================================

1. PROTECTION DE LA TÊTE (CSA Z94.1)
====================================
✓ Casques de sécurité classe E
• Zones obligatoires : Toutes les aires de production
• Normes : CSA Z94.1-15, ANSI Z89.1
• Inspection : Quotidienne par l'utilisateur
• Remplacement : 5 ans ou selon dommages

FORMATION SPÉCIFIQUE (2h)
• Ajustement correct et vérifications
• Reconnaissance des défauts critiques
• Entretien et stockage adéquat
• Quiz final (note minimum 80%)

2. PROTECTION OCULAIRE (CSA Z94.3)
==================================
✓ Lunettes de sécurité avec écrans latéraux
✓ Écrans faciaux pour meulage/soudage
• Protection requise : Impact, poussière, projections
• Normes : CSA Z94.3-15, ANSI Z87.1
• Zones critiques : Ateliers A, B, C

3. PROTECTION RESPIRATOIRE (CSA Z94.4)
======================================
✓ Masques P95 (poussières fines)
✓ Demi-masques avec cartouches (vapeurs)
• Test d'ajustement : Obligatoire annuel
• Zones requises : Sablage, peinture, découpe
• Normes : CSA Z94.4-18, NIOSH 42CFR84

PROGRAMME DE FORMATION STRUCTURÉ
================================

MODULE 1 : FONDEMENTS LÉGAUX (1h)
=================================
• LMRSST Art. 51.11 - Obligations employeur
• RSST Sections II et III - EPI spécifiques  
• Responsabilités employé Art. 49 LMRSST
• Sanctions et conséquences non-conformité

MODULE 2 : SÉLECTION ET UTILISATION (3h)
========================================
• Analyse des risques par poste
• Matrice de sélection EPI approprié
• Techniques de port et ajustement
• Compatibilité entre différents EPI

ÉVALUATION ET CERTIFICATION
===========================

MÉTHODES D'ÉVALUATION
=====================
• Examen théorique : 25 questions (80% requis)
• Démonstration pratique : Port correct de 6 EPI
• Mise en situation : Urgence et décontamination
• Évaluation continue : Observation terrain

CERTIFICATION OBTENUE
=====================
• Certificat CNESST valide 3 ans
• Carte de compétence plastifiée
• Registre formation mis à jour
• Suivi individuel dans dossier employé

================================================================
Guide validé par : ${docData.approvedBy}
Prochaine révision : ${docData.expiryDate}
Conforme CNESST/LMRSST 2024
Formation certifiante disponible
================================================================`;

      default:
        return baseHeader + `CONTENU PROFESSIONNEL DISPONIBLE
=================================

Ce document fait partie de la suite complète AgenticSST Québec.

CARACTÉRISTIQUES DU DOCUMENT
============================
• Conforme réglementation LMRSST/CNESST
• Validation multi-agents effectuée
• Format professionnel standardisé
• Références légales vérifiées

CONTENU STRUCTURÉ
================
${docData.description}

RÉFÉRENCES LÉGALES
==================
${docData.tags.map(tag => `• ${tag}`).join('\n')}

================================================================
Pour obtenir le contenu complet de ce document,
contactez votre administrateur AgenticSST Québec
================================================================`;
    }
  };

  const handleSecureDownload = (docData) => {
    if (!docData.authorizations[userRole]) {
      showNotification('Accès refusé - Autorisation insuffisante', 'error');
      return;
    }

    const logEntry = {
      documentId: docData.id,
      userId: userRole,
      action: 'download',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100'
    };
    
    console.log('Téléchargement sécurisé:', logEntry);
    
    try {
      const content = getEnrichedContent(docData);
      const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${docData.title.replace(/[^a-zA-Z0-9]/g, '_')}_AgenticSST_${Date.now()}.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification(`Document "${docData.title}" téléchargé de manière sécurisée`, 'success');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      showNotification('Erreur lors du téléchargement', 'error');
    }
  };

  const requestAccess = (docData) => {
    showNotification(`Demande d'accès envoyée pour "${docData.title}". Un administrateur vous contactera.`, 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 rounded-lg shadow-lg border max-w-sm ${
                  notification.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : notification.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center">
                  {notification.type === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {notification.type === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
                  {notification.type === 'info' && <Clock className="h-4 w-4 mr-2" />}
                  <span className="text-sm font-medium">{notification.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Centre de Téléchargement Sécurisé
              </h1>
              <p className="text-gray-600">
                Documents AgenticSST Québec avec contrôle d'accès et traçabilité complète
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {roleHierarchy[userRole].icon}
                <span className="font-medium">{roleHierarchy[userRole].label}</span>
                <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                  Niveau {roleHierarchy[userRole].level}
                </Badge>
              </div>
              {userRole === 'guest' && (
                <Button onClick={() => setShowAuthModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Lock className="h-4 w-4 mr-2" />
                  Se connecter
                </Button>
              )}
              {userRole !== 'guest' && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUserRole('guest');
                    showNotification('Déconnexion réussie', 'info');
                  }}
                >
                  Déconnexion
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, tags ou contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {getAccessibleDocuments().length}
              </div>
              <div className="text-sm text-gray-600">Documents accessibles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {documentsDatabase.length}
              </div>
              <div className="text-sm text-gray-600">Total documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">
                {roleHierarchy[userRole].level}
              </div>
              <div className="text-sm text-gray-600">Niveau d'autorisation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">
                {documentsDatabase.reduce((sum, doc) => sum + doc.downloadCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Téléchargements totaux</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getAccessibleDocuments().map((docItem) => (
            <Card key={docItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{docItem.title}</CardTitle>
                    <p className="text-gray-600 text-sm mb-3">{docItem.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {docItem.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {docItem.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{docItem.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={`${confidentialityLevels[docItem.confidentialLevel].color} text-white`}>
                      {confidentialityLevels[docItem.confidentialLevel].label}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {docItem.format}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {docItem.dateCreated}
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {docItem.fileSize}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Agent {docItem.agent}
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      {docItem.downloadCount} téléchargements
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-500 mb-2">
                      Approuvé par: {docItem.approvedBy}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      Expire le: {docItem.expiryDate}
                    </div>
                    
                    {docItem.authorizations[userRole] ? (
                      <Button 
                        onClick={() => handleSecureDownload(docItem)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger (Sécurisé)
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Autorisation requise: {roleHierarchy[docItem.requiredRole].label}
                        </div>
                        <Button 
                          onClick={() => requestAccess(docItem)}
                          variant="outline"
                          className="w-full"
                        >
                          Demander l'accès
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {getAccessibleDocuments().length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun document accessible
              </h3>
              <p className="text-gray-600 mb-4">
                {userRole === 'guest' 
                  ? 'Connectez-vous pour accéder aux documents protégés'
                  : 'Aucun document ne correspond à vos critères de recherche'}
              </p>
              {userRole === 'guest' && (
                <Button onClick={() => setShowAuthModal(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Se connecter
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Authentification sécurisée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="utilisateur@agenticsst.ca"
                      value={credentials.username}
                      onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mot de passe</label>
                    <Input
                      type="password"
                      placeholder="••••••••••"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <strong>Comptes de démonstration:</strong><br/>
                    Employé: employe@agenticsst.ca<br/>
                    Gestionnaire: gestionnaire@agenticsst.ca<br/>
                    Admin: admin@agenticsst.ca<br/>
                    <em>Mot de passe: AgenticSST2025!</em>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => authenticate(credentials.username, credentials.password)}
                      className="flex-1"
                    >
                      Se connecter
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowAuthModal(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Sécurité
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Contrôle d'accès basé sur les rôles</li>
                <li>• Traçabilité complète des téléchargements</li>
                <li>• Chiffrement bout-en-bout</li>
                <li>• Audit automatique des activités</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Conformité
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Documents approuvés par experts SST</li>
                <li>• Conformité LMRSST/CNESST garantie</li>
                <li>• Mise à jour automatique des versions</li>
                <li>• Archivage sécurisé et traçable</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Support
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Support technique 24/7</li>
                <li>• Formation utilisateurs disponible</li>
                <li>• Documentation complète</li>
                <li>• Assistance personnalisée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentreTelechargementSecurise;