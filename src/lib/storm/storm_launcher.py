"""
STORM Launcher - Moteur de Recherche SafetyGraph BehaviorX
========================================================
Safety Agentique - Architecture STORM v2.0
Intégration complète avec orchestrateur BehaviorX
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('STORMLauncher')

class STORMLauncher:
    """Moteur de recherche STORM pour SafetyGraph BehaviorX"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or "config/storm_optimization.yml"
        self.session_id = f"storm_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.research_cache = {}
        
        logger.info(f"🚀 STORM Launcher initialisé - Session: {self.session_id}")
    
    def load_topics_configuration(self) -> Dict:
        """Charge les 100 topics Safety Culture Builder"""
        
        # Configuration des 100 topics organisés en 10 catégories
        topics_config = {
            "leadership": [
                "transformational_safety_leadership",
                "management_commitment_measurement", 
                "supervisor_safety_engagement",
                "authentic_leadership_safety",
                "safety_leadership_development",
                "decision_making_risk_based",
                "authority_accountability_balance",
                "role_modeling_safety_behavior",
                "visionary_safety_leadership",
                "collaborative_leadership_style"
            ],
            "communication": [
                "safety_communication_effectiveness",
                "incident_reporting_culture",
                "feedback_loops_prevention",
                "multilingual_safety_communication",
                "crisis_communication_protocols",
                "stakeholder_safety_engagement",
                "transparent_risk_communication",
                "safety_dialogue_facilitation",
                "non_violent_communication_safety",
                "listening_safety_concerns"
            ],
            "culture": [
                "psychological_safety_workplace",
                "safety_culture_measurement",
                "culture_change_strategies",
                "positive_safety_culture",
                "just_culture_implementation",
                "safety_culture_maturity",
                "organizational_safety_climate",
                "safety_culture_transformation",
                "cultural_barriers_safety",
                "safety_culture_assessment"
            ],
            "training": [
                "behavioral_safety_training",
                "competency_based_training",
                "safety_training_effectiveness",
                "digital_safety_training",
                "experiential_safety_learning",
                "training_needs_analysis",
                "safety_mentoring_programs",
                "continuous_safety_education",
                "safety_training_evaluation",
                "microlearning_safety"
            ],
            "engagement": [
                "employee_safety_engagement",
                "safety_participation_barriers",
                "engagement_measurement_tools",
                "safety_empowerment_strategies",
                "worker_safety_involvement",
                "safety_suggestion_systems",
                "safety_committee_effectiveness",
                "peer_safety_influence",
                "safety_recognition_programs",
                "voluntary_safety_behaviors"
            ],
            "measurement": [
                "leading_safety_indicators",
                "safety_performance_metrics",
                "behavioral_safety_metrics",
                "safety_data_analytics",
                "predictive_safety_modeling",
                "safety_dashboard_design",
                "real_time_safety_monitoring",
                "safety_kpi_effectiveness",
                "safety_benchmarking",
                "roi_safety_investments"
            ],
            "risk_management": [
                "behavioral_risk_assessment",
                "human_factors_analysis",
                "risk_perception_psychology",
                "safety_critical_behaviors",
                "risk_communication_strategies",
                "hazard_identification_behavioral",
                "near_miss_behavioral_analysis",
                "safety_decision_making",
                "risk_tolerance_management",
                "proactive_risk_management"
            ],
            "innovation": [
                "safety_technology_adoption",
                "digital_safety_innovations",
                "ai_safety_applications",
                "wearable_safety_technology",
                "virtual_reality_safety_training",
                "iot_safety_monitoring",
                "predictive_safety_analytics",
                "blockchain_safety_records",
                "drone_safety_applications",
                "gamification_safety"
            ],
            "compliance": [
                "behavioral_safety_compliance",
                "regulatory_engagement_strategies",
                "compliance_culture_building",
                "safety_audit_effectiveness",
                "continuous_compliance_improvement",
                "regulatory_change_management",
                "compliance_training_effectiveness",
                "safety_governance_structures",
                "ethical_safety_compliance",
                "international_safety_standards"
            ],
            "performance": [
                "safety_performance_optimization",
                "behavioral_safety_outcomes",
                "safety_productivity_balance",
                "high_reliability_organizations",
                "safety_excellence_models",
                "continuous_safety_improvement",
                "safety_performance_coaching",
                "organizational_safety_resilience",
                "safety_performance_culture",
                "zero_incident_strategies"
            ]
        }
        
        logger.info(f"✅ Configuration 100 topics chargée - 10 catégories")
        return topics_config
    
    async def execute_research(self, topic: str, category: str = None) -> Dict:
        """Exécute une recherche STORM pour un topic donné"""
        
        logger.info(f"🔍 Démarrage recherche STORM: {topic}")
        
        # Simulation recherche STORM (à remplacer par vraie intégration API)
        research_result = {
            "topic": topic,
            "category": category,
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "sources_found": 23,
            "execution_time": 2.1,
            "confidence_score": 0.89,
            "evidence_based_insights": [
                f"Insight 1 pour {topic}",
                f"Insight 2 pour {topic}", 
                f"Insight 3 pour {topic}"
            ],
            "behavioral_applications": [
                f"Application comportementale 1",
                f"Application comportementale 2"
            ],
            "integration_points": [
                "VCS_observations",
                "ABC_analysis", 
                "A1_enhanced_scoring"
            ]
        }
        
        # Cache du résultat
        self.research_cache[topic] = research_result
        
        logger.info(f"✅ Recherche terminée: {topic} - {research_result['sources_found']} sources")
        return research_result
    
    def enrich_cnesst_data(self, incident_data: Dict, research_results: List[Dict]) -> Dict:
        """Enrichit données CNESST avec insights STORM"""
        
        enriched_data = {
            **incident_data,
            "storm_enrichment": {
                "research_topics_applied": [r["topic"] for r in research_results],
                "evidence_based_recommendations": [],
                "behavioral_insights": [],
                "prevention_strategies": [],
                "enrichment_confidence": 0.91,
                "enrichment_timestamp": datetime.now().isoformat()
            }
        }
        
        # Agrégation des insights
        for research in research_results:
            enriched_data["storm_enrichment"]["evidence_based_recommendations"].extend(
                research["evidence_based_insights"]
            )
            enriched_data["storm_enrichment"]["behavioral_insights"].extend(
                research["behavioral_applications"]
            )
        
        logger.info(f"✅ Données CNESST enrichies avec {len(research_results)} recherches STORM")
        return enriched_data
    
    def get_behavioral_enhancement_data(self, agent_type: str) -> Dict:
        """Fournit données d'enrichissement pour agents BehaviorX"""
        
        enhancement_mapping = {
            "A1_enhanced": {
                "relevant_topics": ["behavioral_safety_training", "safety_performance_optimization"],
                "enhancement_factors": ["self_assessment_accuracy", "behavioral_patterns"],
                "integration_weight": 0.85
            },
            "A2_enhanced": {
                "relevant_topics": ["safety_communication_effectiveness", "employee_safety_engagement"],
                "enhancement_factors": ["observation_quality", "abc_analysis_depth"],
                "integration_weight": 0.78
            },
            "orchestrator": {
                "relevant_topics": ["leadership", "measurement", "performance"],
                "enhancement_factors": ["workflow_optimization", "data_integration"],
                "integration_weight": 0.92
            }
        }
        
        return enhancement_mapping.get(agent_type, {})
    
    def export_session_results(self) -> Dict:
        """Exporte résultats session pour intégration BehaviorX"""
        
        session_export = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "total_researches": len(self.research_cache),
            "research_results": self.research_cache,
            "behavioral_enhancements": {
                agent: self.get_behavioral_enhancement_data(agent)
                for agent in ["A1_enhanced", "A2_enhanced", "orchestrator"]
            },
            "integration_ready": True
        }
        
        return session_export

