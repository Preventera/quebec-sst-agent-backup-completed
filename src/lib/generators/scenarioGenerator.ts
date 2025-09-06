/**
 * scenarioGenerator.ts
 * Générateur automatique de scénarios SafeVision à partir des métadonnées DocuAnalyzer.
 * VERSION BROWSER-COMPATIBLE (sans Node.js fs)
 */

export type Thématique =
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
  | 'technologies_emergentes'
  | string;

export interface DocuAnalyzerMeta {
  id: string;
  title: string;
  source: string; // e.g., "CNESST"
  category?: string;
  thematic: Thématique;
  sector: string; // human readable sector name, e.g., "construction"
  scian?: string; // SCIAN code string like "2361"
  regulations?: string[]; // e.g., ['LMRSST', 'RSST']
  publishedAt?: string;
  summary?: string;
  raw?: any;
}

export interface SafetyGraphRecord {
  sector: string;
  scian?: string;
  thematic?: Thématique;
  accidentsPerYear?: number;
  accidentRatePct?: number; // percentage
  avgCostPerAccident?: number; // in CAD
}

export interface ScenarioMetadata {
  id: number;
  title: string;
  description: string;
  thematic: Thématique;
  sector: string;
  scian?: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  duration: string; // e.g., '3-5min'
  agents: string[]; // Hugo, DiagSST, LexiNorm, ALSS, Prioris, Sentinelle, DocuGen, CoSS
  docsSources: number;
  regulations: string[]; // e.g., ['LMRSST','CSTC']
  safetyStats?: {
    accidentsPerYear?: number;
    accidentRatePct?: number;
    avgCostPerAccident?: number;
  };
  promptPack: {
    [agentName: string]: string;
  };
  createdAt: string;
  seed?: string;
}

export interface GeneratorOptions {
  minScenarios?: number; // default 100
  perSector?: boolean; // try to ensure coverage per sector
  seed?: string;
}

/**
 * Utilitaires internes
 */
const DEFAULT_AGENTS = ['Hugo', 'DiagSST', 'LexiNorm', 'ALSS', 'Prioris', 'Sentinelle', 'DocuGen', 'CoSS'];

function safehash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function pickComplexity(accidentRatePct?: number, docsCount = 0): ScenarioMetadata['complexity'] {
  if ((accidentRatePct || 0) > 8 || docsCount > 20) return 'critical';
  if ((accidentRatePct || 0) > 4 || docsCount > 10) return 'high';
  if ((accidentRatePct || 0) > 1 || docsCount > 4) return 'medium';
  return 'low';
}

function durationFromComplexity(c: ScenarioMetadata['complexity']): string {
  switch (c) {
    case 'low': return '2-4min';
    case 'medium': return '3-6min';
    case 'high': return '5-8min';
    case 'critical': return '6-12min';
    default: return '3-5min';
  }
}

function coalesceRegulations(regs?: string[]): string[] {
  const defaults = ['LMRSST', 'RSST', 'CSTC'];
  if (!regs || regs.length === 0) return defaults;
  const set = new Set([...regs, ...defaults]);
  return Array.from(set);
}

/**
 * Génère un prompt spécialisé pour un agent donné en fonction du scénario
 */
