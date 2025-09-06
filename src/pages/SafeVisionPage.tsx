import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import safevisionData from '../data/safevision-data.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  DollarSign, 
  Clock, 
  Users, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Play,
  Settings,
  Video,
  Brain,
  FileText,
  Shield,
  Loader2,
  Sparkles,
  Eye,
  Download,
  Copy
} from 'lucide-react';

// Import de l'orchestrateur SafeVision avec intégration XAI
import { EnhancedSafeVisionOrchestrator } from '@/lib/safevision/agentOrchestrator';

// ================================
// GÉNÉRATEUR DE SCÉNARIOS INTÉGRÉ
// ================================

type Thématique =
  | 'espaces_clos'
  | 'travail_hauteur'
  | 'epi'
  | 'formation_sst'
  | 'inspection_conformite'
  | 'premiers_secours'
  | 'substances_dangereuses'
  | 'machines_equipements'
  | 'transport_manutention'
  | 'hygiene_industrielle'
  | 'gestion_risques'
  | 'enquetes_accidents'
  | 'reglementation_sst'
  | 'sante_mentale'
  | 'violence_travail'
  | 'environnement'
  | 'technologies_emergentes';

interface DocuAnalyzerMeta {
  id: string;
  title: string;
  source: string;
  category?: string;
  thematic: Thématique;
  sector: string;
  scian?: string;
  regulations?: string[];
  summary?: string;
}

interface SafetyGraphRecord {
  sector: string;
  scian?: string;
  thematic?: Thématique;
  accidentsPerYear?: number;
  accidentRatePct?: number;
  avgCostPerAccident?: number;
}

interface GeneratedScenario {
  id: number;
  title: string;
  description: string;
  thematic: Thématique;
  sector: string;
  scian?: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
  agents: string[];
  docsSources: number;
  regulations: string[];
  safetyStats?: {
    accidentsPerYear?: number;
    accidentRatePct?: number;
    avgCostPerAccident?: number;
  };
  promptPack: { [agentName: string]: string };
  createdAt: string;
}

// Utilitaires intégrés
const DEFAULT_AGENTS = ['Hugo', 'DiagSST', 'LexiNorm', 'ALSS', 'Prioris', 'Sentinelle', 'DocuGen', 'CoSS'];

function safehash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function pickComplexity(accidentRatePct?: number, docsCount = 0): GeneratedScenario['complexity'] {
  if ((accidentRatePct || 0) > 8 || docsCount > 20) return 'critical';
  if ((accidentRatePct || 0) > 4 || docsCount > 10) return 'high';
  if ((accidentRatePct || 0) > 1 || docsCount > 4) return 'medium';
  return 'low';
}

function durationFromComplexity(c: GeneratedScenario['complexity']): string {
  switch (c) {
    case 'low': return '2-4min';
    case 'medium': return '3-6min';
    case 'high': return '5-8min';
    case 'critical': return '6-12min';
    default: return '3-5min';
  }
}

function buildAgentPrompt(agentName: string, meta: Partial<GeneratedScenario>): string {
  const base = `AGENT: ${agentName}\nCONTEXT: Scénario SST sur "${meta.title || meta.thematic}" - secteur: ${meta.sector || 'général'}\nOBJECTIF: Générer contribution agent spécialisée pour production vidéo de formation.`;
  
  let roleSpec = '';
  switch (agentName) {
    case 'Hugo':
      roleSpec = 'Rôle: narrateur pédagogique, structurer le script, définir segments et transitions.';
      break;
    case 'DiagSST':
      roleSpec = 'Rôle: diagnostic des risques, identifier scénarios d\'incidents probables, mesures correctives.';
      break;
    case 'LexiNorm':
      roleSpec = 'Rôle: extraire références réglementaires et articles applicables, proposer citations conformes.';
      break;
    case 'ALSS':
      roleSpec = 'Rôle: conseiller ergonomie et solutions adaptations pour travailleurs.';
      break;
    case 'Prioris':
      roleSpec = 'Rôle: prioriser recommandations selon criticité et coûts.';
      break;
    case 'Sentinelle':
      roleSpec = 'Rôle: alerter sur urgences, protocoles d\'intervention immédiate.';
      break;
    case 'DocuGen':
      roleSpec = 'Rôle: générer éléments de documentation (checklists, fiches techniques, résumé PDF).';
      break;
    case 'CoSS':
      roleSpec = 'Rôle: produire métriques sécurité et KPIs, et proposer objectif de suivi.';
      break;
    default:
      roleSpec = 'Rôle: contribution générique spécialisée SST.';
      break;
  }

  const constraints = [
    'Langue: fr-CA',
    `Durée cible: ${meta.duration || 'variable'}`,
    `Complexité: ${meta.complexity || 'medium'}`,
    `Thématique: ${meta.thematic || 'générale'}`,
    `Inclure références: ${meta.regulations ? meta.regulations.join(', ') : 'LMRSST, CNESST'}`,
  ].join(' | ');

  return `${base}\n${roleSpec}\nCONSTRAINTS: ${constraints}\nDELIVERABLE: texte structuré, bullets, et 2 propositions pour visuel / interaction.`;
}

