"""
Knowledge Graph Safety Agentique - STORM v2.0
Structuration sémantique pour enrichissement agents
"""

import json
import networkx as nx
from typing import Dict, List, Tuple
from datetime import datetime

class SafetyKnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.nodes = {
            'concepts': [],
            'agents': [],
            'sectors': [],
            'interventions': []
        }
        
    def add_semantic_knowledge(self, extraction_data: Dict):
        '''Ajoute connaissances extraites au graphe'''
        
        topic = extraction_data.get('topic', 'unknown')
        insights = extraction_data.get('insights', [])
        agents = extraction_data.get('agent_mappings', {})
        
        # Ajouter nœuds concepts
        for insight in insights:
            concept_id = f"concept_{len(self.nodes['concepts'])}"
            self.graph.add_node(concept_id, type='concept', content=insight, topic=topic)
            self.nodes['concepts'].append(concept_id)
        
        # Ajouter relations agents
        for agent, function in agents.items():
            agent_id = f"agent_{agent}"
            if not self.graph.has_node(agent_id):
                self.graph.add_node(agent_id, type='agent', function=function)
                self.nodes['agents'].append(agent_id)
            
            # Créer relations concept → agent
            for concept_id in self.nodes['concepts'][-len(insights):]:
                self.graph.add_edge(concept_id, agent_id, relationship='enhances')
    
    def get_agent_enhancements(self, agent_id: str) -> List[str]:
        '''Récupère améliorations pour un agent spécifique'''
        
        enhancements = []
        for node in self.graph.predecessors(f"agent_{agent_id}"):
            if self.graph.nodes[node]['type'] == 'concept':
                enhancements.append(self.graph.nodes[node]['content'])
        
        return enhancements
    
    def calculate_enhancement_impact(self) -> Dict[str, float]:
        '''Calcule impact améliorations par agent'''
        
        impact_scores = {}
        for agent_node in self.nodes['agents']:
            enhancement_count = len(list(self.graph.predecessors(agent_node)))
            impact_scores[agent_node] = min(enhancement_count * 0.1, 0.8)
        
        return impact_scores
    
    def export_knowledge_structure(self) -> Dict:
        '''Exporte structure pour Safety Agentique'''
        
        return {
            'timestamp': datetime.now().isoformat(),
            'graph_version': '2.0',
            'total_nodes': self.graph.number_of_nodes(),
            'total_edges': self.graph.number_of_edges(),
            'node_types': {k: len(v) for k, v in self.nodes.items()},
            'agent_enhancements': {
                agent: self.get_agent_enhancements(agent.replace('agent_', ''))
                for agent in self.nodes['agents']
            },
            'impact_predictions': self.calculate_enhancement_impact()
        }