export function buildAgentPrompt(agentName: string, meta: Partial<ScenarioMetadata>): string {
  const base = `AGENT: ${agentName}\nCONTEXT: Scénario SST sur "${meta.title || meta.thematic}" - secteur: ${meta.sector || 'général'}\nOBJECTIF: Générer contribution agent spécialisée pour production vidéo de formation.`;
  let roleSpec = '';
  switch (agentName) {
    case 'Hugo':
      roleSpec = 'Rôle: narrateur pédagogique, structurer le script, définir segments et transitions.';
      break;
    case 'DiagSST':
      roleSpec = 'Rôle: diagnostic des risques, identifier scénarios d'incidents probables, mesures correctives.';
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
      roleSpec = 'Rôle: alerter sur urgences, protocoles d'intervention immédiate.';
      break;
    case 'DocuGen':
      roleSpec = 'Rôle: générer éléments de documentation (checklists, fiches techniques, résumé PDF).';
      break;
    case 'CoSS':
      roleSpec = 'Rôle: produire métriques sécurité et KPIs, et proposer objectif de suivi.';
      break;
    default:
      roleSpec = 'Rôle: contribution générique spécialisée SST.';
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

/**
 * Génère scénarios à partir des métadonnées DocuAnalyzer
 * VERSION BROWSER - sans écriture de fichier automatique
 */
export function generateScenariosFromDocuAnalyzer(
  docs: DocuAnalyzerMeta[],
  safetyGraph?: SafetyGraphRecord[],
  options: GeneratorOptions = {}
): ScenarioMetadata[] {
  const minScenarios = options.minScenarios || 100;

  // Agrégation docs par sector + thematic
  const bucket = new Map<string, DocuAnalyzerMeta[]>();
  for (const d of docs) {
    const key = `${d.sector || 'general'}::${d.thematic || d.category || 'unknown'}`;
    if (!bucket.has(key)) bucket.set(key, []);
    bucket.get(key)!.push(d);
  }

  // Index safetyGraph par sector+thematic/scian
  const sgIndex = new Map<string, SafetyGraphRecord>();
  (safetyGraph || []).forEach(r => {
    const k1 = `${r.sector}::${r.thematic || ''}`.toLowerCase();
    if (!sgIndex.has(k1)) sgIndex.set(k1, r);
    if (r.scian) {
      sgIndex.set(`${r.sector}::${r.scian}`.toLowerCase(), r);
    }
  });

  const generated: ScenarioMetadata[] = [];
  let idCounter = 200; // starts after existing known ids (52,116,.. keep unique)

  // Helper to produce a single scenario from bucket + variant
  const produceScenario = (sector: string, thematic: Thématique, docsGroup: DocuAnalyzerMeta[], variantLabel?: string) => {
    const docsCount = docsGroup.length;
    const scian = docsGroup.find(d => d.scian)?.scian;
    const sgKey = `${sector}::${thematic}`.toLowerCase();
    const sgByScianKey = scian ? `${sector}::${scian}`.toLowerCase() : undefined;
    const sgRec = sgIndex.get(sgByScianKey || '') || sgIndex.get(sgKey) || undefined;

    const accidentRate = sgRec?.accidentRatePct;
    const complexity = pickComplexity(accidentRate, docsCount);
    const duration = durationFromComplexity(complexity);
    const regs = coalesceRegulations(docsGroup.flatMap(d => d.regulations || []));
    const titleBase = `${thematic.replace(/_/g, ' ')} - ${sector}`;
    const title = variantLabel ? `${titleBase} (${variantLabel})` : titleBase;
    const description = `Scénario ciblé sur ${thematic.replace(/_/g, ' ')} dans le secteur ${sector}. Basé sur ${docsCount} document(s). Objectif: formation pratique, conformité et mitigation des risques.`;

    const meta: ScenarioMetadata = {
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
      regulations: regs,
      safetyStats: sgRec ? {
        accidentsPerYear: sgRec.accidentsPerYear,
        accidentRatePct: sgRec.accidentRatePct,
        avgCostPerAccident: sgRec.avgCostPerAccident
      } : undefined,
      promptPack: {},
      createdAt: new Date().toISOString(),
      seed: `${safehash(title + (Math.random() * 10000))}`
    };

    // Build prompts per agent
    for (const a of DEFAULT_AGENTS) {
      meta.promptPack[a] = buildAgentPrompt(a, {
        title: meta.title,
        thematic: meta.thematic,
        sector: meta.sector,
        duration: meta.duration,
        complexity: meta.complexity,
        regulations: meta.regulations
      });
    }

    return meta;
  };

  // Generate one or more scenarios per bucket
  for (const [key, docsGroup] of bucket.entries()) {
    const [sector, thematicRaw] = key.split('::');
    const thematic = (thematicRaw || 'general') as Thématique;

    // Base scenario
    generated.push(produceScenario(sector, thematic, docsGroup));

    // Create 1-3 variants (angles pédagogiques) to increase count
    const variants = ['inspection', 'procédural', 'incident-response', 'sensibilisation', 'conformite'];
    const createVariants = Math.min(3, Math.max(1, Math.floor(docsGroup.length / 5)));
    for (let i = 0; i < createVariants; i++) {
      const variantLabel = variants[(safehash(sector + thematic + i) % variants.length)];
      generated.push(produceScenario(sector, thematic, docsGroup, variantLabel));
    }

    // Early stop if we already exceed minScenarios by a lot
    if (generated.length >= minScenarios * 1.5) break;
  }

  // If still not enough, synthesize cross-sector generic scenarios
  const thematicList = Array.from(new Set(docs.map(d => d.thematic)));
  const sectorList = Array.from(new Set(docs.map(d => d.sector)));
  let synthIndex = 0;
  while (generated.length < minScenarios) {
    const thematic = thematicList[synthIndex % thematicList.length] as Thématique || 'formation_sst';
    const sector = sectorList[Math.floor(safehash(String(synthIndex)) % Math.max(1, sectorList.length))] || 'multi-sector';
    // pick docsGroup if exists, else empty
    const docsGroup = docs.filter(d => d.sector === sector && d.thematic === thematic);
    generated.push(produceScenario(sector, thematic, docsGroup.length ? docsGroup : docs.slice(0, 2), `auto-${synthIndex}`));
    synthIndex++;
    if (synthIndex > 1000) break; // safety
  }

  // Final validation: enrich compliance if thematic/reglementation
  for (const s of generated) {
    if (s.thematic === 'reglementation_sst' || s.title.toLowerCase().includes('règlement') || s.description.toLowerCase().includes('réglement')) {
      if (!s.regulations.includes('LMRSST')) s.regulations.push('LMRSST');
    }
  }

  // Truncate/unique by title
  const unique = new Map<string, ScenarioMetadata>();
  for (const s of generated) unique.set(`${s.title}::${s.sector}`, s);
  const result = Array.from(unique.values());

  return result;
}

/**
 * Fonction utilitaire pour créer des métadonnées de test/démo
 */
export function createSampleDocuAnalyzerData(): DocuAnalyzerMeta[] {
  return [
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
    // Ajoutez plus de données de test selon vos besoins
  ];
}

/**
 * Données Safety Graph d'exemple
 */
export function createSampleSafetyGraphData(): SafetyGraphRecord[] {
  return [
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
    }
  ];
}

/**
 * Export JSON pour téléchargement dans le browser
 */
export function downloadScenariosAsJSON(scenarios: ScenarioMetadata[], filename = 'safevision-scenarios-generated.json') {
  const payload = {
    generatedAt: new Date().toISOString(),
    count: scenarios.length,
    scenarios
  };
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}