"""
Research Topics Manager - SafetyGraph BehaviorX STORM
===================================================
Gestionnaire des 100 sujets Safety Culture Builder
Mapping avec agents BehaviorX pour enrichissement
"""

import json
from typing import Dict, List, Set
from dataclasses import dataclass

@dataclass
class ResearchTopic:
    """Classe représentant un sujet de recherche STORM"""
    topic_id: str
    category: str
    focus: str
    agents_impacted: List[str]
    priority: int = 1
    evidence_weight: float = 1.0

class ResearchTopicsManager:
    """Gestionnaire des sujets de recherche pour BehaviorX"""
    
    def __init__(self):
        self.topics = self._initialize_topics()
        self.categories = self._get_categories()
    
    def _initialize_topics(self) -> Dict[str, ResearchTopic]:
        """Initialise les 100 topics Safety Culture Builder"""
        
        topics_data = {
            # LEADERSHIP & MANAGEMENT HSE (10 sujets)
            "transformational_safety_leadership": ResearchTopic(
                "transformational_safety_leadership",
                "leadership",
                "Leadership transformationnel en sécurité",
                ["SC", "R1", "R5"], 1, 0.95
            ),
            "management_commitment_measurement": ResearchTopic(
                "management_commitment_measurement", 
                "leadership",
                "Mesure engagement direction HSE",
                ["A1", "AN1"], 1, 0.90
            ),
            # Ajouter tous les autres topics...
            
            # COMMUNICATION & PRÉVENTION (10 sujets)
            "safety_communication_effectiveness": ResearchTopic(
                "safety_communication_effectiveness",
                "communication", 
                "Efficacité communication sécurité",
                ["R6", "R10"], 1, 0.88
            ),
            "incident_reporting_culture": ResearchTopic(
                "incident_reporting_culture",
                "communication",
                "Culture déclaration incidents", 
                ["A1", "AN1"], 1, 0.92
            ),
            
            # CULTURE & CLIMAT (10 sujets) 
            "psychological_safety_workplace": ResearchTopic(
                "psychological_safety_workplace",
                "culture",
                "Sécurité psychologique au travail",
                ["A2", "A3"], 1, 0.94
            ),
            
            # FORMATION & DÉVELOPPEMENT (10 sujets)
            "behavioral_safety_training": ResearchTopic(
                "behavioral_safety_training", 
                "training",
                "Formation sécurité comportementale",
                ["A1", "A2"], 1, 0.89
            ),
            
            # ENGAGEMENT & PARTICIPATION (10 sujets)
            "employee_safety_engagement": ResearchTopic(
                "employee_safety_engagement",
                "engagement",
                "Engagement employés sécurité",
                ["A1", "A2", "R3"], 1, 0.91
            )
        }
        
        return topics_data
    
    def _get_categories(self) -> Set[str]:
        """Retourne les catégories disponibles"""
        return set(topic.category for topic in self.topics.values())
    
    def get_topics_by_category(self, category: str) -> List[ResearchTopic]:
        """Retourne topics par catégorie"""
        return [topic for topic in self.topics.values() 
                if topic.category == category]
    
    def get_topics_for_agent(self, agent_id: str) -> List[ResearchTopic]:
        """Retourne topics pertinents pour un agent donné"""
        return [topic for topic in self.topics.values()
                if agent_id in topic.agents_impacted]
    
    def get_high_priority_topics(self, limit: int = 10) -> List[ResearchTopic]:
        """Retourne topics haute priorité"""
        sorted_topics = sorted(self.topics.values(), 
                             key=lambda x: (x.priority, x.evidence_weight), 
                             reverse=True)
        return sorted_topics[:limit]
    
    def export_topics_mapping(self) -> Dict:
        """Exporte mapping topics pour intégration BehaviorX"""
        
        mapping = {
            "total_topics": len(self.topics),
            "categories": list(self.categories),
            "agent_mapping": {},
            "priority_topics": [t.topic_id for t in self.get_high_priority_topics()],
            "topics_detail": {
                topic_id: {
                    "category": topic.category,
                    "focus": topic.focus,
                    "agents": topic.agents_impacted,
                    "priority": topic.priority,
                    "weight": topic.evidence_weight
                }
                for topic_id, topic in self.topics.items()
            }
        }
        
        # Créer mapping par agent
        all_agents = set()
        for topic in self.topics.values():
            all_agents.update(topic.agents_impacted)
        
        for agent in all_agents:
            mapping["agent_mapping"][agent] = [
                topic.topic_id for topic in self.get_topics_for_agent(agent)
            ]
        
        return mapping

# Instance globale
topics_manager = ResearchTopicsManager()
