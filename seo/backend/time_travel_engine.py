"""
AI Time-Travel Prediction Engine
Generates business timeline data with AI-driven predictions and decision simulations
"""

import random
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional


class TimeTravelEngine:
    """
    Advanced AI engine for business time-travel simulation.
    Generates past analysis, present state, and probabilistic future predictions.
    """
    
    def __init__(self):
        self.decision_impacts = {
            'improve_page_speed': {
                'seo_score': 8,
                'traffic': 15,
                'revenue': 12,
                'conversion_rate': 5,
                'description': 'Faster load times improve user experience and search rankings'
            },
            'optimize_technical_seo': {
                'seo_score': 12,
                'traffic': 20,
                'revenue': 18,
                'conversion_rate': 8,
                'description': 'Technical optimization directly boosts search visibility'
            },
            'target_new_keywords': {
                'seo_score': 10,
                'traffic': 25,
                'revenue': 22,
                'conversion_rate': 6,
                'description': 'Expanding keyword reach attracts new audience segments'
            },
            'increase_ad_budget': {
                'seo_score': 2,
                'traffic': 35,
                'revenue': 28,
                'conversion_rate': 4,
                'description': 'Higher ad spend drives immediate traffic and conversions'
            },
            'improve_content_quality': {
                'seo_score': 15,
                'traffic': 18,
                'revenue': 20,
                'conversion_rate': 12,
                'description': 'Quality content builds authority and engagement'
            }
        }
    
    def generate_timeline_data(self, user_id: Optional[int] = None, 
                              current_metrics: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate complete timeline data with 5 nodes: past_6m, past_3m, present, future_3m, future_6m
        """
        # Use current metrics or generate baseline
        if current_metrics is None:
            current_metrics = self._generate_baseline_metrics()
        
        # Generate historical data (past 6 months and 3 months)
        past_6m = self._generate_past_metrics(current_metrics, months_ago=6)
        past_3m = self._generate_past_metrics(current_metrics, months_ago=3)
        
        # Present state
        present = self._generate_present_metrics(current_metrics)
        
        # Future predictions (without decisions)
        future_3m = self._predict_future(present, months_ahead=3)
        future_6m = self._predict_future(present, months_ahead=6)
        
        return {
            'past_6m': past_6m,
            'past_3m': past_3m,
            'present': present,
            'future_3m': future_3m,
            'future_6m': future_6m,
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id
        }
    
    def simulate_decision(self, timeline_data: Dict[str, Any], 
                         decision: str) -> Dict[str, Any]:
        """
        Simulate the impact of a decision on future predictions.
        Returns updated future_3m and future_6m data.
        """
        if decision not in self.decision_impacts:
            raise ValueError(f"Unknown decision: {decision}")
        
        impact = self.decision_impacts[decision]
        present = timeline_data['present']
        
        # Calculate new future with decision impact
        future_3m = self._predict_future_with_decision(present, 3, impact, multiplier=0.6)
        future_6m = self._predict_future_with_decision(present, 6, impact, multiplier=1.0)
        
        # Generate narration for this decision
        narration_3m = self._generate_decision_narration(decision, impact, 3, future_3m)
        narration_6m = self._generate_decision_narration(decision, impact, 6, future_6m)
        
        return {
            'future_3m': future_3m,
            'future_6m': future_6m,
            'decision': decision,
            'narration_3m': narration_3m,
            'narration_6m': narration_6m,
            'applied_at': datetime.utcnow().isoformat()
        }
    
    def generate_narration(self, node_type: str, data: Dict[str, Any], 
                          decision: Optional[str] = None) -> str:
        """
        Generate AI-driven narration for a timeline node.
        """
        if node_type == 'past_6m':
            return self._narrate_past(data, 6)
        elif node_type == 'past_3m':
            return self._narrate_past(data, 3)
        elif node_type == 'present':
            return self._narrate_present(data)
        elif node_type in ['future_3m', 'future_6m']:
            months = 3 if node_type == 'future_3m' else 6
            if decision:
                impact = self.decision_impacts.get(decision, {})
                return self._generate_decision_narration(decision, impact, months, data)
            else:
                return self._narrate_future(data, months)
        else:
            return "Analyzing business timeline..."
    
    def calculate_business_health(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate overall business health score and visual indicators.
        Returns color, intensity, and particle speed for visualization.
        """
        seo_score = metrics.get('seo_score', 50)
        traffic_growth = metrics.get('traffic_growth', 0)
        revenue_growth = metrics.get('revenue_growth', 0)
        
        # Calculate health score (0-100)
        health_score = (
            seo_score * 0.4 +
            min(100, max(0, 50 + traffic_growth)) * 0.3 +
            min(100, max(0, 50 + revenue_growth)) * 0.3
        )
        
        # Determine color and visual properties
        if health_score >= 75:
            color = '#00ff88' # Neon Green
            intensity = 2.0
            particle_speed = 1.5
            status = 'excellent'
        elif health_score >= 60:
            color = '#ffcc00' # Golden
            intensity = 1.5
            particle_speed = 1.2
            status = 'good'
        elif health_score >= 40:
            color = '#ff8800' # Orange
            intensity = 1.0
            particle_speed = 0.8
            status = 'needs_improvement'
        else:
            color = '#ff3300' # Deep Red
            intensity = 0.5
            particle_speed = 0.5
            status = 'critical'
        
        return {
            'health_score': round(health_score, 1),
            'color': color,
            'intensity': intensity,
            'particle_speed': particle_speed,
            'status': status
        }

    def generate_metaverse_state(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Generates the complex state for the 3D Metaverse world.
        Maps business metrics to environmental properties.
        """
        timeline = self.generate_timeline_data(user_id)
        
        states = {}
        for node_key in ['past_6m', 'past_3m', 'present', 'future_3m', 'future_6m']:
            node = timeline[node_key]
            
            # Map metrics to visual properties
            states[node_key] = {
                'metrics': node,
                'environment': {
                    'building_scale': 0.5 + (node['seo_score'] / 100),
                    'traffic_density': 0.2 + (node['organic_traffic'] / 20000),
                    'energy_flow': 0.1 + (node['revenue'] / 100000),
                    'sky_color': node['color'],
                    'lighting_intensity': node['intensity'],
                    'ambient_motion_speed': node['particle_speed']
                },
                'ai_advisor': {
                    'mood': node['status'],
                    'intensity': node['intensity'],
                    'message': self.generate_narration(node_key, node)
                },
                'decisions': list(self.decision_impacts.keys()) if node_key == 'present' else []
            }
            
        return {
            'current_time_state': 'present',
            'timeline': states,
            'world_metadata': {
                'city_name': "Digital Twin Core",
                'is_persistent': True,
                'last_updated': datetime.utcnow().isoformat()
            }
        }

    def generate_organism_state(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Generates the bio-digital organism state representing the business health.
        """
        timeline = self.generate_timeline_data(user_id)
        
        states = {}
        for node_key in ['past_6m', 'past_3m', 'present', 'future_3m', 'future_6m']:
            node = timeline[node_key]
            
            # Map metrics to biological properties
            states[node_key] = {
                'metrics': {
                    'seo_score': node.get('seo_score', 0),
                    'organic_traffic': node.get('organic_traffic', 0),
                    'revenue': node.get('revenue', 0),
                    'backlinks': node.get('backlinks', 150),
                    'performance': node.get('page_speed', 85)
                },
                'biology': {
                    'size': 0.8 + (node['revenue'] / 50000),
                    'skin_color': node['color'],
                    'heartbeat_speed': 0.5 + (node['organic_traffic'] / 10000),
                    'neural_glow': 1.0 + (node.get('backlinks', 150) / 1000),
                    'mutation_rate': 0.1 + (100 - node.get('page_speed', 85)) / 200,
                    'is_evolving': node['seo_score'] > 85,
                    'status': node['status']
                },
                'ai_brain': {
                    'diagnosis': f"Organic structure analysis: {node['status'].upper()}.",
                    'evolution_path': "Advanced adaptability" if node['seo_score'] > 75 else "Stable growth pattern",
                    'prediction': f"Projecting {node['seo_score'] + 8}% bio-synchronic efficiency in 90 days."
                },
                'lab_actions': [
                    {'id': 'optimize_technical_seo', 'label': 'Inject Performance Serum'},
                    {'id': 'improve_content_quality', 'label': 'Edit Content DNA'},
                    {'id': 'increase_ad_budget', 'label': 'Boost Energy Levels'},
                    {'id': 'improve_page_speed', 'label': 'Repair Neural Connections'}
                ] if node_key == 'present' else []
            }
            
        return {
            'organism_id': f"BIO-ENTITY-{user_id or 777}",
            'last_synced': datetime.utcnow().isoformat(),
            'timeline': states
        }
    
    # Private helper methods
    
    def _generate_baseline_metrics(self) -> Dict[str, Any]:
        """Generate realistic baseline business metrics."""
        return {
            'seo_score': random.randint(45, 75),
            'organic_traffic': random.randint(5000, 15000),
            'traffic_growth': random.uniform(-5, 10),
            'revenue': random.randint(20000, 50000),
            'revenue_growth': random.uniform(-3, 12),
            'conversion_rate': random.uniform(1.5, 4.0),
            'bounce_rate': random.uniform(40, 65),
            'avg_session_duration': random.randint(120, 300),
            'backlinks': random.randint(500, 2000),
            'domain_authority': random.randint(30, 60)
        }
    
    def _generate_past_metrics(self, current: Dict[str, Any], months_ago: int) -> Dict[str, Any]:
        """Generate historical metrics based on current state."""
        # Simulate historical data with some variance
        variance = months_ago * 0.08  # More variance for older data
        
        past = {
            'seo_score': max(20, current['seo_score'] - random.uniform(5, 15) * (months_ago / 3)),
            'organic_traffic': int(current['organic_traffic'] * (1 - variance)),
            'traffic_growth': current['traffic_growth'] - random.uniform(2, 8),
            'revenue': int(current['revenue'] * (1 - variance * 0.8)),
            'revenue_growth': current['revenue_growth'] - random.uniform(3, 10),
            'conversion_rate': max(0.5, current['conversion_rate'] - random.uniform(0.2, 0.8)),
            'bounce_rate': min(80, current['bounce_rate'] + random.uniform(3, 10)),
            'avg_session_duration': int(current['avg_session_duration'] * (1 - variance * 0.5)),
            'backlinks': int(current['backlinks'] * (1 - variance * 0.6)),
            'domain_authority': max(10, current['domain_authority'] - random.uniform(3, 8)),
            'date': (datetime.utcnow() - timedelta(days=30 * months_ago)).isoformat()
        }
        
        # Add health calculation
        past.update(self.calculate_business_health(past))
        return past
    
    def _generate_present_metrics(self, current: Dict[str, Any]) -> Dict[str, Any]:
        """Generate present state metrics."""
        present = current.copy()
        present['date'] = datetime.utcnow().isoformat()
        present.update(self.calculate_business_health(present))
        return present
    
    def _predict_future(self, present: Dict[str, Any], months_ahead: int) -> Dict[str, Any]:
        """Predict future metrics based on current trends (no decisions)."""
        growth_factor = 1 + (months_ahead * 0.03)  # Modest organic growth
        uncertainty = months_ahead * 0.05  # More uncertainty further out
        
        future = {
            'seo_score': min(100, present['seo_score'] + random.uniform(2, 6) * (months_ahead / 3)),
            'organic_traffic': int(present['organic_traffic'] * growth_factor * random.uniform(0.95, 1.15)),
            'traffic_growth': present['traffic_growth'] + random.uniform(-3, 5),
            'revenue': int(present['revenue'] * growth_factor * random.uniform(0.9, 1.2)),
            'revenue_growth': present['revenue_growth'] + random.uniform(-2, 6),
            'conversion_rate': present['conversion_rate'] + random.uniform(-0.2, 0.5),
            'bounce_rate': max(30, present['bounce_rate'] - random.uniform(0, 5)),
            'avg_session_duration': int(present['avg_session_duration'] * random.uniform(0.98, 1.1)),
            'backlinks': int(present['backlinks'] * (1 + months_ahead * 0.04)),
            'domain_authority': min(100, present['domain_authority'] + random.uniform(1, 4)),
            'date': (datetime.utcnow() + timedelta(days=30 * months_ahead)).isoformat(),
            'confidence': max(0.5, 1 - uncertainty)
        }
        
        future.update(self.calculate_business_health(future))
        return future
    
    def _predict_future_with_decision(self, present: Dict[str, Any], months_ahead: int,
                                     impact: Dict[str, Any], multiplier: float = 1.0) -> Dict[str, Any]:
        """Predict future with decision impact applied."""
        base_future = self._predict_future(present, months_ahead)
        
        # Apply decision impacts with time-based multiplier
        future = {
            'seo_score': min(100, base_future['seo_score'] + impact['seo_score'] * multiplier),
            'organic_traffic': int(base_future['organic_traffic'] * (1 + impact['traffic'] / 100 * multiplier)),
            'traffic_growth': base_future['traffic_growth'] + impact['traffic'] * multiplier * 0.3,
            'revenue': int(base_future['revenue'] * (1 + impact['revenue'] / 100 * multiplier)),
            'revenue_growth': base_future['revenue_growth'] + impact['revenue'] * multiplier * 0.3,
            'conversion_rate': base_future['conversion_rate'] + impact['conversion_rate'] / 10 * multiplier,
            'bounce_rate': max(20, base_future['bounce_rate'] - impact['seo_score'] * 0.3 * multiplier),
            'avg_session_duration': int(base_future['avg_session_duration'] * (1 + impact['seo_score'] / 100 * multiplier)),
            'backlinks': base_future['backlinks'],
            'domain_authority': min(100, base_future['domain_authority'] + impact['seo_score'] * 0.2 * multiplier),
            'date': base_future['date'],
            'confidence': 0.85  # Higher confidence with active decision
        }
        
        future.update(self.calculate_business_health(future))
        return future
    
    def _narrate_past(self, data: Dict[str, Any], months_ago: int) -> str:
        """Generate narration for past timeline nodes."""
        health = data.get('status', 'unknown')
        seo = data.get('seo_score', 0)
        traffic = data.get('organic_traffic', 0)
        
        if health == 'excellent':
            return f"{months_ago} months ago, your business was thriving with an SEO score of {seo:.0f} and {traffic:,} monthly visitors."
        elif health == 'good':
            return f"{months_ago} months ago, performance was solid with {traffic:,} visitors and steady growth."
        else:
            return f"{months_ago} months ago, there were challenges with an SEO score of {seo:.0f} that needed attention."
    
    def _narrate_present(self, data: Dict[str, Any]) -> str:
        """Generate narration for present state."""
        health = data.get('status', 'unknown')
        seo = data.get('seo_score', 0)
        traffic = data.get('organic_traffic', 0)
        
        return f"Currently, your SEO score is {seo:.0f} with {traffic:,} monthly visitors. Make a strategic decision to shape your future."
    
    def _narrate_future(self, data: Dict[str, Any], months_ahead: int) -> str:
        """Generate narration for future predictions (no decision)."""
        traffic_growth = data.get('traffic_growth', 0)
        revenue_growth = data.get('revenue_growth', 0)
        
        if traffic_growth > 10 and revenue_growth > 10:
            return f"In {months_ahead} months, organic growth continues with {traffic_growth:.1f}% traffic increase and {revenue_growth:.1f}% revenue growth."
        elif traffic_growth > 0:
            return f"In {months_ahead} months, modest growth expected with {traffic_growth:.1f}% traffic increase."
        else:
            return f"In {months_ahead} months, without intervention, growth may stagnate or decline."
    
    def _generate_decision_narration(self, decision: str, impact: Dict[str, Any],
                                    months_ahead: int, future_data: Dict[str, Any]) -> str:
        """Generate narration explaining decision impact."""
        decision_names = {
            'improve_page_speed': 'Improving Page Speed',
            'optimize_technical_seo': 'Optimizing Technical SEO',
            'target_new_keywords': 'Targeting New Keywords',
            'increase_ad_budget': 'Increasing Ad Budget',
            'improve_content_quality': 'Improving Content Quality'
        }
        
        name = decision_names.get(decision, decision)
        description = impact.get('description', '')
        traffic_increase = impact.get('traffic', 0)
        revenue_increase = impact.get('revenue', 0)
        
        return (f"{name}: {description}. "
                f"In {months_ahead} months, expect {traffic_increase}% traffic boost "
                f"and {revenue_increase}% revenue increase.")


# Global instance
time_travel_engine = TimeTravelEngine()
