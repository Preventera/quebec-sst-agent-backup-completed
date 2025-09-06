# Agent AN1 - Analyste Écarts SafetyAgentic
# ===========================================
# Analyse écarts entre autoévaluations (A1) et observations terrain (A2)
# pour identifier zones aveugles culture sécurité

import asyncio
from typing import Dict, List, Tuple, Optional
import numpy as np
import logging
from datetime import datetime
import json

# Configuration logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SafetyAgentic.AN1")

class AN1AnalysteEcarts:
    """
    Agent AN1 - Analyste des Écarts Culture Sécurité
    
    Fonctions principales:
    1. Analyser écarts A1 (autoévaluation) vs A2 (observation terrain)
    2. Identifier zones aveugles culture sécurité
    3. Appliquer 12 modèles HSE simultanément (HFACS, Swiss Cheese, etc.)
    4. Calculer scores de réalisme culturel
    5. Générer recommandations ciblées
    """
    
    def __init__(self):
        """Initialisation Agent AN1"""
        self.agent_id = "AN1"
        self.agent_name = "Analyste Écarts"
        self.version = "1.0.0"
        
        # Modèles HSE intégrés
        self.hse_models = {
            "hfacs_l1": "Échecs organisationnels",
            "hfacs_l2": "Supervision inadéquate", 
            "hfacs_l3": "Actes/conditions précurseurs",
            "hfacs_l4": "Actes/conditions dangereux",
            "swiss_cheese": "Défaillances barrières",
            "srk": "Niveaux comportement (Skill-Rule-Knowledge)",
            "reason": "Erreurs actives vs latentes",
            "bow_tie": "Analyse barrières préventives/protectives",
            "tripod": "Causes racines organisationnelles",
            "domino": "Séquence causale incidents",
            "icam": "Investigation causale avancée",
            "stamp": "Analyse systémique complexe"
        }
        
        # Seuils d'écarts critiques
        self.ecart_thresholds = {
            "faible": 10,      # Écart < 10% = acceptable
            "modere": 25,      # Écart 10-25% = à surveiller
            "eleve": 50,       # Écart 25-50% = critique
            "critique": 100    # Écart > 50% = zone aveugle majeure
        }
        
        logger.info(f"🤖 Agent {self.agent_id} ({self.agent_name}) initialisé")
    
    async def process(self, data_a1: Dict, data_a2: Dict, context: Dict = None) -> Dict:
        """
        Traitement principal: analyser écarts A1 vs A2
        
        Args:
            data_a1: Résultats agent A1 (autoévaluations)
            data_a2: Résultats agent A2 (observations terrain)
            context: Contexte incident/secteur/organisation
            
        Returns:
            Dict avec analyse complète des écarts
        """
        start_time = datetime.now()
        logger.info("🔄 Démarrage traitement Agent AN1")
        
        try:
            # 1. Validation données d'entrée
            self._validate_input_data(data_a1, data_a2)
            logger.info("✅ Validation des données d'entrée réussie")
            
            # 2. Calcul écarts variables culture SST
            ecarts_variables = self._calculate_culture_gaps(data_a1, data_a2)
            
            # 3. Application des 12 modèles HSE
            analysis_hse = self._apply_hse_models(ecarts_variables, context)
            
            # 4. Identification zones aveugles
            zones_aveugles = self._identify_blind_spots(ecarts_variables)
            
            # 5. Calcul scores réalisme culturel
            realisme_scores = self._calculate_realism_scores(data_a1, data_a2)
            
            # 6. Génération recommandations ciblées
            recommendations = self._generate_targeted_recommendations(
                ecarts_variables, zones_aveugles, analysis_hse
            )
            
            # 7. Calcul métriques performance
            performance_time = (datetime.now() - start_time).total_seconds()
            confidence_score = self._calculate_confidence_score(ecarts_variables)
            
            logger.info(f"📊 Performance AN1: {performance_time:.2f}s, confidence: {confidence_score:.2f}")
            
            # 8. Construction résultat final
            result = {
                "agent_info": {
                    "agent_id": self.agent_id,
                    "agent_name": self.agent_name,
                    "version": self.version,
                    "timestamp": datetime.now().isoformat(),
                    "performance_time": performance_time,
                    "confidence_score": confidence_score
                },
                "ecarts_analysis": {
                    "ecarts_variables": ecarts_variables,
                    "zones_aveugles": zones_aveugles,
                    "realisme_scores": realisme_scores,
                    "nombre_ecarts_critiques": len([e for e in ecarts_variables.values() if e.get("niveau") == "critique"])
                },
                "hse_models_analysis": analysis_hse,
                "recommendations": recommendations,
                "summary": {
                    "ecart_moyen": np.mean([e.get("pourcentage", 0) for e in ecarts_variables.values()]),
                    "variables_critiques": len(zones_aveugles),
                    "actions_recommandees": len(recommendations),
                    "priorite_intervention": self._determine_intervention_priority(zones_aveugles)
                }
            }
            
            logger.info(f"✅ Agent AN1 terminé - Score confiance: {confidence_score:.2f}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Erreur Agent AN1: {str(e)}")
            return {"error": str(e), "agent_id": self.agent_id}
    
    def _validate_input_data(self, data_a1: Dict, data_a2: Dict):
        """Validation des données A1 et A2"""
        if not data_a1 or not data_a2:
            raise ValueError("Données A1 ou A2 manquantes")
        
        # Vérifier présence variables culture SST
        required_a1 = ["variables_culture_sst", "scores_autoeval"]
        required_a2 = ["variables_culture_terrain", "observations"]
        
        for field in required_a1:
            if field not in data_a1:
                raise ValueError(f"Champ manquant A1: {field}")
                
        for field in required_a2:
            if field not in data_a2:
                raise ValueError(f"Champ manquant A2: {field}")
    
    def _calculate_culture_gaps(self, data_a1: Dict, data_a2: Dict) -> Dict:
        """Calcul écarts entre variables culture A1 vs A2"""
        ecarts = {}
        
        # Variables A1 (autoévaluation)
        vars_a1 = data_a1.get("variables_culture_sst", {})
        vars_a2 = data_a2.get("variables_culture_terrain", {})
        
        # Analyser chaque variable commune
        for variable in set(vars_a1.keys()).intersection(set(vars_a2.keys())):
            score_a1 = vars_a1[variable].get("score", 0)
            score_a2 = vars_a2[variable].get("score", 0)
            
            # Calcul écart relatif
            if score_a1 > 0:
                ecart_pct = abs(score_a1 - score_a2) / score_a1 * 100
            else:
                ecart_pct = abs(score_a2) * 10  # Pénalité si A1=0 mais A2>0
            
            # Classification niveau écart
            if ecart_pct < self.ecart_thresholds["faible"]:
                niveau = "faible"
            elif ecart_pct < self.ecart_thresholds["modere"]:
                niveau = "modere"
            elif ecart_pct < self.ecart_thresholds["eleve"]:
                niveau = "eleve"
            else:
                niveau = "critique"
            
            ecarts[variable] = {
                "score_autoeval": score_a1,
                "score_terrain": score_a2,
                "ecart_absolu": abs(score_a1 - score_a2),
                "pourcentage": ecart_pct,
                "niveau": niveau,
                "direction": "surestimation" if score_a1 > score_a2 else "sous_estimation",
                "variable_source_a1": vars_a1[variable].get("source", "unknown"),
                "variable_source_a2": vars_a2[variable].get("source", "unknown")
            }
        
        return ecarts
    
    def _apply_hse_models(self, ecarts_variables: Dict, context: Dict = None) -> Dict:
        """Application des 12 modèles HSE sur les écarts"""
        hse_analysis = {}
        
        for model_code, model_name in self.hse_models.items():
            if model_code.startswith("hfacs"):
                analysis = self._apply_hfacs_model(model_code, ecarts_variables, context)
            elif model_code == "swiss_cheese":
                analysis = self._apply_swiss_cheese_model(ecarts_variables, context)
            elif model_code == "srk":
                analysis = self._apply_srk_model(ecarts_variables, context)
            elif model_code == "bow_tie":
                analysis = self._apply_bow_tie_model(ecarts_variables, context)
            else:
                # Analyse générique pour autres modèles
                analysis = self._apply_generic_hse_model(model_code, ecarts_variables, context)
            
            hse_analysis[model_code] = {
                "model_name": model_name,
                "analysis": analysis,
                "variables_impliquees": len([v for v in ecarts_variables.keys() if ecarts_variables[v]["niveau"] in ["eleve", "critique"]]),
                "score_applicabilite": self._calculate_model_applicability(model_code, ecarts_variables)
            }
        
        return hse_analysis
    
    def _apply_hfacs_model(self, level: str, ecarts: Dict, context: Dict) -> Dict:
        """Application modèle HFACS selon niveau"""
        hfacs_mapping = {
            "hfacs_l1": ["leadership_sst", "politique_securite", "ressources_securite"],
            "hfacs_l2": ["supervision_directe", "formation_superviseurs", "communication_risques"],
            "hfacs_l3": ["usage_epi", "respect_procedures", "maintenance_equipements"],
            "hfacs_l4": ["comportements_risque", "erreurs_execution", "violations_regles"]
        }
        
        variables_concernees = hfacs_mapping.get(level, [])
        ecarts_niveau = {v: ecarts[v] for v in variables_concernees if v in ecarts}
        
        return {
            "niveau_hfacs": level,
            "variables_analysees": len(ecarts_niveau),
            "ecarts_critiques": len([e for e in ecarts_niveau.values() if e["niveau"] == "critique"]),
            "score_defaillance": np.mean([e["pourcentage"] for e in ecarts_niveau.values()]) if ecarts_niveau else 0,
            "actions_recommandees": self._generate_hfacs_actions(level, ecarts_niveau)
        }
    
    def _apply_swiss_cheese_model(self, ecarts: Dict, context: Dict) -> Dict:
        """Application modèle Swiss Cheese - analyse défaillances barrières"""
        barrieres = {
            "barrieres_organisationnelles": ["politique_securite", "formation_securite", "audit_securite"],
            "barrieres_supervision": ["supervision_directe", "controle_epi", "inspection_equipements"],
            "barrieres_individuelles": ["competences_securite", "motivation_securite", "perception_risque"],
            "barrieres_techniques": ["equipements_protection", "systemes_alerte", "maintenance_preventive"]
        }
        
        defaillances = {}
        for barriere_type, variables in barrieres.items():
            ecarts_barriere = {v: ecarts[v] for v in variables if v in ecarts}
            defaillance_score = np.mean([e["pourcentage"] for e in ecarts_barriere.values()]) if ecarts_barriere else 0
            
            defaillances[barriere_type] = {
                "score_defaillance": defaillance_score,
                "variables_impliquees": list(ecarts_barriere.keys()),
                "niveau_risque": "high" if defaillance_score > 30 else "medium" if defaillance_score > 15 else "low"
            }
        
        return {
            "defaillances_barrieres": defaillances,
            "risque_global": max([d["score_defaillance"] for d in defaillances.values()]) if defaillances else 0,
            "barrieres_critiques": [k for k, v in defaillances.items() if v["niveau_risque"] == "high"]
        }
    
    def _apply_srk_model(self, ecarts: Dict, context: Dict) -> Dict:
        """Application modèle SRK (Skill-Rule-Knowledge)"""
        srk_mapping = {
            "skill": ["competences_techniques", "automatismes_securite", "reflexes_urgence"],
            "rule": ["respect_procedures", "application_consignes", "suivi_protocoles"],
            "knowledge": ["comprehension_risques", "analyse_situations", "prise_decision"]
        }
        
        srk_analysis = {}
        for niveau, variables in srk_mapping.items():
            ecarts_niveau = {v: ecarts[v] for v in variables if v in ecarts}
            score_ecart = np.mean([e["pourcentage"] for e in ecarts_niveau.values()]) if ecarts_niveau else 0
            
            srk_analysis[niveau] = {
                "score_ecart": score_ecart,
                "variables_count": len(ecarts_niveau),
                "defaillance_principale": max(ecarts_niveau.items(), key=lambda x: x[1]["pourcentage"])[0] if ecarts_niveau else None
            }
        
        return srk_analysis
    
    def _apply_bow_tie_model(self, ecarts: Dict, context: Dict) -> Dict:
        """Application modèle Bow-Tie - barrières préventives vs protectives"""
        return {
            "barrieres_preventives": {
                "formation": ecarts.get("formation_securite", {}).get("pourcentage", 0),
                "procedures": ecarts.get("respect_procedures", {}).get("pourcentage", 0),
                "supervision": ecarts.get("supervision_directe", {}).get("pourcentage", 0)
            },
            "barrieres_protectives": {
                "epi": ecarts.get("usage_epi", {}).get("pourcentage", 0),
                "systemes_urgence": ecarts.get("procedures_urgence", {}).get("pourcentage", 0),
                "premiers_secours": ecarts.get("formation_secours", {}).get("pourcentage", 0)
            }
        }
    
    def _apply_generic_hse_model(self, model_code: str, ecarts: Dict, context: Dict) -> Dict:
        """Analyse générique pour autres modèles HSE"""
        return {
            "model_code": model_code,
            "variables_analysees": len(ecarts),
            "score_global": np.mean([e["pourcentage"] for e in ecarts.values()]) if ecarts else 0,
            "applicable": True
        }
    
    def _identify_blind_spots(self, ecarts_variables: Dict) -> List[Dict]:
        """Identification zones aveugles culture sécurité"""
        zones_aveugles = []
        
        for variable, ecart_data in ecarts_variables.items():
            if ecart_data["niveau"] in ["eleve", "critique"]:
                zone_aveugle = {
                    "variable": variable,
                    "type_ecart": ecart_data["direction"],
                    "pourcentage_ecart": ecart_data["pourcentage"],
                    "niveau_critique": ecart_data["niveau"],
                    "score_autoeval": ecart_data["score_autoeval"],
                    "score_terrain": ecart_data["score_terrain"],
                    "explication": self._explain_blind_spot(variable, ecart_data),
                    "impact_potentiel": self._assess_blind_spot_impact(variable, ecart_data)
                }
                zones_aveugles.append(zone_aveugle)
        
        # Trier par impact potentiel
        zones_aveugles.sort(key=lambda x: x["pourcentage_ecart"], reverse=True)
        return zones_aveugles
    
    def _explain_blind_spot(self, variable: str, ecart_data: Dict) -> str:
        """Explication textuelle de la zone aveugle"""
        direction = ecart_data["direction"]
        pct = ecart_data["pourcentage"]
        
        if direction == "surestimation":
            return f"Surestimation de {pct:.1f}% sur {variable}. L'équipe pense mieux performer qu'en réalité."
        else:
            return f"Sous-estimation de {pct:.1f}% sur {variable}. Performance terrain supérieure aux perceptions."
    
    def _assess_blind_spot_impact(self, variable: str, ecart_data: Dict) -> str:
        """Évaluation impact potentiel zone aveugle"""
        variable_criticality = {
            "usage_epi": "high",
            "respect_procedures": "high", 
            "supervision_directe": "high",
            "formation_securite": "medium",
            "communication_risques": "medium",
            "maintenance_equipements": "high"
        }
        
        criticality = variable_criticality.get(variable, "medium")
        ecart_level = ecart_data["niveau"]
        
        if criticality == "high" and ecart_level == "critique":
            return "CRITIQUE - Risque incident majeur"
        elif criticality == "high" or ecart_level == "critique":
            return "ÉLEVÉ - Intervention urgente requise"
        else:
            return "MODÉRÉ - Surveillance renforcée"
    
    def _calculate_realism_scores(self, data_a1: Dict, data_a2: Dict) -> Dict:
        """Calcul scores réalisme culturel"""
        scores_a1 = data_a1.get("scores_autoeval", {})
        observations_a2 = data_a2.get("observations", {})
        
        # Score réalisme global
        realisme_global = max(0, 100 - np.mean([
            abs(scores_a1.get("score_global", 50) - observations_a2.get("score_comportement", 50))
        ]))
        
        return {
            "realisme_global": realisme_global,
            "fiabilite_autoeval": min(100, realisme_global + 10),  # Bonus fiabilité
            "coherence_perception": realisme_global,
            "niveau_autocritique": "élevé" if realisme_global > 80 else "moyen" if realisme_global > 60 else "faible"
        }
    
    def _generate_targeted_recommendations(self, ecarts: Dict, zones_aveugles: List, hse_analysis: Dict) -> List[Dict]:
        """Génération recommandations ciblées"""
        recommendations = []
        
        # Recommandations par zone aveugle
        for zone in zones_aveugles[:5]:  # Top 5 priorités
            rec = {
                "type": "zone_aveugle",
                "priorite": "URGENTE" if zone["niveau_critique"] == "critique" else "ÉLEVÉE",
                "variable_cible": zone["variable"],
                "action": f"Corriger écart {zone['type_ecart']} de {zone['pourcentage_ecart']:.1f}% sur {zone['variable']}",
                "methode": self._recommend_correction_method(zone["variable"], zone["type_ecart"]),
                "timeline": "2-4 semaines" if zone["niveau_critique"] == "critique" else "1-2 mois",
                "ressources_requises": self._estimate_resources(zone["variable"], zone["pourcentage_ecart"])
            }
            recommendations.append(rec)
        
        # Recommandations HSE générales
        for model, analysis in hse_analysis.items():
            if analysis.get("score_applicabilite", 0) > 70:
                rec = {
                    "type": "hse_model",
                    "modele": model,
                    "priorite": "MOYENNE",
                    "action": f"Renforcer selon modèle {analysis['model_name']}",
                    "variables_impliquees": analysis.get("variables_impliquees", 0)
                }
                recommendations.append(rec)
        
        return recommendations
    
    def _recommend_correction_method(self, variable: str, direction: str) -> str:
        """Recommandation méthode correction selon variable et direction écart"""
        methods = {
            "usage_epi": {
                "surestimation": "Observations terrain ciblées + formations pratiques",
                "sous_estimation": "Sensibilisation performance + reconnaissance efforts"
            },
            "respect_procedures": {
                "surestimation": "Audit conformité + coaching superviseurs",
                "sous_estimation": "Communication succès + valorisation bonnes pratiques"
            },
            "formation_securite": {
                "surestimation": "Évaluation compétences + formations complémentaires",
                "sous_estimation": "Certification compétences + reconnaissance expertise"
            }
        }
        
        return methods.get(variable, {}).get(direction, "Formation ciblée + suivi renforcé")
    
    def _estimate_resources(self, variable: str, ecart_pct: float) -> str:
        """Estimation ressources requises pour correction"""
        if ecart_pct > 50:
            return "Ressources importantes - Formation complète équipe"
        elif ecart_pct > 25:
            return "Ressources modérées - Formation superviseurs + coaching"
        else:
            return "Ressources limitées - Sensibilisation ciblée"
    
    def _calculate_model_applicability(self, model_code: str, ecarts: Dict) -> float:
        """Calcul score applicabilité modèle selon écarts"""
        # Score basé sur nombre variables concernées et niveau écarts
        variables_critiques = len([e for e in ecarts.values() if e["niveau"] in ["eleve", "critique"]])
        total_variables = len(ecarts) if ecarts else 1
        
        return min(100, (variables_critiques / total_variables) * 100 + 20)
    
    def _calculate_confidence_score(self, ecarts_variables: Dict) -> float:
        """Calcul score confiance global analyse"""
        if not ecarts_variables:
            return 0.5
        
        # Score basé sur cohérence et nombre variables analysées
        coherence = np.mean([1 - (e["pourcentage"] / 100) for e in ecarts_variables.values()])
        completude = min(1.0, len(ecarts_variables) / 10)  # Optimal à 10+ variables
        
        return max(0.3, min(0.95, (coherence * 0.7) + (completude * 0.3)))
    
    def _determine_intervention_priority(self, zones_aveugles: List) -> str:
        """Détermination priorité intervention globale"""
        if not zones_aveugles:
            return "FAIBLE"
        
        critiques = len([z for z in zones_aveugles if z["niveau_critique"] == "critique"])
        eleves = len([z for z in zones_aveugles if z["niveau_critique"] == "eleve"])
        
        if critiques >= 3:
            return "URGENTE"
        elif critiques >= 1 or eleves >= 5:
            return "ÉLEVÉE"
        elif eleves >= 2:
            return "MOYENNE"
        else:
            return "FAIBLE"
    
    def _generate_hfacs_actions(self, level: str, ecarts_niveau: Dict) -> List[str]:
        """Génération actions HFACS selon niveau"""
        actions_map = {
            "hfacs_l1": [
                "Réviser politique sécurité organisationnelle",
                "Renforcer engagement leadership sécurité",
                "Augmenter ressources dédiées SST"
            ],
            "hfacs_l2": [
                "Former superviseurs à l'encadrement sécurité",
                "Structurer rondes sécurité systématiques",
                "Améliorer communication descendante risques"
            ],
            "hfacs_l3": [
                "Contrôler application procédures terrain",
                "Vérifier port EPI systématiquement",
                "Renforcer maintenance préventive"
            ],
            "hfacs_l4": [
                "Sensibiliser comportements à risque",
                "Corriger erreurs d'exécution répétées",
                "Sanctionner violations délibérées"
            ]
        }
        
        base_actions = actions_map.get(level, ["Action générique selon niveau"])
        
        # Personnaliser selon écarts détectés
        if ecarts_niveau:
            variable_critique = max(ecarts_niveau.items(), key=lambda x: x[1]["pourcentage"])[0]
            base_actions.append(f"Focus prioritaire sur: {variable_critique}")
        
        return base_actions[:3]  # Max 3 actions par niveau