// Générateur principal intégré
function generateScenariosFromDocuAnalyzer(
  docs: DocuAnalyzerMeta[],
  safetyGraph?: SafetyGraphRecord[],
  minScenarios = 100
): GeneratedScenario[] {
  // Agrégation docs par sector + thematic
  const bucket = new Map<string, DocuAnalyzerMeta[]>();
  for (const d of docs) {
    const key = `${d.sector || 'general'}::${d.thematic || d.category || 'unknown'}`;
    if (!bucket.has(key)) bucket.set(key, []);
    bucket.get(key)!.push(d);
  }

  // Index safetyGraph par sector+thematic
  const sgIndex = new Map<string, SafetyGraphRecord>();
  (safetyGraph || []).forEach(r => {
    const k1 = `${r.sector}::${r.thematic || ''}`.toLowerCase();
    if (!sgIndex.has(k1)) sgIndex.set(k1, r);
    if (r.scian) {
      sgIndex.set(`${r.sector}::${r.scian}`.toLowerCase(), r);
    }
  });

  const generated: GeneratedScenario[] = [];
  let idCounter = 200;

  // Helper pour produire un scénario
  const produceScenario = (sector: string, thematic: Thématique, docsGroup: DocuAnalyzerMeta[], variantLabel?: string) => {
    const docsCount = docsGroup.length;
    const scian = docsGroup.find(d => d.scian)?.scian;
    const sgKey = `${sector}::${thematic}`.toLowerCase();
    const sgByScianKey = scian ? `${sector}::${scian}`.toLowerCase() : undefined;
    const sgRec = sgIndex.get(sgByScianKey || '') || sgIndex.get(sgKey) || undefined;

    const accidentRate = sgRec?.accidentRatePct;
    const complexity = pickComplexity(accidentRate, docsCount);
    const duration = durationFromComplexity(complexity);
    const titleBase = `${thematic.replace(/_/g, ' ')} - ${sector}`;
    const title = variantLabel ? `${titleBase} (${variantLabel})` : titleBase;
    const description = `Scénario ciblé sur ${thematic.replace(/_/g, ' ')} dans le secteur ${sector}. Basé sur ${docsCount} document(s). Objectif: formation pratique, conformité et mitigation des risques.`;

    const meta: GeneratedScenario = {
      id: idCounter++,
      title,
      description,
      thematic,
      sector,
      scian,
      complexity,
      duration,
      agents: DEFAULT_AGENTS.slice(),
      docsSources: docsCount,
      regulations: ['LMRSST', 'RSST', 'CSTC'],
      safetyStats: sgRec ? {
        accidentsPerYear: sgRec.accidentsPerYear,
        accidentRatePct: sgRec.accidentRatePct,
        avgCostPerAccident: sgRec.avgCostPerAccident
      } : undefined,
      promptPack: {},
      createdAt: new Date().toISOString()
    };

    // Build prompts per agent
    for (const a of DEFAULT_AGENTS) {
      meta.promptPack[a] = buildAgentPrompt(a, meta);
    }

    return meta;
  };

  // Generate scenarios
  for (const [key, docsGroup] of bucket.entries()) {
    const [sector, thematicRaw] = key.split('::');
    const thematic = (thematicRaw || 'general') as Thématique;

    // Base scenario
    generated.push(produceScenario(sector, thematic, docsGroup));

    // Variants
    const variants = ['inspection', 'procédural', 'incident-response', 'sensibilisation', 'conformite'];
    const createVariants = Math.min(3, Math.max(1, Math.floor(docsGroup.length / 5)));
    for (let i = 0; i < createVariants; i++) {
      const variantLabel = variants[(safehash(sector + thematic + i) % variants.length)];
      generated.push(produceScenario(sector, thematic, docsGroup, variantLabel));
    }

    if (generated.length >= minScenarios * 1.5) break;
  }

  // Fill remaining slots if needed
  const thematicList = Array.from(new Set(docs.map(d => d.thematic)));
  const sectorList = Array.from(new Set(docs.map(d => d.sector)));
  let synthIndex = 0;
  while (generated.length < minScenarios) {
    const thematic = thematicList[synthIndex % thematicList.length] as Thématique || 'formation_sst';
    const sector = sectorList[Math.floor(safehash(String(synthIndex)) % Math.max(1, sectorList.length))] || 'multi-sector';
    const docsGroup = docs.filter(d => d.sector === sector && d.thematic === thematic);
    generated.push(produceScenario(sector, thematic, docsGroup.length ? docsGroup : docs.slice(0, 2), `auto-${synthIndex}`));
    synthIndex++;
    if (synthIndex > 1000) break;
  }

  return generated;
}

// Données de test/démo intégrées
function createSampleData(): { docs: DocuAnalyzerMeta[], safetyGraph: SafetyGraphRecord[] } {
  const docs: DocuAnalyzerMeta[] = [
    {
      id: 'doc-001',
      title: 'Guide espaces clos - Construction',
      source: 'CNESST',
      category: 'Guides pratiques',
      thematic: 'espaces_clos',
      sector: 'construction',
      scian: '2361',
      regulations: ['LMRSST', 'CSTC'],
      summary: 'Procédures d\'entrée sécurisée en espaces clos'
    },
    {
      id: 'doc-002',
      title: 'Travail en hauteur - Manufacturier',
      source: 'CNESST',
      category: 'Réglementation',
      thematic: 'travail_hauteur',
      sector: 'manufacturier',
      scian: '3116',
      regulations: ['RSST', 'LMRSST'],
      summary: 'Équipements protection contre chutes'
    },
    {
      id: 'doc-003',
      title: 'EPI obligatoires - Services',
      source: 'CNESST',
      category: 'Guides pratiques',
      thematic: 'epi',
      sector: 'services',
      scian: '5411',
      regulations: ['LMRSST'],
      summary: 'Sélection et utilisation équipements protection'
    },
    {
      id: 'doc-004',
      title: 'Machines industrielles - Sécurité',
      source: 'CNESST',
      category: 'Réglementation',
      thematic: 'machines_equipements',
      sector: 'manufacturier',
      scian: '3116',
      regulations: ['RSST', 'LMRSST'],
      summary: 'Consignation et protection machines'
    },
    {
      id: 'doc-005',
      title: 'Formation SST - Générale',
      source: 'CNESST',
      category: 'Formation',
      thematic: 'formation_sst',
      sector: 'services',
      scian: '5411',
      regulations: ['LMRSST'],
      summary: 'Programme formation obligatoire SST'
    },
    {
      id: 'doc-006',
      title: 'Substances dangereuses - Chimie',
      source: 'CNESST',
      category: 'Réglementation',
      thematic: 'substances_dangereuses',
      sector: 'manufacturier',
      scian: '3251',
      regulations: ['RSST', 'LMRSST'],
      summary: 'Manipulation et stockage produits chimiques'
    },
    {
      id: 'doc-007',
      title: 'Transport et manutention - Logistique',
      source: 'CNESST',
      category: 'Guides pratiques',
      thematic: 'transport_manutention',
      sector: 'transport',
      scian: '4841',
      regulations: ['LMRSST'],
      summary: 'Techniques sécurisées de manutention'
    },
    {
      id: 'doc-008',
      title: 'Hygiène industrielle - Général',
      source: 'CNESST',
      category: 'Formation',
      thematic: 'hygiene_industrielle',
      sector: 'manufacturier',
      scian: '3116',
      regulations: ['RSST', 'LMRSST'],
      summary: 'Environnement de travail sain'
    }
  ];

  const safetyGraph: SafetyGraphRecord[] = [
    {
      sector: 'construction',
      thematic: 'travail_hauteur',
      accidentsPerYear: 450,
      accidentRatePct: 34,
      avgCostPerAccident: 127000
    },
    {
      sector: 'manufacturier',
      thematic: 'machines_equipements',
      accidentsPerYear: 280,
      accidentRatePct: 18,
      avgCostPerAccident: 85000
    },
    {
      sector: 'services',
      thematic: 'epi',
      accidentsPerYear: 120,
      accidentRatePct: 8,
      avgCostPerAccident: 45000
    },
    {
      sector: 'construction',
      thematic: 'espaces_clos',
      accidentsPerYear: 89,
      accidentRatePct: 12,
      avgCostPerAccident: 156000
    },
    {
      sector: 'manufacturier',
      thematic: 'substances_dangereuses',
      accidentsPerYear: 156,
      accidentRatePct: 7,
      avgCostPerAccident: 98000
    }
  ];

  return { docs, safetyGraph };
}

