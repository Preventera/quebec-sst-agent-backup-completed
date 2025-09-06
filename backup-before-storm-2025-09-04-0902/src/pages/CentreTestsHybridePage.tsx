// src/pages/CentreTestsHybridePage.tsx
// Centre de Tests Hybride - Version Propre et Modulaire

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Download,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  Target,
  Zap,
  BarChart3,
  PlayCircle,
  ArrowLeft,
  Award,
  Shield,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CentreTestsHybridePage = () => {
  const [currentMode, setCurrentMode] = useState('automatique');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState('');
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [metrics, setMetrics] = useState({
    timeSpent: 0,
    interactions: 0,
    documentsGenerated: 0,
    leadScore: 'medium'
  });

  // Effet pour timer d'engagement
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Scénarios automatisés pour le prélancement
  const scenariosAutomatises = [
    {
      id: 'pme-manufacturiere',
      titre: 'PME Manufacturière',
      secteur: 'Industriel',
      duree: '4-6 minutes',
      icon: <Building className="h-6 w-6" />,
      description: 'Évaluation conformité Art.51 LMRSST avec génération automatique des documents',
      agents: ['DiagSST', 'LexiNorm', 'DocuGen', 'Prioris'],
      livrables: [
        'Rapport diagnostic conformité LMRSST',
        'Plan d\'action priorisé avec timeline',
        'Checklist inspection terrain',
        'Formulaires CNESST pré-remplis'
      ],
      references: ['Art. 51 LMRSST', 'Guide PME CNESST', 'Normes secteur manufacturier'],
      color: 'bg-blue-500',
      targetAudience: 'PME 50-200 employés'
    },
    {
      id: 'construction-cstc',
      titre: 'Construction CSTC',
      secteur: 'Construction',
      duree: '6-8 minutes',
      icon: <AlertTriangle className="h-6 w-6" />,
      description: 'Conformité multi-législations avec avis CNESST 10 jours',
      agents: ['LexiNorm', 'ALSS', 'DocuGen', 'Hugo', 'Sentinelle'],
      livrables: [
        'Avis CNESST conformité 10j',
        'Analyse multi-législations (LMRSST/CSTC)',
        'Plan santé-sécurité chantier',
        'Documents coordination SST'
      ],
      references: ['Code Sécurité Travaux Construction', 'LMRSST Construction', 'Normes CNESST'],
      color: 'bg-orange-500',
      targetAudience: 'Contracteurs, donneurs d\'ouvrage'
    },
    {
      id: 'incident-critique',
      titre: 'Incident Critique',
      secteur: 'Urgence',
      duree: '3-5 minutes',
      icon: <Activity className="h-6 w-6" />,
      description: 'Gestion incident avec déclaration 24h et formulaires temps réel',
      agents: ['ALSS', 'DocuGen', 'Hugo', 'Sentinelle', 'CoSS'],
      livrables: [
        'Déclaration incident CNESST 24h',
        'Rapport enquête préliminaire',
        'Plan actions correctives immédiates',
        'Communication parties prenantes'
      ],
      references: ['Procédures CNESST urgence', 'LMRSST incidents', 'Protocoles déclaration'],
      color: 'bg-red-500',
      targetAudience: 'Toutes organisations'
    }
  ];

  // Templates de contenu PROFESSIONNELS - VERSION PROPRE
  const getDocumentTemplate = (docType, scenario) => {
    const timestamp = new Date().toLocaleString('fr-CA');
    
    const templates = {
      'Rapport diagnostic conformité LMRSST': `RAPPORT DIAGNOSTIC DE CONFORMITÉ LMRSST - PME QUÉBÉCOISE
====================================================================

SYNTHÈSE EXÉCUTIVE
====================================================================
SCORE GLOBAL DE CONFORMITÉ : 78/100 (SATISFAISANT - À AMÉLIORER)
NIVEAU DE RISQUE : MODÉRÉ (4 non-conformités critiques identifiées)
SECTEUR : ${scenario?.secteur || 'Industriel'} - Code SCIAN ${scenario?.secteur === 'Construction' ? '23' : '31-33'}
DATE ÉVALUATION : ${timestamp}
AGENT ÉVALUATEUR : ${scenario?.agents?.[0] || 'DiagSST'} - Certification CNESST active

====================================================================
ANALYSE DÉTAILLÉE PAR OBLIGATION LMRSST
====================================================================

PROGRAMME DE PRÉVENTION (Art. 51 LMRSST) - Score: 65/100 - NON CONFORME
────────────────────────────────────────────────────────────────
CONSTATS CRITIQUES :
• Document programme de prévention présent mais incomplet (dernière MAJ: 2022)
• Analyse des postes de travail non mise à jour depuis 18 mois
• Identification des risques insuffisante pour 3 secteurs d'activité
• Procédures de travail sécuritaires manquantes pour 12 équipements

ACTIONS PRIORITAIRES IDENTIFIÉES :
□ URGENT (0-30 jours) : Révision complète programme selon grille CNESST 2024
□ CRITIQUE : Formation responsables SST sur nouvelles obligations
□ ESSENTIEL : Mise à jour identification risques tous postes
Budget estimé : 8,500$ - 12,000$ | ROI sécurité : Réduction accidents 35%

FORMATION ET INFORMATION (Art. 51.1) - Score: 82/100 - SATISFAISANT  
────────────────────────────────────────────────────────────────
POINTS FORTS :
• 78% des employés formés sur utilisation EPI (cible 85%+)
• Programme accueil nouveaux employés structuré et documenté
• Registre formation tenu à jour avec signatures et dates

AMÉLIORATIONS REQUISES :
• Formation manquante : Espaces clos (8 employés concernés)
• Recyclage EPI auditif en retard (23 employés - secteur bruyant)
• Formation premiers secours : seulement 2 secouristes pour 47 employés
Budget formation : 4,200$ | Délai : 60 jours maximum

====================================================================
PLAN D'ACTION STRATÉGIQUE PRIORISÉ
====================================================================

PHASE 1 : ACTIONS CRITIQUES (0-60 jours) - Budget : 15,000$
────────────────────────────────────────────────────────────────
1. RÉVISION PROGRAMME PRÉVENTION (Priorité MAXIMUM)
   • Audit complet par consultant externe certifié
   • Mise à jour identification risques tous postes
   • Formation équipe direction sur nouvelles obligations LMRSST
   • Échéancier : 45 jours | Budget : 7,500$ | ROI : -45% risque accidents

2. RATTRAPAGE FORMATION CRITIQUE
   • Formation espaces clos : 8 employés (14h chacun)
   • Recyclage EPI auditif : 23 employés (2h chacun)
   • Formation premiers secours : 2 secouristes additionnels
   • Échéancier : 30 jours | Budget : 4,200$

ANALYSE COÛT-BÉNÉFICE CONSOLIDÉE
====================================================================

INVESTISSEMENT TOTAL REQUIS : 35,000$ sur 12 mois
ÉCONOMIES DIRECTES PROJETÉES :
• Réduction primes assurance (-12%) : 8,400$/an
• Diminution accidents/incidents (-40%) : 15,200$/an  
• Productivité accrue (moins d'arrêts) : 6,800$/an
• TOTAL BÉNÉFICES ANNUELS : 30,400$/an

ROI NET : Retour investissement en 13.8 mois
PAYBACK : Rentabilité dès année 2 avec +26,400$/an bénéfices nets

====================================================================
RAPPORT GÉNÉRÉ PAR AGENTICSST QUÉBEC™
Agent diagnostic : ${scenario?.agents?.[0] || 'DiagSST'} | Score confiance : 94%
Validation multi-agents : LexiNorm (juridique) + DocuGen (format)
Prochaine évaluation recommandée : ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
====================================================================`,

      'Plan d\'action priorisé avec timeline': `PLAN D'ACTION PRIORISÉ SST - ${(scenario?.secteur || 'PME').toUpperCase()} QUÉBÉCOISE
====================================================================

CONTEXTE STRATÉGIQUE
====================================================================
SUITE À : Diagnostic conformité LMRSST (Score global 78/100)
OBJECTIF CIBLE : Atteindre 90+ conformité LMRSST en 6 mois
BUDGET TOTAL APPROUVÉ : 43,000$ - 72,000$ (selon options retenues)
ROI PROJETÉ : 156% sur 24 mois (économies vs investissement)

====================================================================
PHASE 1 : ACTIONS CRITIQUES (SEMAINES 1-4) - Budget : 28,500$
====================================================================

SEMAINE 1-2 : AUDIT SÉCURITÉ MACHINES CRITIQUES
────────────────────────────────────────────────────────────────
Responsable : Coordonnateur SST + Expert mécanique externe
Objectif : Identifier non-conformités RSST Art. 173-190 sur 12 équipements prioritaires
Livrables :
□ Rapport audit détaillé avec photos avant/après
□ Liste priorisée des corrections requises
□ Estimation budgétaire pour mise en conformité
Budget alloué : 8,500$ | Échéance ferme : 14 jours

SEMAINE 2-3 : MISE À JOUR REGISTRE ACCIDENTS ART. 123 LMRSST
────────────────────────────────────────────────────────────────
Action : Saisie rétroactive 6 derniers mois + formation responsables
Criticité : URGENT (obligation légale - risque amende 5,000$-25,000$)
Ressources : CSS + Assistant administratif (40h total)
Budget : 2,800$ (temps interne + formation)

PHASE 2 : CONFORMITÉ RÉGLEMENTAIRE (SEMAINES 5-16) - Budget : 22,000$
====================================================================

SEMAINES 5-8 : RÉVISION PROGRAMME PRÉVENTION COMPLET
────────────────────────────────────────────────────────────────
Mandat : Réécriture complète selon grille CNESST 2024
Méthodologie :
1. Analyse exhaustive 47 postes de travail
2. Identification risques selon méthode KINNEY & WIRUTH
3. Mesures préventives priorisées par criticité
4. Procédures travail sécuritaires actualisées
5. Plan formation intégré au programme

Consultant principal : Expert CNESST 15+ ans expérience
Budget : 12,500$ | Durée : 4 semaines | Validation : Direction + Comité SST

CALENDRIER CONSOLIDÉ ET JALONS CLÉS
====================================================================

MOIS 1 (Semaines 1-4) : SURVIVAL MODE 
Criticité maximum - Toutes ressources mobilisées
Jalon : 85% non-conformités critiques résolues

MOIS 2-3 (Semaines 5-12) : COMPLIANCE MODE
Mise en conformité systématique et structurée  
Jalon : Score LMRSST 85/100 atteint et validé

MOIS 4-6 (Semaines 13-26) : EXCELLENCE MODE
Optimisation continue et préparation reconnaissance
Jalon : Certification externe obtenue + KPI green

BUDGET DÉTAILLÉ ET FINANCEMENT
====================================================================

RÉPARTITION BUDGÉTAIRE PAR NATURE
────────────────────────────────────────────────────────────────
Consulting externe      : 28,500$ (45% du total)
Formation employés      : 15,200$ (24% du total)  
Système gestion SST     :  9,200$ (14% du total)
Surveillance médicale   :  6,800$ (11% du total)
Matériel et équipement  :  3,800$ (6% du total)
TOTAL BUDGET           : 63,500$

ÉCONOMIES COMPENSATOIRES PROJETÉES ANNÉE 1
• Réduction primes assurance -12% : 8,400$
• Productivité (moins arrêts SST)  : 6,800$  
• Évitement amendes potentielles   : 15,000$
• TOTAL ÉCONOMIES ANNÉE 1         : 30,200$

ROI RÉEL = (30,200$ - 63,500$) = Déficit 33,300$ Année 1
PUIS Bénéfice net 30,200$/an à partir Année 2
BREAK-EVEN : 16.2 mois | ROI 3 ans : +27,100$

====================================================================
PLAN D'ACTION APPROUVÉ PAR AGENTICSST QUÉBEC™
Agent planificateur : ${scenario?.agents?.[1] || 'Prioris'} | Score confiance : 96%
Validation multi-agents : Hugo (orchestration) + LexiNorm (conformité)
Document évolutif : Révision recommandée chaque jalon atteint
====================================================================`,

      'Checklist inspection terrain': `CHECKLIST INSPECTION TERRAIN MANUFACTURIER - RSST COMPLET
====================================================================

ÉTABLISSEMENT : ${scenario?.targetAudience || '[NOM_ENTREPRISE]'}
SECTEUR : ${scenario?.secteur || 'Industriel'} - Code SCIAN ${scenario?.secteur === 'Industriel' ? '31-33' : '[CODE]'}
DATE INSPECTION : ${new Date().toLocaleDateString('fr-CA')}
INSPECTEUR : [NOM_INSPECTEUR] - AgenticSST Québec™
HEURE DÉBUT : _____ | FIN : _____ | DURÉE : _____ min

====================================================================
1. MACHINES ET ÉQUIPEMENTS (RSST Art. 173-190)
====================================================================

TOURS À MÉTAUX (Section atelier mécanique)
────────────────────────────────────────────────────────────────
□ Garde-corps en place et fonctionnels (hauteur min 90cm)
□ Dispositifs d'arrêt d'urgence accessibles (<2m opérateur)
□ Éclairage adéquat zone travail (500 lux minimum mesuré)
□ Formation opérateur documentée et à jour
□ Procédures travail sécuritaires affichées poste
□ EPI spécifiques disponibles (lunettes, gants anti-coupure)
STATUS GLOBAL : □ CONFORME □ NON-CONFORME □ AMÉLIORATION REQUISE

PRESSES HYDRAULIQUES (Zone formage - 3 unités)
────────────────────────────────────────────────────────────────
□ Barrières photoélectriques fonctionnelles (test hebdomadaire)
□ Commandes bimanuelle obligatoires et opérationnelles
□ Dispositifs de cadenassage énergies installés et identifiés
□ Inspection quotidienne documentée (registre présent)
□ Formation spécifique opérateurs (certification requise)
□ Procédure maintenance préventive respectée
STATUS GLOBAL : □ CONFORME □ NON-CONFORME □ AMÉLIORATION REQUISE

====================================================================
2. SANTÉ ET HYGIÈNE INDUSTRIELLE (RSST Art. 113-139)
====================================================================

BRUIT ET VIBRATIONS (Mesures acoustiques)
────────────────────────────────────────────────────────────────
□ Dernières mesures acoustiques <2 ans (obligation réglementaire)
□ Rapport dosimétrie disponible postes exposés >85dB
□ EPI auditifs disponibles zones >85dB et utilisés systématiquement
□ Formation utilisation EPI auditif documentée (annuelle)
□ Surveillance médicale audiométrie employés exposés
□ Programme réduction bruit si exposition >90dB
NIVEAU SONORE MESURÉ : _____ dB | □ <85dB □ 85-90dB □ >90dB

VENTILATION GÉNÉRALE ET LOCALE (Qualité air)
────────────────────────────────────────────────────────────────
□ Système ventilation générale fonctionnel (test annuel)
□ Captation locale soudage/meulage/découpe installée
□ Débit ventilation conforme charges polluantes (calcul ingénieur)
□ Filtration adéquate selon contaminants présents
□ Maintenance préventive systèmes (registre entretien)
□ Mesures contaminants chimiques <VEMP (si applicable)
STATUS VENTILATION : □ ADEQUAT □ INSUFFISANT □ DÉFAILLANT

====================================================================
ÉVALUATION GLOBALE ET RECOMMANDATIONS
====================================================================

SCORE GLOBAL INSPECTION TERRAIN
────────────────────────────────────────────────────────────────
Machines et équipements     : ___/100 (Pondération 25%)
Santé hygiène industrielle  : ___/100 (Pondération 20%)
Manutention et ergonomie   : ___/100 (Pondération 15%)
Équipements protection      : ___/100 (Pondération 15%)
Organisation gestion        : ___/100 (Pondération 15%)
Gestion urgences           : ___/100 (Pondération 10%)

SCORE FINAL PONDÉRÉ : ___/100

CLASSIFICATION RSLT :
□ 90-100 : EXCELLENT (Maintenir niveau excellence)
□ 80-89  : SATISFAISANT (Amélioration ciblée)
□ 70-79  : ACCEPTABLE (Plan action requis)
□ <70    : INSUFFISANT (Action corrective urgente)

ACTIONS PRIORITAIRES IDENTIFIÉES
────────────────────────────────────────────────────────────────
CORRECTIONS URGENTES (0-7 jours) :
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

AMÉLIORATIONS IMPORTANTES (8-30 jours) :
1. _________________________________________________
2. _________________________________________________

====================================================================
VALIDATION ET SUIVI
====================================================================

SIGNATURES ET RESPONSABILITÉS
────────────────────────────────────────────────────────────────
INSPECTEUR : _________________________ DATE : _________
[NOM] - AgenticSST Québec™ Certification CNESST

REPRÉSENTANT EMPLOYEUR : _________________________ DATE : _________
[NOM, TITRE] - Réception rapport + engagement corrections

ÉCHÉANCIER SUIVI CORRECTIONS
────────────────────────────────────────────────────────────────
VÉRIFICATION ACTIONS URGENTES  : ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
CONTRÔLE AMÉLIORATIONS         : ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
PROCHAINE INSPECTION COMPLÈTE  : ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}

====================================================================
CHECKLIST GÉNÉRÉE PAR AGENTICSST QUÉBEC™
Agent inspecteur : ${scenario?.agents?.[0] || 'LexiNorm'} | Conformité RSST validée
Méthode inspection : Standards CNESST + meilleures pratiques industrielles
====================================================================`,

      'Formulaires CNESST pré-remplis': `FORMULAIRES OFFICIELS CNESST - SUITE COMPLÈTE PRÉ-REMPLIE
====================================================================

ÉTABLISSEMENT : ${scenario?.targetAudience || '[NOM_ENTREPRISE]'}
SECTEUR : ${scenario?.secteur || 'Manufacturier'} - Code SCIAN ${scenario?.secteur === 'Industriel' ? '31-33' : '23'}
RÉGION : Montérégie | BUREAU CNESST : Longueuil
CONTACT URGENCE CNESST : 1-844-838-0808 (24h/7j)

====================================================================
1. DÉCLARATION D'ACCIDENT 24 HEURES (Formulaire CNESST-1234)
====================================================================

SECTION A - IDENTIFICATION EMPLOYEUR
────────────────────────────────────────────────────────────────
• Nom employeur        : ${scenario?.targetAudience || '[NOM_ENTREPRISE_COMPLETE]'}
• NEQ (17 chiffres)    : [____-____-____-____-__] (Registraire entreprises)
• Code SCIAN principal : ${scenario?.secteur === 'Industriel' ? '31-33 (Fabrication)' : '23 (Construction)'}
• Nb employés moyens   : ${scenario?.secteur === 'Construction' ? '15-30' : '25-50'} employés
• Adresse établissement: [ADRESSE_COMPLETE_ETABLISSEMENT]
• Téléphone principal  : [___-___-____] Ext: [____]
• Responsable déclaration: [NOM_RESPONSABLE_SST] - [TITRE]

SECTION B - INFORMATION ACCIDENT/INCIDENT
────────────────────────────────────────────────────────────────
• Date accident        : [JJ/MM/AAAA] ← DATE RÉELLE OBLIGATOIRE
• Heure précise        : [HH:MM] (format 24h) ← HEURE EXACTE IMPORTANTE
• Lieu précis accident : [DÉPARTEMENT/ZONE/POSTE/MACHINE_CONCERNÉE]
• Témoins présents     : ☐ OUI (noms: _______) ☐ NON
• Conditions météo     : ☐ Sec ☐ Humide ☐ Venteux ☐ N/A (intérieur)

TYPE D'ÉVÉNEMENT (cocher UNE case principale)
☐ Accident avec lésion corporelle
☐ Incident sans lésion (near-miss)  
☐ Maladie professionnelle suspectée
☐ Exposition chimique/biologique
☐ Défaillance équipement sécurité

SECTION C - INFORMATION TRAVAILLEUR ACCIDENTÉ
────────────────────────────────────────────────────────────────
• Nom, prénom         : [NOM], [PRÉNOM]
• Date naissance      : [JJ/MM/AAAA] | Âge : [__] ans
• Sexe               : ☐ M ☐ F ☐ Autre
• NAS                : [___-___-___] (confidentiel - administrative seulement)
• Ancienneté entreprise: [__] années [__] mois
• Ancienneté poste    : [__] années [__] mois
• Formation SST reçue : ☐ Complète ☐ Partielle ☐ Aucune ☐ En cours

DESCRIPTION LÉSION ET PARTIE CORPS ATTEINTE
Nature lésion (sélectionner principale):
☐ Contusion/ecchymose ☐ Coupure/lacération ☐ Fracture ☐ Entorse/foulure
☐ Brûlure thermique ☐ Brûlure chimique ☐ Corps étranger ☐ Autre: _______

Partie corps (maximum 3 sélections par ordre gravité):
☐ Tête/cou ☐ Œil ☐ Bras/épaule ☐ Main/doigt ☐ Dos ☐ Jambe ☐ Pied/orteil

Gravité estimée:
☐ Premiers soins seulement ☐ Soins médicaux requis ☐ Hospitalisation
☐ Arrêt travail probable ☐ Invalidité potentielle

====================================================================
2. RAPPORT D'ENQUÊTE 72 HEURES (Formulaire CNESST-5678)
====================================================================

SECTION A - ÉQUIPE D'ENQUÊTE CONSTITUÉE
────────────────────────────────────────────────────────────────
• Responsable enquête principale: [NOM_COORDONNATEUR_SST]
• Superviseur direct impliqué   : [NOM_SUPERVISEUR]  
• Représentant comité SST       : [NOM_REPRÉSENTANT]
• Expert externe (si requis)    : ☐ OUI: [NOM] ☐ NON
• Date début enquête           : [JJ/MM/AAAA] ← Max 24h post-accident

SECTION B - MÉTHODOLOGIE D'ENQUÊTE APPLIQUÉE
────────────────────────────────────────────────────────────────
☐ Visite lieux accident (photos prises: ☐ OUI ☐ NON)
☐ Entrevues témoins directs (nombre: [__])
☐ Analyse équipement/machine impliqué(e)
☐ Révision procédures applicables au poste
☐ Vérification formation employé
☐ Consultation dossier médical antérieur (si pertinent)

SECTION C - MESURES CORRECTIVES PLANIFIÉES
────────────────────────────────────────────────────────────────
ACTIONS IMMÉDIATES (0-24h) - Prévenir récurrence:
1. [ACTION_CORRECTIVE_IMMÉDIATE_1]
   Responsable: [NOM] | Échéance: [DATE] | Statut: ☐ Fait ☐ En cours

2. [ACTION_CORRECTIVE_IMMÉDIATE_2]  
   Responsable: [NOM] | Échéance: [DATE] | Statut: ☐ Fait ☐ En cours

====================================================================
SUITE FORMULAIRES GÉNÉRÉE PAR AGENTICSST QUÉBEC™
Agent documentaire : ${scenario?.agents?.[2] || 'DocuGen'} | Conformité CNESST validée
Base légale : LMRSST + RSST + Formulaires officiels CNESST 2024
Personnalisation : Adaptation secteur ${scenario?.secteur} recommandée
====================================================================`
    };

    // Chercher dans les templates d'abord
    if (templates[docType]) {
      return templates[docType];
    }

    // Fallback simple pour autres documents
    return `DOCUMENT PROFESSIONNEL AGENTICSST QUÉBEC™
========================================

TYPE : ${docType}
SECTEUR : ${scenario?.secteur || 'Non spécifié'}
DATE : ${timestamp}
AGENT : ${scenario?.agents?.[0] || 'Multi-agents'}

Ce document a été généré par le système AgenticSST Québec™ selon les standards professionnels de l'industrie SST québécoise.

CARACTÉRISTIQUES :
• Conforme réglementation LMRSST/CNESST
• Adapté au secteur ${scenario?.secteur || 'spécifié'}
• Validation multi-agents effectuée
• Format professionnel standardisé

Document généré par ${scenario?.agents?.join(', ') || 'Système multi-agents'}
Orchestration : AgenticSST Québec™
Score confiance : 94%`;
  };

  // Fonction de téléchargement avec contenu généré - VERSION CORRIGÉE
  const downloadDocument = (doc) => {
    const content = generateDocumentContent(doc);
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.type.replace(/[^a-zA-Z0-9]/g, '_')}_${doc.scenario}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mise à jour métriques
    setMetrics(prev => ({
      ...prev,
      interactions: prev.interactions + 1
    }));
  };

  // Génération de contenu document réaliste - VERSION AMÉLIORÉE
  const generateDocumentContent = (doc) => {
    const timestamp = new Date().toLocaleString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const scenario = scenariosAutomatises.find(s => s.id === doc.scenario);

    return `
AGENTICSST QUÉBEC™ - DOCUMENT GÉNÉRÉ AUTOMATIQUEMENT
================================================================

Type de document : ${doc.type}
Agent générateur : ${doc.agent}
Scénario : ${scenario?.titre || 'Non spécifié'}
Secteur d'activité : ${scenario?.secteur || 'Non spécifié'}
Date de génération : ${timestamp}
Heure de génération : ${doc.timestamp}
ID de session : CTH-${Date.now()}

----------------------------------------------------------------
CONTENU DU DOCUMENT
----------------------------------------------------------------

${getDocumentTemplate(doc.type, scenario)}

----------------------------------------------------------------
CONFORMITÉ RÉGLEMENTAIRE
----------------------------------------------------------------

Références légales appliquées :
${scenario?.references.map(ref => `✓ ${ref}`).join('\n') || '✓ Références LMRSST générales'}

Validation multi-agents effectuée par :
${scenario?.agents.map(agent => `→ ${agent} : Validation conforme`).join('\n') || '→ Agents AgenticSST : Validation conforme'}

Niveau de conformité : ✓ CONFORME
Score de confiance : 94%

----------------------------------------------------------------
TRAÇABILITÉ ET AUDIT
----------------------------------------------------------------

• Document généré dans le cadre du système AgenticSST Québec™
• Orchestration multi-agents conforme aux standards CNESST
• Traçabilité complète disponible pour auditeurs
• Validation automatisée des références légales LMRSST/CSTC
• Processus certifié selon les normes québécoises SST

----------------------------------------------------------------
PROCHAINES ÉTAPES RECOMMANDÉES
----------------------------------------------------------------

1. Révision par responsable SST de l'organisation
2. Adaptation au contexte spécifique de l'entreprise
3. Intégration dans le système de gestion SST existant
4. Suivi et monitoring via AgenticSST Québec™

================================================================
AgenticSST Québec™ - Suite SST réglementaire
Centre de Tests Hybride - Mode Automatique
Généré le ${timestamp}
================================================================
`;
  };

  // Démarrage démonstration automatique avec simulation orchestration temps réel
  const startAutoDemonstration = (scenario) => {
    setSelectedScenario(scenario.id);
    setIsRunning(true);
    setProgress(0);
    setGeneratedDocs([]);

    // Mise à jour métriques engagement
    setMetrics(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      leadScore: 'high' // Lead qualifié après démarrage démo
    }));

    // Simulation orchestration temps réel
    const agents = scenario.agents;
    const totalSteps = agents.length * 2; // 2 étapes par agent
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const agentIndex = Math.floor((currentStep - 1) / 2);
      setCurrentAgent(agents[agentIndex] || '✅ Finalisation');
      setProgress((currentStep / totalSteps) * 100);

      // Génération documents simulée avec timing réaliste
      if (currentStep % 2 === 0 && currentStep <= agents.length * 2) {
        const docType = scenario.livrables[Math.floor((currentStep - 1) / 2)];
        if (docType) {
          setGeneratedDocs(prev => [...prev, {
            id: Date.now() + currentStep,
            type: docType,
            agent: agents[agentIndex] || agents[0],
            timestamp: new Date().toLocaleTimeString('fr-CA'),
            scenario: scenario.id
          }]);
        }
      }

      // Métriques temps réel
      setMetrics(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 2,
        documentsGenerated: Math.floor((currentStep / 2))
      }));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setIsRunning(false);
        setCurrentAgent('✅ Démonstration terminée avec succès');
      }
    }, 1500);
  };

  const stopDemonstration = () => {
    setIsRunning(false);
    setCurrentAgent('⏹️ Démonstration arrêtée');
  };

  // CTA dynamiques selon profil et secteur
  const getCTADynamique = () => {
    const scenario = scenariosAutomatises.find(s => s.id === selectedScenario);
    if (!scenario) return null;

    const ctas = {
      'pme-manufacturiere': {
        primary: 'Demander évaluation PME gratuite',
        secondary: 'Télécharger guide conformité LMRSST',
        contact: 'Parler à un expert manufacturier',
        nextStep: 'Audit conformité sur site',
        urgency: 'Évaluation gratuite limitée - 48h'
      },
      'construction-cstc': {
        primary: 'Obtenir avis CNESST 10 jours',
        secondary: 'Consulter checklist CSTC gratuite',
        contact: 'Expert construction disponible',
        nextStep: 'Planification chantier sécurisé',
        urgency: 'Service express disponible'
      },
      'incident-critique': {
        primary: 'Assistance incident 24/7',
        secondary: 'Formation gestion urgences SST',
        contact: 'Hotline incidents critique',
        nextStep: 'Plan réponse urgence personnalisé',
        urgency: 'Support immédiat disponible'
      }
    };

    return ctas[selectedScenario] || ctas['pme-manufacturiere'];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête avec navigation retour et statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au tableau de bord</span>
          </Link>
          <div className="h-6 w-px bg-slate-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Centre de Tests Hybride</h1>
            <p className="text-slate-600 mt-1">Mode automatique - Démonstrations sectorielles immersives</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-green-50 border-green-200">
            <Activity className="h-3 w-3 mr-1 text-green-600" />
            8 Agents Actifs
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 border-blue-200">
            <FileText className="h-3 w-3 mr-1 text-blue-600" />
            196 Docs CNESST
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800">
            <Award className="h-3 w-3 mr-1" />
            Mode Prélancement
          </Badge>
        </div>
      </div>

      {/* Métriques engagement temps réel */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{metrics.timeSpent}s</div>
                <div className="text-xs text-slate-600">Temps d'engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-700">{metrics.interactions}</div>
                <div className="text-xs text-slate-600">Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-700">{metrics.documentsGenerated}</div>
                <div className="text-xs text-slate-600">Documents générés</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <div>
                <Badge variant={metrics.leadScore === 'high' ? 'default' : metrics.leadScore === 'medium' ? 'secondary' : 'outline'}>
                  {metrics.leadScore === 'high' ? 'Lead Qualifié' :
                   metrics.leadScore === 'medium' ? 'Intéressé' :
                   'Prospect'}
                </Badge>
                <div className="text-xs text-slate-600 mt-1">Lead scoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sélection scénarios automatisés */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-600" />
            Démonstrations Automatiques Sectorielles
          </CardTitle>
          <p className="text-slate-600">
            Expérience immersive avec orchestration multi-agents temps réel et génération documentaire automatique
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {scenariosAutomatises.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer border-2 transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                  selectedScenario === scenario.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${scenario.color} text-white shadow-md`}>
                      {scenario.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{scenario.titre}</h3>
                      <p className="text-sm text-slate-600">{scenario.secteur}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 mb-3">{scenario.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>Durée: {scenario.duree}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-slate-500" />
                      <span>Cible: {scenario.targetAudience}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Agents mobilisés:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scenario.agents.slice(0, 3).map(agent => (
                          <Badge key={agent} variant="outline" className="text-xs px-1 py-0 bg-white">
                            {agent}
                          </Badge>
                        ))}
                        {scenario.agents.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 bg-white">
                            +{scenario.agents.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedScenario === scenario.id && (
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      onClick={() => startAutoDemonstration(scenario)}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <>
                          <Activity className="h-4 w-4 mr-2 animate-pulse" />
                          Démonstration en cours...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Démarrer Démonstration
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orchestration multi-agents en temps réel */}
      {isRunning && selectedScenario && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 animate-pulse text-green-600" />
                Orchestration Multi-Agents en Cours
              </CardTitle>
              <Button variant="outline" size="sm" onClick={stopDemonstration} className="hover:bg-white">
                <Pause className="h-4 w-4 mr-2" />
                Arrêter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progression globale</span>
                  <span className="text-sm text-slate-600 font-mono">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-white" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-700">Agent actuel</div>
                  <div className="text-slate-800 text-lg font-semibold">{currentAgent}</div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  En cours
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents générés avec téléchargement fonctionnel */}
      {generatedDocs.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents Générés Automatiquement ({generatedDocs.length})
            </CardTitle>
            <p className="text-sm text-slate-600">
              Documents conformes LMRSST/CNESST générés par l'orchestration multi-agents
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {generatedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-800">{doc.type}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      Généré par <Badge variant="outline" className="text-xs mx-1 bg-blue-50">{doc.agent}</Badge>
                      à {doc.timestamp}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDocument(doc)}
                    className="ml-3 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA dynamiques contextuels */}
      {selectedScenario && !isRunning && generatedDocs.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prochaines étapes pour votre organisation
            </CardTitle>
            <p className="text-blue-700 font-medium">
              Suite recommandée: {getCTADynamique()?.nextStep}
            </p>
            {getCTADynamique()?.urgency && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 w-fit">
                {getCTADynamique().urgency}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {getCTADynamique() && (
                <>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transform hover:scale-105 transition-all">
                    {getCTADynamique().primary}
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400">
                    {getCTADynamique().secondary}
                  </Button>
                  <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {getCTADynamique().contact}
                  </Button>
                </>
              )}
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
              <h4 className="font-medium text-sm text-slate-700 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Conformité Réglementaire Validée
              </h4>
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                {scenariosAutomatises.find(s => s.id === selectedScenario)?.references.map(ref => (
                  <Badge key={ref} variant="outline" className="text-xs border-green-200 text-green-800 bg-green-50">
                    {ref}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong>Traçabilité complète pour auditeurs</strong> • Validation multi-agents • Conformité CNESST automatisée • Mise à jour réglementaire continue
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information mode existant */}
      <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Centre de Tests Manuel Toujours Disponible
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Votre interface de tests manuels existante reste accessible avec toutes ses fonctionnalités d'origine
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/tests">
                <Button variant="outline" className="hover:bg-white">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Accéder au Mode Manuel
                </Button>
              </Link>
              <Link to="/agile-functions">
                <Button variant="secondary">
                  <Zap className="h-4 w-4 mr-2" />
                  Fonctions Agiles
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CentreTestsHybridePage;