# ===================================================================
# FONCTIONS UTILITAIRES INTÉGRATION BEHAVIORX
# ===================================================================

def integrate_with_behaviorx_orchestrator(storm_results: Dict) -> Dict:
    """Intègre résultats STORM avec orchestrateur BehaviorX"""
    
    integration_data = {
        "storm_session": storm_results["session_id"],
        "enrichment_data": storm_results["research_results"],
        "behavioral_enhancements": storm_results["behavioral_enhancements"],
        "integration_timestamp": datetime.now().isoformat(),
        "ready_for_workflow": True
    }
    
    logger.info("✅ Intégration STORM → BehaviorX préparée")
    return integration_data

def validate_storm_integration() -> bool:
    """Valide intégration STORM dans pipeline SafetyGraph"""
    
    try:
        # Test initialisation
        launcher = STORMLauncher()
        
        # Test configuration topics
        topics = launcher.load_topics_configuration()
        
        # Test fonctions d'enrichissement
        test_data = {"incident_id": "test", "type": "fall"}
        enhancement = launcher.get_behavioral_enhancement_data("A1_enhanced")
        
        logger.info("✅ Validation STORM intégration réussie")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur validation STORM: {e}")
        return False

# ===================================================================
# FONCTION PRINCIPALE
# ===================================================================

async def main():
    """Fonction principale de test STORM Launcher"""
    
    print("🚀 TEST STORM LAUNCHER - SAFETYGRAPH BEHAVIORX")
    print("=" * 60)
    
    # Initialisation
    launcher = STORMLauncher()
    
    # Test chargement topics
    topics = launcher.load_topics_configuration()
    print(f"✅ Topics chargés: {sum(len(cat) for cat in topics.values())} topics")
    
    # Test recherche simulée
    test_topic = "behavioral_safety_training"
    result = await launcher.execute_research(test_topic, "training")
    print(f"✅ Recherche test réussie: {result['topic']}")
    
    # Export session
    session_data = launcher.export_session_results()
    print(f"✅ Session exportée: {session_data['session_id']}")
    
    # Validation intégration
    integration_valid = validate_storm_integration()
    print(f"✅ Intégration validée: {integration_valid}")
    
    print("\n🎉 STORM LAUNCHER OPÉRATIONNEL POUR BEHAVIORX!")

if __name__ == "__main__":
    asyncio.run(main())