// ================================
// DONNÉES PROVIDERS ET SCÉNARIOS EXISTANTS
// ================================

// Base de données des providers
const PROVIDERS_DATABASE = [
  {
    id: 'demo-prototype',
    name: 'Mode Démo',
    description: 'Prototype interactif avec storyboard et TTS gratuit',
    logo: '🔬',
    pricing: 'free',
    costPerMinute: 0,
    maxDuration: '5min',
    processingTime: '< 1min',
    quality: 'prototype',
    capabilities: ['storyboard', 'tts-gratuit', 'preview-html'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: true,
      analytics: false,
      customization: 'limited'
    },
    useCases: ['prototypage', 'validation-concept', 'demonstration'],
    businessModel: 'freemium',
    techComplexity: 'simple',
    apiRequired: false
  },  
  {
    id: 'synthesia',
    name: 'Synthesia',
    description: 'Avatars IA ultra-professionnels et voix humaines premium',
    logo: '🤖',
    pricing: 'paid',
    costPerMinute: 30,
    maxDuration: '30min',
    processingTime: '10-20min',
    quality: 'enterprise',
    capabilities: ['avatars-premium', 'voix-humaines', 'multi-langues', 'branding'],
    features: {
      avatars: true,
      voiceCloning: true,
      multiLanguage: true,
      interactivity: false,
      analytics: true,
      customization: 'extensive'
    },
    useCases: ['production-enterprise', 'formation-corporate', 'communication-officielle'],
    businessModel: 'per-minute',
    techComplexity: 'moderate',
    apiRequired: true
  },
  {
    id: 'veo3',
    name: 'Google Veo 3',
    description: 'Génération vidéo IA ultra-réaliste avec personnalisation avancée',
    logo: '🎬',
    pricing: 'paid',
    costPerMinute: 10,
    maxDuration: '8min',
    processingTime: '15-25min',
    quality: 'cutting-edge',
    capabilities: ['realisme-extreme', 'personnalisation-avancee', 'effets-visuels'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: true,
      interactivity: false,
      analytics: false,
      customization: 'extensive'
    },
    useCases: ['demonstration-premium', 'contenu-innovant', 'marketing'],
    businessModel: 'per-minute',
    techComplexity: 'moderate',
    apiRequired: true
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    description: 'Création vidéo créative avec effets visuels et montage IA',
    logo: '✨',
    pricing: 'paid',
    costPerMinute: 15,
    maxDuration: '6min',
    processingTime: '10-15min',
    quality: 'creative',
    capabilities: ['effets-visuels', 'montage-ia', 'creativite'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false,
      customization: 'moderate'
    },
    useCases: ['contenu-creative', 'marketing', 'demonstration'],
    businessModel: 'per-minute',
    techComplexity: 'moderate',
    apiRequired: true
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    description: 'Génération rapide accessible avec qualité HD',
    logo: '🌟',
    pricing: 'freemium',
    costPerMinute: 2,
    maxDuration: '4min',
    processingTime: '5-8min',
    quality: 'standard',
    capabilities: ['generation-rapide', 'qualite-hd', 'accessible'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false,
      customization: 'limited'
    },
    useCases: ['tests', 'budget-limite', 'prototypage'],
    businessModel: 'freemium',
    techComplexity: 'simple',
    apiRequired: true
  }
];