# Test fonctionnel AN1
async def test_an1_analyste_ecarts():
    """Test fonctionnel Agent AN1 avec données simulées"""
    
    print("🧪 TEST AGENT AN1 - ANALYSTE ÉCARTS")
    print("=" * 40)
    
    # Données simulées A1 (autoévaluations)
    data_a1 = {
        "variables_culture_sst": {
            "usage_epi": {"score": 8.0, "source": "questionnaire"},
            "respect_procedures": {"score": 7.5, "source": "questionnaire"},
            "formation_securite": {"score": 6.8, "source": "questionnaire"},
            "supervision_directe": {"score": 7.2, "source": "questionnaire"},
            "communication_risques": {"score": 6.5, "source": "questionnaire"}
        },
        "scores_autoeval": {
            "score_global": 72,
            "fiabilite": 0.8
        }
    }
    
    # Données simulées A2 (observations terrain)
    data_a2 = {
        "variables_culture_terrain": {
            "usage_epi": {"score": 4.2, "source": "observation_epi"},
            "respect_procedures": {"score": 5.8, "source": "procedure_compliance"},
            "formation_securite": {"score": 6.9, "source": "behavioral_analysis"},
            "supervision_directe": {"score": 3.1, "source": "hazard_detection"},
            "communication_risques": {"score": 6.0, "source": "behavioral_analysis"}
        },
        "observations": {
            "score_comportement": 51,
            "dangers_detectes": 2
        }
    }
    
    # Contexte incident
    context = {
        "secteur": "CONSTRUCTION",
        "type_incident": "CHUTE",
        "gravite": "MAJEUR"
    }
    
    # Initialiser et tester AN1
    agent_an1 = AN1AnalysteEcarts()
    result = await agent_an1.process(data_a1, data_a2, context)
    
    # Affichage résultats
    print("📊 RÉSULTATS AGENT AN1:")
    print("=" * 25)
    print(f"✅ Score confiance: {result['agent_info']['confidence_score']:.3f}")
    print(f"📊 Variables analysées: {len(result['ecarts_analysis']['ecarts_variables'])}")
    print(f"⚠️ Zones aveugles détectées: {result['ecarts_analysis']['nombre_ecarts_critiques']}")
    print(f"🎯 Modèles HSE appliqués: {len(result['hse_models_analysis'])}")
    print(f"💡 Recommandations: {len(result['recommendations'])}")
    
    # Top écarts détectés
    print("\n🎯 TOP ÉCARTS DÉTECTÉS:")
    for var, ecart in list(result['ecarts_analysis']['ecarts_variables'].items())[:3]:
        print(f"  - {var}: {ecart['pourcentage']:.1f}% ({ecart['niveau']}) - {ecart['direction']}")
    
    # Zones aveugles critiques
    print("\n⚠️ ZONES AVEUGLES CRITIQUES:")
    for zone in result['ecarts_analysis']['zones_aveugles'][:3]:
        print(f"  - {zone['variable']}: {zone['pourcentage_ecart']:.1f}% - {zone['impact_potentiel']}")
    
    # Analyse HSE
    print("\n🔬 ANALYSE MODÈLES HSE:")
    for model, analysis in list(result['hse_models_analysis'].items())[:3]:
        applicabilite = analysis.get('score_applicabilite', 0)
        print(f"  - {analysis['model_name']}: {applicabilite:.0f}% applicabilité")
    
    # Recommandations prioritaires
    print("\n💡 RECOMMANDATIONS PRIORITAIRES:")
    for rec in result['recommendations'][:3]:
        print(f"  - {rec['priorite']}: {rec['action']}")
        print(f"    → Méthode: {rec.get('methode', 'Non spécifiée')}")
        print(f"    → Timeline: {rec.get('timeline', 'Non spécifiée')}")
    
    # Summary final
    print(f"\n📋 RÉSUMÉ ANALYSE AN1:")
    print(f"  • Écart moyen: {result['summary']['ecart_moyen']:.1f}%")
    print(f"  • Variables critiques: {result['summary']['variables_critiques']}")
    print(f"  • Actions recommandées: {result['summary']['actions_recommandees']}")
    print(f"  • Priorité intervention: {result['summary']['priorite_intervention']}")
    
    print(f"\n✅ Test Agent AN1 terminé avec succès!")
    print(f"⏱️ Performance: {result['agent_info']['performance_time']:.3f}s")
    return result

# Exécution test si script appelé directement
if __name__ == "__main__":
    import asyncio
    asyncio.run(test_an1_analyste_ecarts())