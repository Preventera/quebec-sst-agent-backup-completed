// Mapping secteurs vers codes SCIAN les plus courants
export const SECTOR_SCIAN_MAPPING: Record<string, Array<{code: string, label: string}>> = {
  'construction': [
    { code: '236', label: '236 - Construction de bâtiments' },
    { code: '237', label: '237 - Travaux de génie civil' },
    { code: '238', label: '238 - Entrepreneurs spécialisés' },
    { code: '2361', label: '2361 - Construction résidentielle' },
    { code: '2362', label: '2362 - Construction non résidentielle' }
  ],
  'manufacturier': [
    { code: '311', label: '311 - Fabrication d\'aliments' },
    { code: '321', label: '321 - Fabrication de produits en bois' },
    { code: '322', label: '322 - Fabrication du papier' },
    { code: '325', label: '325 - Fabrication de produits chimiques' },
    { code: '331', label: '331 - Sidérurgie' },
    { code: '332', label: '332 - Fabrication de produits métalliques' },
    { code: '333', label: '333 - Fabrication de machines' },
    { code: '336', label: '336 - Fabrication de matériel de transport' }
  ],
  'sante': [
    { code: '621', label: '621 - Services de soins ambulatoires' },
    { code: '622', label: '622 - Hôpitaux' },
    { code: '623', label: '623 - Établissements de soins infirmiers' },
    { code: '624', label: '624 - Assistance sociale' }
  ],
  'commerce': [
    { code: '441', label: '441 - Concessionnaires de véhicules automobiles' },
    { code: '445', label: '445 - Magasins d\'alimentation' },
    { code: '446', label: '446 - Magasins de produits de santé' },
    { code: '448', label: '448 - Magasins de vêtements' },
    { code: '452', label: '452 - Magasins à rayons' }
  ],
  'education': [
    { code: '611', label: '611 - Services d\'enseignement' },
    { code: '6111', label: '6111 - Écoles primaires et secondaires' },
    { code: '6112', label: '6112 - Collèges communautaires et cégeps' },
    { code: '6113', label: '6113 - Universités' }
  ],
  'transport': [
    { code: '481', label: '481 - Transport aérien' },
    { code: '482', label: '482 - Transport ferroviaire' },
    { code: '484', label: '484 - Transport par camion' },
    { code: '485', label: '485 - Transport en commun' }
  ],
  'finance': [
    { code: '521', label: '521 - Autorités monétaires' },
    { code: '522', label: '522 - Intermédiation financière' },
    { code: '523', label: '523 - Valeurs mobilières' },
    { code: '524', label: '524 - Assurances' }
  ],
  'agriculture': [
    { code: '111', label: '111 - Production végétale' },
    { code: '112', label: '112 - Élevage' },
    { code: '113', label: '113 - Foresterie et exploitation forestière' }
  ],
  'services': [
    { code: '541', label: '541 - Services professionnels' },
    { code: '561', label: '561 - Services administratifs' },
    { code: '721', label: '721 - Hébergement' },
    { code: '722', label: '722 - Services de restauration' }
  ],
  'autre': [
    { code: '811', label: '811 - Réparation et entretien' },
    { code: '812', label: '812 - Services personnels' },
    { code: '813', label: '813 - Organismes religieux' }
  ]
};

export function getSuggestedScianCodes(sector: string): Array<{code: string, label: string}> {
  return SECTOR_SCIAN_MAPPING[sector] || [];
}

export function getScianDescription(scianCode: string): string {
  for (const codes of Object.values(SECTOR_SCIAN_MAPPING)) {
    const found = codes.find(item => item.code === scianCode);
    if (found) return found.label;
  }
  return scianCode;
}