// Codes SCIAN étendus pour le générateur SST québécois
export const SCIAN_CODES = [
  // Construction (23)
  { code: "2361", name: "Construction résidentielle" },
  { code: "2362", name: "Construction non résidentielle" },
  { code: "2371", name: "Construction de réseaux de transport" },
  { code: "2372", name: "Construction de réseaux d'aqueduc et d'égout" },
  { code: "2379", name: "Autres travaux de génie civil" },
  { code: "2381", name: "Travaux de fondation, de structure et d'enveloppe de bâtiment" },
  { code: "2382", name: "Services d'installation d'équipement de bâtiment" },
  { code: "2383", name: "Finition de bâtiment" },
  { code: "2389", name: "Autres entrepreneurs spécialisés" },

  // Fabrication (31-33)
  { code: "3111", name: "Fabrication d'aliments pour animaux" },
  { code: "3112", name: "Mouture de céréales et d'oléagineux" },
  { code: "3121", name: "Fabrication de boissons" },
  { code: "3141", name: "Fabrication de textiles et produits textiles" },
  { code: "3211", name: "Scieries et préservation du bois" },
  { code: "3221", name: "Fabrication de pâte, papier et produits connexes" },
  { code: "3241", name: "Fabrication de produits du pétrole et du charbon" },
  { code: "3251", name: "Fabrication de produits chimiques de base" },
  { code: "3271", name: "Fabrication d'acier à partir de minerai et d'alliages" },
  { code: "3311", name: "Fabrication de machines agricoles" },
  { code: "3321", name: "Fabrication de machines pour l'industrie forestière" },
  
  // Transport et entreposage (48-49)
  { code: "4811", name: "Transport aérien régulier" },
  { code: "4821", name: "Transport ferroviaire" },
  { code: "4831", name: "Transport par eau profonde" },
  { code: "4841", name: "Transport en commun urbain" },
  { code: "4851", name: "Transport interurbain et rural par autocar" },
  { code: "4881", name: "Services de soutien au transport aérien" },
  { code: "4911", name: "Transport postal" },
  { code: "4931", name: "Entreposage et stockage" },

  // Commerce de détail (44-45)
  { code: "4411", name: "Concessionnaires d'automobiles neuves" },
  { code: "4431", name: "Magasins d'électronique et d'électroménagers" },
  { code: "4451", name: "Épiceries" },
  { code: "4461", name: "Magasins de produits de santé et de soins personnels" },
  { code: "4481", name: "Stations-service" },
  
  // Services professionnels (54)
  { code: "5411", name: "Services juridiques" },
  { code: "5412", name: "Services de comptabilité et de tenue de livres" },
  { code: "5413", name: "Services d'architecture et de génie" },
  { code: "5414", name: "Services de design spécialisé" },
  { code: "5415", name: "Services de conception de systèmes informatiques" },
  { code: "5416", name: "Services de conseil en gestion" },
  { code: "5417", name: "Services de recherche et développement scientifiques" },
  
  // Soins de santé (62)
  { code: "6211", name: "Bureaux de médecins" },
  { code: "6212", name: "Bureaux de dentistes" },
  { code: "6213", name: "Bureaux d'autres praticiens de la santé" },
  { code: "6221", name: "Hôpitaux généraux et spécialisés" },
  { code: "6231", name: "Établissements de soins infirmiers" },
  
  // Hébergement et restauration (72)
  { code: "7211", name: "Hôtels et motels" },
  { code: "7221", name: "Restaurants à service complet" },
  { code: "7222", name: "Établissements de restauration à service restreint" },
  { code: "7223", name: "Services de traiteur et cantines mobiles" },

  // Agriculture (11)
  { code: "1111", name: "Culture du soja, de l'avoine et des autres oléagineux" },
  { code: "1121", name: "Élevage de bovins de boucherie" },
  { code: "1123", name: "Élevage de porcs" },
  { code: "1131", name: "Production d'arbres de Noël" },
  { code: "1141", name: "Pêche" },
  
  // Services publics (22)
  { code: "2211", name: "Production, transport et distribution d'électricité" },
  { code: "2212", name: "Distribution de gaz naturel" },
  { code: "2213", name: "Distribution d'eau et traitement des eaux usées" }
];

// Catégories de risques par secteur SCIAN
export const SECTEUR_RISQUES = {
  // Construction
  "23": {
    risques_principaux: ["chutes", "machinerie", "substances_dangereuses", "electricite", "excavation"],
    legislation_focus: "MIXED", // LMRSST + CSTC
    agents_recommandes: ["Hugo", "DiagSST", "Sentinelle", "LexiNorm"]
  },
  
  // Fabrication
  "31": {
    risques_principaux: ["machinerie", "substances_chimiques", "bruit", "espaces_confines", "manutention"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["DiagSST", "Sentinelle", "LexiNorm", "Hugo"]
  },
  
  // Transport
  "48": {
    risques_principaux: ["vehicules", "manutention", "fatigue", "substances_dangereuses"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "Sentinelle", "DiagSST"]
  },
  
  // Commerce
  "44": {
    risques_principaux: ["manutention", "glissades", "violence", "ergonomie"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "DiagSST", "Prioris"]
  },
  
  // Services professionnels
  "54": {
    risques_principaux: ["ergonomie", "stress", "deplacement", "bureautique"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "Prioris", "ALSS"]
  },
  
  // Santé
  "62": {
    risques_principaux: ["biologiques", "ergonomie", "violence", "substances_chimiques"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Sentinelle", "Hugo", "DiagSST", "ALSS"]
  }
};

// Fonction pour obtenir les risques par secteur
export const getRisquesBySecteur = (scianCode: string) => {
  const secteur = scianCode.substring(0, 2);
  return SECTEUR_RISQUES[secteur] || {
    risques_principaux: ["generale"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "DiagSST"]
  };
};