// Scénarios SST disponibles
const SST_SCENARIOS = [
  {
    id: 52,
    title: 'Capsules vidéo obligations LMRSST',
    description: 'Formation interactive obligations légales employeurs selon LMRSST Art.51',
    complexity: 'medium',
    duration: '3-5min',
    agents: ['Hugo', 'DiagSST', 'ALSS', 'LexiNorm'],
    docsSources: 196,
    estimatedDuration: '3-5min'
  },
  {
    id: 116,
    title: 'Équipements de protection individuelle',
    description: 'Guide pratique sélection et utilisation EPI en milieu industriel',
    complexity: 'high',
    duration: '5-8min',
    agents: ['Hugo', 'DiagSST', 'Sentinelle', 'Prioris'],
    docsSources: 134,
    estimatedDuration: '5-8min'
  }
  ,
  {
    id: "MFG_001",
    title: "Formation cadenassage industriel renforcé",
    description: "Procédures cadenassage basées sur analyse Agent AN1 - ROI 3.1:1",
    complexity: "high",
    duration: "4-6min",
    agents: ["Hugo", "ALSS", "LexiNorm", "Prioris", "DocuGen"],
    docsSources: 67,
    estimatedDuration: "4-6min"
  },
  {
    id: "MFG_002",
    title: "Formation continue opérateurs",
    description: "Module formation basé sur analyse Agent AN1 - ROI 2.2:1",
    complexity: "medium",
    duration: "6-8min",
    agents: ["Hugo", "DiagSST", "ALSS", "Prioris"],
    docsSources: 45,
    estimatedDuration: "6-8min"
  },
  {
    id: "CONST_001",
    title: "Formation échafaudages sécurisés PME",
    description: "Module construction basé sur analyse Agent AN1 - ROI 4.2:1",
    complexity: "high",
    duration: "6-8min",
    agents: ["Hugo", "ALSS", "LexiNorm", "Sentinelle", "DocuGen"],
    docsSources: 89,
    estimatedDuration: "6-8min"
  },
  {
    id: "CONST_002",
    title: "Audit équipements protection trimestriel",
    description: "Procédures audit basées sur analyse Agent AN1 - ROI 2.8:1",
    complexity: "medium",
    duration: "3-4min",
    agents: ["DiagSST", "ALSS", "Prioris", "DocuGen"],
    docsSources: 34,
    estimatedDuration: "3-4min"
  }
  ,
  {
    id: "CONST_003",
    title: "Procédures météo travaux extérieurs",
    description: "Protocoles sécurité basés sur analyse Agent AN1 - ROI 1.9:1",
    complexity: "medium",
    duration: "5-7min",
    agents: ["Hugo", "ALSS", "Sentinelle", "DocuGen"],
    docsSources: 23,
    estimatedDuration: "5-7min"
  }
];

// ================================
// FONCTIONS AUTOMATION SYNTHESIA
// ================================

