/**
 * Articles critiques CSTC (Code Sécurité Travaux Construction)
 * Dataset statique pour quick win construction
 */

export interface CSTCArticle {
  id: string;
  numero: string;
  titre: string;
  contenu: string;
  section: string;
  obligations: string[];
  seuils: {
    travailleurs?: number;
    hauteur?: number;
    duree?: string;
  };
  sanctions: {
    employeur: string;
    dirigeant: string;
  };
  references_croisees: {
    lmrsst: string[];
    normes: string[];
  };
  secteurs_scian: string[];
  tags: string[];
  derniere_maj: string;
}

export const CSTC_ARTICLES_CRITIQUES: CSTCArticle[] = [
  {
    id: "cstc_2_9_1",
    numero: "Art. 2.9.1",
    titre: "Protection contre les chutes",
    contenu: "Tout travailleur doit être protégé contre les chutes dans les cas suivants: 1° s'il est exposé à une chute de plus de 3 m de sa position de travail;",
    section: "Section II - Dispositions générales",
    obligations: [
      "Protection obligatoire >3m hauteur",
      "Équipements protection individuelle",
      "Formation utilisation EPI",
      "Inspection quotidienne équipements"
    ],
    seuils: {
      hauteur: 3,  // mètres
      travailleurs: 1
    },
    sanctions: {
      employeur: "1400$ - 7000$ (récidive: double)",
      dirigeant: "350$ - 1750$ (récidive: double)"
    },
    references_croisees: {
      lmrsst: ["Art. 51 (mesures protection)", "Art. 223 (sanctions)"],
      normes: ["CSA Z259.10", "CSA Z259.11"]
    },
    secteurs_scian: ["2361", "2362", "2371", "2381", "2383"],
    tags: ["chutes", "hauteur", "EPI", "construction", "critique"],
    derniere_maj: "2025-01-01"
  },
  {
    id: "cstc_2_4_1",
    numero: "Art. 2.4.1",
    titre: "Obligations générales du maître d'œuvre",
    contenu: "Le maître d'œuvre doit transmettre à la Commission [...] un avis écrit d'ouverture d'un chantier de construction, au moins 10 jours avant le début des activités",
    section: "Section II - Dispositions générales", 
    obligations: [
      "Avis écrit CNESST obligatoire",
      "Délai minimum 10 jours",
      "Information nombre travailleurs prévus",
      "Classification risque élevé si applicable"
    ],
    seuils: {
      travailleurs: 20,  // Seuil comité SST
      duree: "10 jours"
    },
    sanctions: {
      employeur: "1400$ - 7000$ (défaut avis)",
      dirigeant: "350$ - 1750$ (défaut avis)"
    },
    references_croisees: {
      lmrsst: ["Art. 90 (comité SST)", "Art. 68-70 (représentant)"],
      normes: ["Guide CNESST chantiers construction"]
    },
    secteurs_scian: ["2361", "2362", "2371", "2381", "2383"],
    tags: ["avis", "CNESST", "maître-œuvre", "comité-SST", "obligatoire"],
    derniere_maj: "2025-01-01"
  },
  {
    id: "cstc_2_8_1", 
    numero: "Art. 2.8.1",
    titre: "Contrôle circulation chantier",
    contenu: "Lorsqu'il est prévu que les activités sur un chantier de construction occuperont simultanément au moins 10 travailleurs de la construction, [...] le maître d'oeuvre doit élaborer un plan de circulation",
    section: "Section II - Dispositions générales",
    obligations: [
      "Plan circulation obligatoire ≥10 travailleurs", 
      "Signalisation adéquate",
      "Contrôle accès zones dangereuses",
      "Formation signaleurs si requis"
    ],
    seuils: {
      travailleurs: 10  // Seuil plan circulation
    },
    sanctions: {
      employeur: "700$ - 3500$ (défaut plan)",
      dirigeant: "175$ - 875$ (défaut plan)"
    },
    references_croisees: {
      lmrsst: ["Art. 51.1 (mesures spécifiques)"],
      normes: ["Guide ASP Construction circulation"]
    },
    secteurs_scian: ["2361", "2362", "2371", "2381"],
    tags: ["circulation", "signalisation", "plan", "10-travailleurs"],
    derniere_maj: "2025-01-01"
  }
];

export const CSTC_METADATA = {
  version: "2025.1",
  source_officielle: "https://legisquebec.gouv.qc.ca/fr/showdoc/cr/S-2.1, r. 4",
  total_articles: 3, // Pour démarrer
  derniere_synchronisation: "2025-01-29",
  couverture_secteurs: ["2361", "2362", "2371", "2381", "2383"],
  integration_status: "ACTIVE"
};