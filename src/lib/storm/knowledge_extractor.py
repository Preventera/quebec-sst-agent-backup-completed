"""
Knowledge Extractor - SafetyGraph BehaviorX STORM
===============================================
Extracteur et structurateur de connaissances
Intégration avec pipeline SafetyGraph BehaviorX
"""

import json
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger('KnowledgeExtractor')

@dataclass
class ExtractedKnowledge:
    """Structure des connaissances extraites"""
    topic: str
    category: str
    insights: List[str]
    evidence_sources: List[Dict]
    behavioral_applications: List[str]
    metrics: Dict[str, Any]
    confidence_score: float
    extraction_timestamp: str

class KnowledgeExtractor:
    """Extracteur de connaissances pour enrichissement BehaviorX"""
    
    def __init__(self):
        self.extraction_patterns = self._initialize_patterns()
        self.behavioral_mapping = self._initialize_behavioral_mapping()
    
    def _initialize_patterns(self) -> Dict:
        """Initialise patterns d'extraction"""
        
        return {
            "insights": [
                r"research shows that (.*?)\.",
                r"studies indicate (.*?)\.",
                r"evidence suggests (.*?)\.",
                r"findings reveal (.*?)\."
            ],
            "metrics": [
                r"(\d+(?:\.\d+)?%?) improvement",
                r"(\d+(?:\.\d+)?%?) reduction",
                r"(\d+(?:\.\d+)?%?) increase",
                r"ROI of (\d+(?:\.\d+)?%?)"
            ],
            "sources": [
                r"according to (.*?) \(",
                r"(.*?) study found",
                r"research by (.*?) shows"
            ]
        }
    
    def _initialize_behavioral_mapping(self) -> Dict:
        """Mapping connaissances → applications comportementales"""
        
        return {
            "leadership": [
                "modeling_safety_behaviors",
                "authentic_communication", 
                "decision_making_transparency"
            ],
            "communication": [
                "active_listening_techniques",
                "feedback_delivery_methods",
                "conflict_resolution_safety"
            ],
            "culture": [
                "psychological_safety_building",
                "trust_development_strategies",
                "norm_establishment_methods"
            ],
            "training": [
                "competency_assessment_tools",
                "skill_transfer_techniques",
                "retention_optimization"
            ],
            "engagement": [
                "motivation_enhancement",
                "participation_encouragement",
                "empowerment_strategies"
            ],
            "measurement": [
                "kpi_design_principles",
                "data_collection_methods",
                "performance_tracking"
            ],
            "risk_management": [
                "behavioral_risk_identification",
                "decision_making_frameworks",
                "prevention_strategies"
            ]
        }
    
    def extract_from_research(self, research_data: Dict) -> ExtractedKnowledge:
        """Extrait connaissances structurées des données de recherche"""
        
        content = research_data.get("raw_content", "")
        topic = research_data.get("topic", "unknown")
        
        # Extraction insights
        insights = self._extract_insights(content)
        
        # Extraction métriques
        metrics = self._extract_metrics(content)
        
        # Extraction sources
        sources = self._extract_sources(research_data)
        
        # Mapping applications comportementales
        behavioral_apps = self._map_behavioral_applications(topic, insights)
        
        # Calcul score de confiance
        confidence = self._calculate_confidence_score(insights, metrics, sources)
        
        return ExtractedKnowledge(
            topic=topic,
            category=self._determine_category(topic),
            insights=insights,
            evidence_sources=sources,
            behavioral_applications=behavioral_apps,
            metrics=metrics,
            confidence_score=confidence,
            extraction_timestamp=datetime.now().isoformat()
        )
    
    def _extract_insights(self, content: str) -> List[str]:
        """Extrait insights clés du contenu"""
        
        insights = []
        for pattern in self.extraction_patterns["insights"]:
            matches = re.findall(pattern, content, re.IGNORECASE)
            insights.extend(matches)
        
        # Déduplication et nettoyage
        unique_insights = list(set(insights))
        cleaned_insights = [insight.strip() for insight in unique_insights if len(insight.strip()) > 10]
        
        return cleaned_insights[:5]  # Top 5 insights
    
    def _extract_metrics(self, content: str) -> Dict[str, Any]:
        """Extrait métriques quantifiables"""
        
        metrics = {}
        for pattern in self.extraction_patterns["metrics"]:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if "improvement" in content.lower():
                    metrics["improvement_rate"] = match
                elif "reduction" in content.lower():
                    metrics["reduction_rate"] = match
                elif "roi" in content.lower():
                    metrics["roi"] = match
        
        return metrics
    
    def _extract_sources(self, research_data: Dict) -> List[Dict]:
        """Extrait et structure les sources"""
        
        sources = research_data.get("sources", [])
        structured_sources = []
        
        for source in sources:
            if isinstance(source, dict):
                structured_sources.append({
                    "title": source.get("title", "Unknown"),
                    "url": source.get("url", ""),
                    "credibility": self._assess_source_credibility(source),
                    "relevance": self._assess_source_relevance(source, research_data.get("topic", ""))
                })
        
        return structured_sources
    
    def _map_behavioral_applications(self, topic: str, insights: List[str]) -> List[str]:
        """Mappe insights vers applications comportementales"""
        
        # Déterminer catégorie du topic
        category = self._determine_category(topic)
        
        # Récupérer applications comportementales de base
        base_applications = self.behavioral_mapping.get(category, [])
        
        # Enrichir avec insights spécifiques
        specific_applications = []
        for insight in insights:
            if "behavior" in insight.lower():
                specific_applications.append(f"application_based_on: {insight[:50]}...")
        
        return base_applications + specific_applications
    
    def _determine_category(self, topic: str) -> str:
        """Détermine catégorie du topic"""
        
        category_keywords = {
            "leadership": ["leader", "management", "supervisor", "authority"],
            "communication": ["communication", "dialogue", "feedback", "reporting"],
            "culture": ["culture", "climate", "psychological", "trust"],
            "training": ["training", "education", "learning", "competency"],
            "engagement": ["engagement", "participation", "involvement", "empowerment"],
            "measurement": ["measurement", "metrics", "kpi", "performance"],
            "risk_management": ["risk", "hazard", "safety", "prevention"]
        }
        
        topic_lower = topic.lower()
        for category, keywords in category_keywords.items():
            if any(keyword in topic_lower for keyword in keywords):
                return category
        
        return "general"
    
    def _calculate_confidence_score(self, insights: List[str], metrics: Dict, sources: List[Dict]) -> float:
        """Calcule score de confiance de l'extraction"""
        
        score = 0.0
        
        # Score basé sur nombre d'insights
        if len(insights) >= 3:
            score += 0.3
        elif len(insights) >= 1:
            score += 0.2
        
        # Score basé sur métriques quantifiables
        if len(metrics) >= 2:
            score += 0.3
        elif len(metrics) >= 1:
            score += 0.2
        
        # Score basé sur qualité des sources
        if len(sources) >= 3:
            avg_credibility = sum(s.get("credibility", 0.5) for s in sources) / len(sources)
            score += 0.4 * avg_credibility
        
        return min(score, 1.0)
    
    def _assess_source_credibility(self, source: Dict) -> float:
        """Évalue crédibilité d'une source"""
        
        title = source.get("title", "").lower()
        url = source.get("url", "").lower()
        
        # Critères de crédibilité
        credible_domains = ["edu", "gov", "org", "ieee", "sciencedirect"]
        academic_keywords = ["journal", "research", "study", "university"]
        
        score = 0.5  # Score de base
        
        # Bonus pour domaines crédibles
        if any(domain in url for domain in credible_domains):
            score += 0.3
        
        # Bonus pour mots-clés académiques
        if any(keyword in title for keyword in academic_keywords):
            score += 0.2
        
        return min(score, 1.0)
    
    def _assess_source_relevance(self, source: Dict, topic: str) -> float:
        """Évalue pertinence d'une source pour un topic"""
        
        title = source.get("title", "").lower()
        topic_words = topic.lower().split("_")
        
        # Compter mots du topic présents dans le titre
        matches = sum(1 for word in topic_words if word in title)
        relevance = matches / len(topic_words) if topic_words else 0.0
        
        return min(relevance, 1.0)
    
    def batch_extract_knowledge(self, research_results: List[Dict]) -> List[ExtractedKnowledge]:
        """Extraction en lot de connaissances"""
        
        extracted_knowledge = []
        for research_data in research_results:
            try:
                knowledge = self.extract_from_research(research_data)
                extracted_knowledge.append(knowledge)
                logger.info(f"✅ Connaissances extraites pour: {knowledge.topic}")
            except Exception as e:
                logger.error(f"❌ Erreur extraction {research_data.get('topic', 'unknown')}: {e}")
        
        return extracted_knowledge
    
    def export_for_behaviorx_integration(self, knowledge_list: List[ExtractedKnowledge]) -> Dict:
        """Exporte connaissances pour intégration BehaviorX"""
        
        export_data = {
            "extraction_session": datetime.now().isoformat(),
            "total_knowledge_items": len(knowledge_list),
            "categories_covered": list(set(k.category for k in knowledge_list)),
            "average_confidence": sum(k.confidence_score for k in knowledge_list) / len(knowledge_list) if knowledge_list else 0.0,
            "behavioral_enhancements": {},
            "knowledge_items": []
        }
        
        # Structurer par catégorie pour agents BehaviorX
        for knowledge in knowledge_list:
            export_data["knowledge_items"].append({
                "topic": knowledge.topic,
                "category": knowledge.category,
                "insights": knowledge.insights,
                "behavioral_applications": knowledge.behavioral_applications,
                "metrics": knowledge.metrics,
                "confidence": knowledge.confidence_score,
                "agent_integration_ready": knowledge.confidence_score >= 0.7
            })
        
        # Regrouper par catégorie pour faciliter intégration
        by_category = {}
        for knowledge in knowledge_list:
            if knowledge.category not in by_category:
                by_category[knowledge.category] = []
            by_category[knowledge.category].append(knowledge)
        
        export_data["behavioral_enhancements"] = {
            category: {
                "knowledge_count": len(items),
                "avg_confidence": sum(k.confidence_score for k in items) / len(items),
                "behavioral_applications": list(set().union(*[k.behavioral_applications for k in items])),
                "integration_priority": "high" if len(items) >= 3 else "medium"
            }
            for category, items in by_category.items()
        }
        
        return export_data

# ===================================================================
# FONCTIONS UTILITAIRES
# ===================================================================

def validate_knowledge_extraction() -> bool:
    """Valide fonctionnement extracteur de connaissances"""
    
    try:
        extractor = KnowledgeExtractor()
        
        # Test données simulées
        test_research = {
            "topic": "behavioral_safety_training",
            "raw_content": "Research shows that behavioral safety training improves performance by 35%. Studies indicate that interactive methods are most effective.",
            "sources": [{"title": "Safety Training Research", "url": "https://example.edu/study"}]
        }
        
        # Test extraction
        knowledge = extractor.extract_from_research(test_research)
        
        # Validation résultat
        valid = (
            len(knowledge.insights) > 0 and
            knowledge.confidence_score > 0.0 and
            len(knowledge.behavioral_applications) > 0
        )
        
        logger.info(f"✅ Validation extracteur: {valid}")
        return valid
        
    except Exception as e:
        logger.error(f"❌ Erreur validation extracteur: {e}")
        return False

# Instance globale
knowledge_extractor = KnowledgeExtractor()