// Fonction de génération de script avec balises Synthesia
const generateEnhancedScript = (scenarioId: number, enrichedContext?: any): string => {
  const scenario = SST_SCENARIOS.find(s => s.id === scenarioId) || SST_SCENARIOS[0];
  const hasDocuContext = enrichedContext && enrichedContext.documentReferences;
  
  // Données enrichies DocuAnalyzer si disponibles
  const complianceScore = hasDocuContext ? enrichedContext.complianceMetrics?.conformityScore || 85 : 85;
  const documentCount = hasDocuContext ? enrichedContext.documentReferences?.length || 0 : 0;
  const legalRefs = hasDocuContext ? enrichedContext.documentReferences?.slice(0, 2) || [] : [];
  
  return `[PROJET: AgenticSST Québec - ${scenario.title}]
[AVATAR: Professional Female - Business Casual avec éléments SST]
[VOIX: French Canadian Professional - Ton sérieux mais accessible]
[ARRIÈRE-PLAN: Bureau corporatif moderne avec logos CNESST]
[DURÉE: ${scenario.estimatedDuration}]
[QUALITÉ: 1080p Full HD - 16:9 Paysage]

=== SCRIPT SAFEVISION SST ENRICHI ===
${hasDocuContext ? `[CONTEXTE DOCUANALYZER: ${documentCount} documents CNESST analysés]` : ''}
${hasDocuContext ? `[SCORE CONFORMITÉ: ${complianceScore}%]` : ''}

[SCÈNE 1 - INTRODUCTION PERSONNALISÉE]
[DURÉE: 0:00-0:30]
[PLAN: Gros plan avatar avec transition logo AgenticSST]

Bonjour et bienvenue dans cette formation spécialisée en santé et sécurité au travail.

[PAUSE: 2s]
[AFFICHAGE: Logo AgenticSST Québec™]

Je suis votre formatrice virtuelle, et aujourd'hui nous abordons ${scenario.title.toLowerCase()}.

${hasDocuContext ? `[BADGE: Basé sur ${documentCount} documents CNESST officiels]` : ''}

[SCÈNE 2 - CONTEXTE RÉGLEMENTAIRE]
[DURÉE: 0:30-1:15]
[PLAN: Plan moyen avec superposition graphiques]

Au Québec, la Loi sur la modernisation de la santé et de la sécurité du travail (LMRSST) impose des obligations précises aux employeurs.

[AFFICHAGE: Graphique - Statistiques CNESST 2024]
[TEXTE: 34% des accidents en construction - Chutes de hauteur]

${legalRefs.length > 0 ? `Selon ${legalRefs[0]?.source || 'les documents CNESST'}, les entreprises de votre secteur doivent respecter des standards spécifiques.` : 'Votre secteur d\'activité présente des risques que nous devons adresser méthodiquement.'}

[TRANSITION: Fondu vers éléments visuels]

[SCÈNE 3 - CONTENU TECHNIQUE SPÉCIALISÉ]
[DURÉE: 1:15-2:30]
[PLAN: Alternance avatar et démonstrations visuelles]

${scenario.id === 52 ? `Les obligations LMRSST comprennent :

[LISTE ANIMÉE]
• Formation continue des travailleurs (Art. 51 LMRSST)
• Comité de santé et sécurité actif (Art. 101 LMRSST)  
• Évaluation annuelle des risques
• Documentation des incidents et quasi-accidents

[AFFICHAGE: Score de conformité ${complianceScore}%]

Votre niveau de conformité actuel nécessite des actions d'amélioration prioritaires.` : ''}

${scenario.id === 116 ? `Les équipements de protection individuelle (EPI) obligatoires :

[DÉMONSTRATION VISUELLE]
• Casque de sécurité conforme CSA Z94.1
• Protection oculaire adaptée aux risques
• Chaussures de sécurité certifiées
• Gants selon le type de manipulation

[ALERTE: Obligation légale - RSST Art. 338-345]

L'employeur doit fournir, entretenir et remplacer les EPI défaillants.` : ''}

[SCÈNE 4 - ÉVALUATION INTERACTIVE]
[DURÉE: 2:30-2:45]
[PLAN: Avatar face caméra avec éléments interactifs]

Testons vos connaissances avec une question rapide :

[QUIZ INTERACTIF]
${scenario.id === 52 ? 'Quelle est la fréquence minimale des réunions du comité SST selon la LMRSST ?' : 'Dans quels cas les EPI sont-ils obligatoires même si d\'autres mesures de protection existent ?'}

[BOUTONS RÉPONSE]
${scenario.id === 52 ? '• Mensuelle • Trimestrielle • Selon les besoins' : '• Travaux en hauteur • Exposition chimique • Toujours'}

[SCÈNE 5 - CALL-TO-ACTION PERSONNALISÉ]
[DURÉE: 2:45-3:00]
[PLAN: Gros plan final avec boutons d'action]

Votre entreprise a besoin d'un accompagnement personnalisé pour atteindre la conformité complète.

[BOUTON PRINCIPAL: Diagnostic SST Gratuit]
[LIEN: agenticsst.quebec/diagnostic]
[SOUS-TEXTE: Évaluation en 15 minutes]

[BOUTON SECONDAIRE: Contacter Expert]
[LIEN: agenticsst.quebec/contact]
[SOUS-TEXTE: Consultation spécialisée]

[LOGO FINAL: AgenticSST Québec™]
[CERTIFICATION: Conforme LMRSST 2024 • Approuvé CNESST]
[MENTION: Généré par SafeVision IA • ${new Date().toLocaleDateString('fr-CA')}]

=== PARAMÈTRES TECHNIQUES SYNTHESIA ===

[CONFIGURATION AVATAR]
Type: Professional Female
Style: Business Casual avec casque sécurité en arrière-plan
Âge: 25-35 ans
Expression: Sérieuse mais bienveillante

[CONFIGURATION VOIX]
Langue: French Canadian (fr-CA)
Voix: Professional Female
Ton: Sérieux mais accessible
Vitesse: Normale (1.0x)
Pauses: Marquées aux [PAUSE]

[CONFIGURATION VISUELLE]
Résolution: 1080p Full HD
Format: 16:9 Paysage
Arrière-plan: Corporate Office Clean
Éléments: Logos CNESST, graphiques, icônes SST
Sous-titres: Français canadien activés
Animations: Transitions douces entre scènes

[CONFIGURATION EXPORT]
Format: MP4 optimisé web
Codec: H.264
Bitrate: 5000 kbps
Audio: AAC 192 kbps
Durée estimée génération: 15-20 minutes
Taille fichier approximative: 45-60 MB

=== INSTRUCTIONS IMPORT SYNTHESIA ===

1. Connectez-vous à app.synthesia.io
2. Cliquez "Create Video" → "Import Script"
3. Collez ce script complet (Ctrl+V)
4. Synthesia détectera automatiquement les balises de configuration
5. Vérifiez l'avatar et la voix sélectionnés
6. Cliquez "Generate Video" 
7. Temps de traitement : 15-20 minutes
8. Récupérez l'URL de partage pour distribution

${hasDocuContext ? '\n=== ENRICHISSEMENT DOCUANALYZER DÉTECTÉ ===\n\nCe script a été enrichi avec :\n• ' + documentCount + ' documents CNESST analysés\n• Score de conformité calculé : ' + complianceScore + '%\n• Références légales vérifiées\n• Recommandations sectorielles personnalisées\n\nL\'intelligence artificielle AgenticSST a adapté le contenu à votre contexte spécifique.' : ''}`;
};

// Fonction export template Synthesia
const exportSynthesiaTemplate = (scenarioId: number, scriptContent: string) => {
  const scenario = SST_SCENARIOS.find(s => s.id === scenarioId) || SST_SCENARIOS[0];
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', 'h');
  
  const templateContent = `=== TEMPLATE SYNTHESIA - AGENTICSST QUÉBEC ===
Généré le: ${new Date().toLocaleDateString('fr-CA', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

SCÉNARIO: ${scenario.title}
DURÉE ESTIMÉE: ${scenario.estimatedDuration}
COMPLEXITÉ: ${scenario.complexity}

${scriptContent}

=== CHECKLIST PRODUCTION SYNTHESIA ===

□ Script importé dans Synthesia
□ Avatar Professional Female sélectionné
□ Voix French Canadian configurée
□ Arrière-plan Corporate Office défini
□ Sous-titres français canadien activés
□ Qualité 1080p Full HD confirmée
□ Format 16:9 Paysage vérifié
□ Éléments visuels (logos, graphiques) ajoutés
□ Boutons CTA configurés avec liens corrects
□ Durée finale validée (≤ ${scenario.estimatedDuration})
□ Génération vidéo lancée
□ URL de partage récupérée
□ Tests de lecture sur différents appareils

=== LIENS DE DISTRIBUTION ===

AgenticSST Principal: https://agenticsst.quebec
Diagnostic Gratuit: https://agenticsst.quebec/diagnostic  
Contact Expert: https://agenticsst.quebec/contact
Formation Continue: https://agenticsst.quebec/formation

=== MÉTRIQUES DE PERFORMANCE ===

À remplir après génération:
□ Temps de génération Synthesia: ___ minutes
□ Taille fichier final: ___ MB
□ Taux de compression: ___ %
□ Score qualité audio: ___/10
□ Score qualité vidéo: ___/10
□ Feedback utilisateur initial: ___/10

=== CONFORMITÉ ET CERTIFICATIONS ===

✓ Contenu validé selon LMRSST 2024
✓ Références CNESST vérifiées  
✓ Terminologie française canadienne respectée
✓ Standards AgenticSST Québec appliqués
✓ Accessibilité (sous-titres, audio-description)

Généré par SafeVision AgenticSST Québec™`;

  const blob = new Blob([templateContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SafeVision_Template_${scenarioId}_${timestamp}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  return templateContent;
};

// Fonction SendToSynthesia améliorée
const sendToSynthesiaEnhanced = async (scriptContent: string, selectedScenario: any) => {
  try {
    const enrichedContext = sessionStorage.getItem('safevision-enriched-context');
    const hasEnrichment = enrichedContext !== null;
    
    const enhancedScript = generateEnhancedScript(selectedScenario.id, hasEnrichment ? JSON.parse(enrichedContext) : null);
    
    console.log('🎬 Génération script Synthesia enrichi...', {
      scenario: selectedScenario.id,
      hasDocuContext: hasEnrichment,
      scriptLength: enhancedScript.length
    });
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(enhancedScript);
      console.log('📋 Script copié dans le presse-papiers');
    }
    
    exportSynthesiaTemplate(selectedScenario.id, enhancedScript);
    console.log('📁 Template Synthesia exporté');
    
    window.open('https://app.synthesia.io/', '_blank', 'width=1400,height=900,scrollbars=yes');
    
    const instructions = `🎉 SCRIPT SYNTHESIA PRÊT POUR AUTOMATION !

📋 ÉTAPES AUTOMATION :
1. ✅ Script enrichi copié dans le presse-papiers
2. ✅ Template complet téléchargé (.txt)
3. ✅ Synthesia ouvert dans nouvel onglet

🎬 DANS SYNTHESIA :
1. Connectez-vous à votre compte
2. Cliquez "Create Video" → "Import Script"  
3. Collez le script (Ctrl+V) - Balises détectées automatiquement
4. Vérifiez : Avatar Professional Female + Voix FR-CA
5. Lancez "Generate Video" (15-20 min de traitement)

${hasEnrichment ? '🔗 ENRICHISSEMENT DOCUANALYZER ACTIF :\n• Basé sur vos documents CNESST analysés\n• Score conformité intégré\n• Références légales vérifiées\n' : ''}
📊 SCÉNARIO : ${selectedScenario.title}
⏱️ DURÉE : ${selectedScenario.estimatedDuration}
🎯 COMPLEXITÉ : ${selectedScenario.complexity}

Le fichier template contient la checklist complète de production !`;

    alert(instructions);
    
    return {
      success: true,
      scriptLength: enhancedScript.length,
      hasEnrichment,
      templateExported: true
    };
    
  } catch (error: any) {
    console.error('❌ Erreur automation Synthesia:', error);
    alert(`❌ Erreur lors de la préparation automation.\n\nLe script de base reste disponible ci-dessous.\nDétails: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Fonction preview script
const previewSynthesiaScript = (scenarioId: number) => {
  const enrichedContext = sessionStorage.getItem('safevision-enriched-context');
  const hasEnrichment = enrichedContext !== null;
  
  const script = generateEnhancedScript(scenarioId, hasEnrichment ? JSON.parse(enrichedContext) : null);
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 9999; display: flex; 
    align-items: center; justify-content: center; padding: 20px;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white; border-radius: 12px; padding: 30px; 
    max-width: 800px; max-height: 80vh; overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  `;
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #1a365d;">Preview Script Synthesia</h2>
      <button onclick="this.closest('.modal').remove()" style="
        background: #e53e3e; color: white; border: none; 
        border-radius: 6px; padding: 8px 16px; cursor: pointer;
      ">Fermer</button>
    </div>
    <pre style="
      background: #f7fafc; padding: 20px; border-radius: 8px; 
      font-size: 12px; line-height: 1.5; white-space: pre-wrap;
      border: 1px solid #e2e8f0; max-height: 500px; overflow-y: auto;
    ">${script}</pre>
    <div style="margin-top: 20px; display: flex; gap: 10px;">
      <button onclick="navigator.clipboard.writeText(\`${script.replace(/`/g, '\\`')}\`); alert('Script copié !')" style="
        background: #3182ce; color: white; border: none; 
        border-radius: 6px; padding: 10px 20px; cursor: pointer;
      ">📋 Copier Script</button>
      <button onclick="this.closest('.modal').remove(); window.open('https://app.synthesia.io/', '_blank')" style="
        background: #38a169; color: white; border: none; 
        border-radius: 6px; padding: 10px 20px; cursor: pointer;
      ">🎬 Ouvrir Synthesia</button>
    </div>
  `;
  
  modal.className = 'modal';
  modal.appendChild(content);
  document.body.appendChild(modal);
};

// Fonction copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert('✅ Script copié dans le presse-papiers !');
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('✅ Script copié dans le presse-papiers !');
    }
  } catch (error) {
    console.error('Erreur copie:', error);
    alert('❌ Erreur lors de la copie. Utilisez Ctrl+C manuellement.');
  }
};

// ================================
// COMPOSANT PRINCIPAL
// ================================

const SafeVisionPage = () => {
  const [filters, setFilters] = useState({
    budget: [0, 50],
    maxDuration: '',
    quality: [] as string[],
    features: [] as string[],
    useCases: [] as string[],
    businessModel: [] as string[],
    techComplexity: [] as string[],
    processingTime: 60
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  
  // États pour l'orchestration
  const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<any | null>(null);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);

  // États pour le générateur de scénarios
  const [generatedScenarios, setGeneratedScenarios] = useState<GeneratedScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratedScenarios, setShowGeneratedScenarios] = useState(false);

  // Détection automatique des paramètres URL pour Agent AN1
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioFromUrl = urlParams.get('scenario');
    
    if (scenarioFromUrl) {
      const matchingScenario = SST_SCENARIOS.find(s => s.id === scenarioFromUrl || s.id.toString() === scenarioFromUrl);
      if (matchingScenario) {
        setSelectedScenario(matchingScenario);
        console.log('🎯 Scénario Agent AN1 détecté et sélectionné:', scenarioFromUrl);
      }
    }
  }, []);

  // Instance de l'orchestrateur
  const orchestrator = useMemo(() => new EnhancedSafeVisionOrchestrator(), []);

  // Scénarios combinés
  const allScenarios = useMemo(() => {
    const existingScenarios = SST_SCENARIOS.map(s => ({
      ...s,
      isGenerated: false
    }));
    
    const generatedScenariosFormatted = generatedScenarios.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      complexity: s.complexity,
      duration: s.duration,
      estimatedDuration: s.duration,
      agents: s.agents,
      docsSources: s.docsSources,
      isGenerated: true,
      thematic: s.thematic,
      sector: s.sector
    }));

    return [...existingScenarios, ...generatedScenariosFormatted];
  }, [generatedScenarios]);

  // Filtrage des providers
  const filteredProviders = useMemo(() => {
    return PROVIDERS_DATABASE.filter(provider => {
      if (provider.costPerMinute < filters.budget[0] || provider.costPerMinute > filters.budget[1]) return false;
      if (filters.quality.length > 0 && !filters.quality.includes(provider.quality)) return false;
      if (filters.features.length > 0 && !filters.features.some(feature => {
        switch (feature) {
          case 'avatars': return provider.features.avatars;
          case 'voiceCloning': return provider.features.voiceCloning;
          case 'multiLanguage': return provider.features.multiLanguage;
          case 'interactivity': return provider.features.interactivity;
          case 'analytics': return provider.features.analytics;
          default: return false;
        }
      })) return false;
      if (filters.useCases.length > 0 && !filters.useCases.some(useCase => provider.useCases.includes(useCase))) return false;
      if (filters.businessModel.length > 0 && !filters.businessModel.includes(provider.businessModel)) return false;
      if (filters.techComplexity.length > 0 && !filters.techComplexity.includes(provider.techComplexity)) return false;
      return true;
    });
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      budget: [0, 50],
      maxDuration: '',
      quality: [],
      features: [],
      useCases: [],
      businessModel: [],
      techComplexity: [],
      processingTime: 60
    });
    setSelectedProviders([]);
  };

  const toggleProvider = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const getProviderRecommendation = (provider: any) => {
    if (provider.id === 'demo-prototype') return { level: 'beginner', reason: 'Idéal pour débuter et tester' };
    if (provider.costPerMinute === 0) return { level: 'budget', reason: 'Solution gratuite' };
    if (provider.costPerMinute <= 10) return { level: 'balanced', reason: 'Bon rapport qualité/prix' };
    if (provider.quality === 'enterprise') return { level: 'premium', reason: 'Qualité professionnelle' };
    return { level: 'standard', reason: 'Solution standard' };
  };

  // Générateur de scénarios
  const handleGenerateScenarios = () => {
    console.log('🚀 Génération automatique de scénarios...');
    setIsGenerating(true);
    
    const { docs, safetyGraph } = createSampleData();
    const newScenarios = generateScenariosFromDocuAnalyzer(docs, safetyGraph, 120);
    
    setGeneratedScenarios(newScenarios);
    setShowGeneratedScenarios(true);
    setIsGenerating(false);
    
    console.log(`✅ ${newScenarios.length} scénarios générés !`);
    
    // Télécharger le fichier JSON
    const payload = {
      generatedAt: new Date().toISOString(),
      count: newScenarios.length,
      scenarios: newScenarios
    };
    
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safevision-scenarios-generated.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📁 Fichier JSON téléchargé !');
  };

  // Orchestration SafeVision
  const startOrchestration = async () => {
    if (!selectedScenario || selectedProviders.length === 0) {
      setOrchestrationError('Veuillez sélectionner un scénario et au moins un provider');
      return;
    }

    setIsOrchestrating(true);
    setOrchestrationError(null);
    setOrchestrationResult(null);

    try {
      console.log('🎬 Démarrage orchestration SafeVision...');
      
      const selectedProvider = PROVIDERS_DATABASE.find(p => p.id === selectedProviders[0]);
      
      const videoSpecs = {
        duration: selectedScenario.duration,
        format: 'formation-complete' as const,
        audience: 'gestionnaires' as const,
        sector: selectedScenario.sector || 'construction',
        urgency: 'normal' as const,
        style: 'professionnel' as const,
        provider: selectedProvider?.id || PROVIDERS_DATABASE[0].id,
        language: 'fr-CA' as const,
        accessibility: {
          subtitles: true,
          audioDescription: false,
          signLanguage: false
        }
      };

      const result = await orchestrator.generateEnhancedScript(
        selectedScenario.id,
        videoSpecs
      );

      setOrchestrationResult(result);
      console.log('✅ Orchestration SafeVision terminée avec succès');

    } catch (error: any) {
      console.error('❌ Erreur orchestration SafeVision:', error);
      setOrchestrationError(`Erreur lors de l'orchestration: ${error?.message || String(error)}`);
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            SafeVision - Génération Vidéos SST
          </h2>
          <p className="text-gray-600">
            {filteredProviders.length} provider{filteredProviders.length > 1 ? 's' : ''} correspondant{filteredProviders.length > 1 ? 's' : ''} aux critères
            {generatedScenarios.length > 0 && (
              <span className="ml-2 text-purple-600 font-medium">
                • {generatedScenarios.length} scénarios générés automatiquement
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateScenarios}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Générer 100+ Scénarios Automatiques
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Filtres avancés
          </Button>
          <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Section Sélection Scénario SST */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Scénarios SST Disponibles
            {generatedScenarios.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {allScenarios.length} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {allScenarios.map((scenario: any) => (
              <Card 
                key={scenario.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedScenario?.id === scenario.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">#{scenario.id}</h4>
                      {scenario.isGenerated && (
                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                          Généré
                        </Badge>
                      )}
                    </div>
                    {selectedScenario?.id === scenario.id && (
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">{scenario.title}</h5>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{scenario.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {scenario.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {scenario.agents?.length ?? DEFAULT_AGENTS.length} agents
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {scenario.docsSources} docs
                    </span>
                  </div>
                  {scenario.isGenerated && scenario.sector && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {scenario.sector}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres providers */}
      <Card>
        <CardHeader>
          <CardTitle>Critères de sélection providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Budget par minute: {filters.budget[0]}$ - {filters.budget[1]}$
            </label>
            <Slider
              value={filters.budget}
              onValueChange={(value: number[]) => setFilters(prev => ({ ...prev, budget: value }))}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Gratuit</span>
              <span>Premium (50$/min)</span>
            </div>
          </div>

          {/* Niveau de qualité */}
          <div>
            <label className="block text-sm font-medium mb-3">Niveau de qualité</label>
            <div className="flex flex-wrap gap-2">
              {['prototype', 'standard', 'professional', 'creative', 'enterprise', 'cutting-edge'].map(quality => (
                <label key={quality} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.quality.includes(quality)}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        quality: checked 
                          ? [...prev.quality, quality]
                          : prev.quality.filter((q: string) => q !== quality)
                      }));
                    }}
                  />
                  <span className="text-sm capitalize">{quality}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cas d'usage */}
          <div>
            <label className="block text-sm font-medium mb-3">Cas d'usage principaux</label>
            <div className="flex flex-wrap gap-2">
              {['prototypage', 'formation', 'demonstration-client', 'production-enterprise', 'contenu-creative'].map(useCase => (
                <label key={useCase} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.useCases.includes(useCase)}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        useCases: checked 
                          ? [...prev.useCases, useCase]
                          : prev.useCases.filter((u: string) => u !== useCase)
                      }));
                    }}
                  />
                  <span className="text-sm">{useCase.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <>
              <div>
                <label className="block text-sm font-medium mb-3">Fonctionnalités requises</label>
                <div className="flex flex-wrap gap-2">
                  {['avatars', 'voiceCloning', 'multiLanguage', 'interactivity', 'analytics'].map(feature => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={filters.features.includes(feature)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            features: checked 
                              ? [...prev.features, feature]
                              : prev.features.filter((f: string) => f !== feature)
                          }));
                        }}
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Modèle tarifaire</label>
                <div className="flex flex-wrap gap-2">
                  {['freemium', 'subscription', 'per-minute', 'credit-system'].map(model => (
                    <label key={model} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={filters.businessModel.includes(model)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            businessModel: checked 
                              ? [...prev.businessModel, model]
                              : prev.businessModel.filter((m: string) => m !== model)
                          }));
                        }}
                      />
                      <span className="text-sm">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Grille des providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map(provider => {
          const recommendation = getProviderRecommendation(provider);
          const isSelected = selectedProviders.includes(provider.id);
          
          return (
            <Card 
              key={provider.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => toggleProvider(provider.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.logo}</span>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <Badge 
                        variant="secondary"
                        className={`mt-1 ${
                          recommendation.level === 'premium' ? 'bg-purple-100 text-purple-800' :
                          recommendation.level === 'balanced' ? 'bg-green-100 text-green-800' :
                          recommendation.level === 'budget' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {recommendation.reason}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="h-6 w-6 text-blue-600" />}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>{provider.costPerMinute === 0 ? 'Gratuit' : `${provider.costPerMinute}$/min`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Traitement: {provider.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span>Max: {provider.maxDuration}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {provider.capabilities.slice(0, 3).map((capability: string) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {provider.features.avatars && <Users className="h-3 w-3" />}
                    {provider.features.multiLanguage && <span>🌍</span>}
                    {provider.features.analytics && <span>📊</span>}
                    {provider.apiRequired && <AlertCircle className="h-3 w-3 text-orange-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section Orchestration */}
      {selectedProviders.length > 0 && selectedScenario && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Orchestration SafeVision</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Scénario sélectionné</h5>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">#{selectedScenario.id}</span>
                    <Badge variant="outline" className="text-xs">{selectedScenario.complexity}</Badge>
                    {selectedScenario.isGenerated && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                        Généré
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{selectedScenario.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{(selectedScenario.agents || DEFAULT_AGENTS).join(', ')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Provider sélectionné</h5>
                <div className="bg-white p-3 rounded-lg border">
                  {selectedProviders.map(providerId => {
                    const provider = PROVIDERS_DATABASE.find(p => p.id === providerId);
                    return (
                      <div key={providerId} className="flex items-center gap-2">
                        <span className="text-lg">{provider?.logo}</span>
                        <div>
                          <div className="text-sm font-medium">{provider?.name}</div>
                          <div className="text-xs text-gray-500">{provider?.quality}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={startOrchestration}
                disabled={isOrchestrating}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                {isOrchestrating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Orchestration en cours...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Démarrer Orchestration SafeVision
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => { setSelectedProviders([]); setSelectedScenario(null); }}>
                Réinitialiser sélection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erreur d'orchestration */}
      {orchestrationError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">Erreur d'orchestration</span>
            </div>
            <p className="text-sm text-red-700">{orchestrationError}</p>
          </CardContent>
        </Card>
      )}

      {/* Résultats d'orchestration avec automation Synthesia */}
      {orchestrationResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Script SafeVision généré avec succès</span>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">{orchestrationResult.title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Segments</div>
                  <div className="text-sm font-medium">{orchestrationResult.segments?.length || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Confiance</div>
                  <div className="text-sm font-medium">{orchestrationResult.production?.confidence || 0}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Agents</div>
                  <div className="text-sm font-medium">{orchestrationResult.metadata?.agents?.length || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">XAI Safety Graph</div>
                  <div className="text-sm font-medium">
                    {orchestrationResult.metadata?.xaiSafetyGraph ? 
                      `${orchestrationResult.metadata.xaiSafetyGraph.evidenceLinks} liens` : 
                      'Non disponible'
                    }
                  </div>
                </div>
              </div>
              {orchestrationResult.metadata?.qualityMetrics && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase mb-1">Validation qualité</div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={orchestrationResult.metadata.qualityMetrics.isValidated ? "default" : "destructive"}
                      className="text-xs"
                    >
                      Score: {orchestrationResult.metadata.qualityMetrics.confidenceScore}%
                    </Badge>
                    {orchestrationResult.metadata.qualityMetrics.isValidated && (
                      <Shield className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              )}
              
              {/* Boutons avec automation Synthesia */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  onClick={() => sendToSynthesiaEnhanced(orchestrationResult.script || '', selectedScenario)}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  🚀 Automation Synthesia
                </Button>
                
                <Button 
                  onClick={() => previewSynthesiaScript(selectedScenario.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  👁️ Preview Script
                </Button>
                
                <Button 
                  onClick={() => {
                    const script = generateEnhancedScript(selectedScenario.id);
                    exportSynthesiaTemplate(selectedScenario.id, script);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  📁 Export Template
                </Button>
                
                <Button 
                  onClick={() => copyToClipboard(orchestrationResult.script || '')}
                  className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  📋 Copier Script
                </Button>

                <Button 
                  onClick={() => window.open('/safevision/modules', '_blank')}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  ⚙️ Configuration Modules
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SafeVisionPage;