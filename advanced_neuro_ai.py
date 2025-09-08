import cv2
import numpy as np
import tensorflow as tf
from fer import FER
import speech_recognition as sr
import librosa
from datetime import datetime
import logging

class NeuroEmotionAnalyzer:
    """
    Real-time emotion and engagement monitoring for neurodevelopmental support
    """
    
    def __init__(self):
        self.emotion_detector = FER(mtcnn=True)
        self.speech_recognizer = sr.Recognizer()
        self.engagement_history = []
        self.stress_threshold = 0.7
        
    def analyze_facial_emotion(self, frame):
        """Analyze facial expressions from webcam feed"""
        try:
            emotions = self.emotion_detector.detect_emotions(frame)
            if emotions:
                dominant_emotion = self.emotion_detector.top_emotion(frame)
                return {
                    'emotion': dominant_emotion[0] if dominant_emotion else 'neutral',
                    'confidence': dominant_emotion[1] if dominant_emotion else 0.0,
                    'all_emotions': emotions[0]['emotions'] if emotions else {}
                }
        except Exception as e:
            logging.error(f"Emotion analysis error: {e}")
        return None
    
    def analyze_speech_patterns(self, audio_data, sample_rate=16000):
        """Analyze speech for stress, engagement, and comprehension indicators"""
        try:
            # Extract acoustic features
            mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
            spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sample_rate)
            zero_crossing_rate = librosa.feature.zero_crossing_rate(audio_data)
            
            # Calculate speech metrics
            speech_rate = len(audio_data) / (len(audio_data) / sample_rate)  # words per second estimate
            pitch_variation = np.std(spectral_centroid)
            
            return {
                'speech_rate': speech_rate,
                'pitch_variation': pitch_variation,
                'mfcc_features': mfccs.mean(axis=1).tolist(),
                'energy_level': np.mean(audio_data ** 2)
            }
        except Exception as e:
            logging.error(f"Speech analysis error: {e}")
        return None
    
    def calculate_engagement_score(self, emotion_data, speech_data, interaction_data):
        """Calculate overall engagement and stress levels"""
        engagement_score = 0.5
        stress_level = 0.3
        
        if emotion_data:
            # Positive emotions increase engagement
            positive_emotions = ['happy', 'surprise']
            negative_emotions = ['angry', 'fear', 'sad']
            
            if emotion_data['emotion'] in positive_emotions:
                engagement_score += 0.3
            elif emotion_data['emotion'] in negative_emotions:
                engagement_score -= 0.2
                stress_level += 0.3
        
        if speech_data:
            # Moderate speech rate indicates good engagement
            if 2 < speech_data['speech_rate'] < 4:  # optimal range
                engagement_score += 0.2
            else:
                stress_level += 0.1
        
        if interaction_data:
            # Active interaction increases engagement
            if interaction_data.get('clicks_per_minute', 0) > 5:
                engagement_score += 0.2
        
        return {
            'engagement_score': max(0, min(1, engagement_score)),
            'stress_level': max(0, min(1, stress_level)),
            'recommendations': self.generate_recommendations(engagement_score, stress_level)
        }
    
    def generate_recommendations(self, engagement, stress):
        """Generate real-time recommendations based on analysis"""
        recommendations = []
        
        if stress > self.stress_threshold:
            recommendations.extend([
                "Take a 5-minute break",
                "Try some deep breathing exercises",
                "Switch to a calming activity",
                "Reduce task complexity"
            ])
        
        if engagement < 0.4:
            recommendations.extend([
                "Try a more interactive activity",
                "Change learning modality (visual/auditory/kinesthetic)",
                "Break task into smaller steps",
                "Add gamification elements"
            ])
        
        if engagement > 0.8 and stress < 0.3:
            recommendations.extend([
                "Great focus! Continue current activity",
                "Consider increasing task difficulty",
                "This is optimal learning time"
            ])
        
        return recommendations

class CognitiveLoadMonitor:
    """
    Monitor cognitive load through behavioral patterns and task performance
    """
    
    def __init__(self):
        self.baseline_metrics = {}
        self.current_session = {}
        
    def track_interaction_patterns(self, user_actions):
        """Analyze user interaction patterns for cognitive load indicators"""
        metrics = {
            'response_time': [],
            'error_rate': 0,
            'task_completion_rate': 0,
            'pause_frequency': 0,
            'help_requests': 0
        }
        
        # Analyze action patterns
        for action in user_actions:
            if action['type'] == 'response':
                metrics['response_time'].append(action['duration'])
            elif action['type'] == 'error':
                metrics['error_rate'] += 1
            elif action['type'] == 'help':
                metrics['help_requests'] += 1
            elif action['type'] == 'pause':
                metrics['pause_frequency'] += 1
        
        # Calculate cognitive load score
        avg_response_time = np.mean(metrics['response_time']) if metrics['response_time'] else 0
        cognitive_load = self.calculate_cognitive_load(metrics, avg_response_time)
        
        return {
            'cognitive_load': cognitive_load,
            'metrics': metrics,
            'recommendations': self.generate_cognitive_recommendations(cognitive_load)
        }
    
    def calculate_cognitive_load(self, metrics, avg_response_time):
        """Calculate cognitive load based on performance metrics"""
        load_score = 0.5  # baseline
        
        # Response time indicates processing difficulty
        if avg_response_time > 5:  # seconds
            load_score += 0.3
        elif avg_response_time < 2:
            load_score -= 0.1
        
        # Error rate indicates confusion/overload
        if metrics['error_rate'] > 3:
            load_score += 0.4
        
        # Help requests indicate struggle
        load_score += min(0.3, metrics['help_requests'] * 0.1)
        
        # Frequent pauses may indicate overload
        if metrics['pause_frequency'] > 5:
            load_score += 0.2
        
        return max(0, min(1, load_score))
    
    def generate_cognitive_recommendations(self, cognitive_load):
        """Generate recommendations based on cognitive load"""
        if cognitive_load > 0.7:
            return [
                "Break task into smaller steps",
                "Provide more visual cues",
                "Reduce distractions",
                "Offer simplified version",
                "Schedule a break"
            ]
        elif cognitive_load < 0.3:
            return [
                "Consider increasing task complexity",
                "Add challenge elements",
                "Introduce new concepts",
                "Optimal learning state detected"
            ]
        else:
            return [
                "Good cognitive balance",
                "Continue current approach",
                "Monitor for changes"
            ]

class AdaptiveLearningEngine:
    """
    AI-powered adaptive learning system for neurodevelopmental needs
    """
    
    def __init__(self):
        self.user_profile = {}
        self.learning_history = []
        self.difficulty_levels = {
            'visual': [1, 2, 3, 4, 5],
            'auditory': [1, 2, 3, 4, 5],
            'kinesthetic': [1, 2, 3, 4, 5],
            'reading': [1, 2, 3, 4, 5]
        }
    
    def analyze_learning_patterns(self, user_data, performance_data):
        """Analyze learning patterns and preferences"""
        patterns = {
            'preferred_modality': self.detect_learning_modality(performance_data),
            'optimal_session_length': self.calculate_optimal_session_length(user_data),
            'best_time_of_day': self.analyze_performance_by_time(performance_data),
            'attention_span': self.estimate_attention_span(user_data),
            'processing_speed': self.calculate_processing_speed(performance_data)
        }
        
        return patterns
    
    def detect_learning_modality(self, performance_data):
        """Detect preferred learning modality based on performance"""
        modality_scores = {
            'visual': 0,
            'auditory': 0,
            'kinesthetic': 0,
            'reading': 0
        }
        
        for session in performance_data:
            modality = session.get('modality', 'visual')
            score = session.get('score', 0)
            modality_scores[modality] += score
        
        return max(modality_scores, key=modality_scores.get)
    
    def generate_personalized_curriculum(self, user_profile, current_skills):
        """Generate personalized learning path"""
        curriculum = {
            'immediate_goals': [],
            'short_term_goals': [],
            'long_term_goals': [],
            'recommended_activities': [],
            'skill_prerequisites': {}
        }
        
        # Identify skill gaps
        skill_gaps = self.identify_skill_gaps(current_skills)
        
        # Generate goals based on condition-specific needs
        condition = user_profile.get('condition', 'general')
        if condition == 'dyslexia':
            curriculum['immediate_goals'].extend([
                'Phonemic awareness training',
                'Letter-sound correspondence',
                'Sight word recognition'
            ])
        elif condition == 'adhd':
            curriculum['immediate_goals'].extend([
                'Attention focusing exercises',
                'Task completion strategies',
                'Time management skills'
            ])
        elif condition == 'autism':
            curriculum['immediate_goals'].extend([
                'Social communication practice',
                'Routine establishment',
                'Sensory integration activities'
            ])
        
        return curriculum
    
    def identify_skill_gaps(self, current_skills):
        """Identify areas needing improvement"""
        expected_skills = {
            'reading': 0.7,
            'math': 0.7,
            'attention': 0.6,
            'social': 0.6,
            'communication': 0.7
        }
        
        gaps = {}
        for skill, expected in expected_skills.items():
            current = current_skills.get(skill, 0)
            if current < expected:
                gaps[skill] = expected - current
        
        return gaps

# Example usage and API integration
class NeuroAIService:
    """Main service class for all neuro AI features"""
    
    def __init__(self):
        self.emotion_analyzer = NeuroEmotionAnalyzer()
        self.cognitive_monitor = CognitiveLoadMonitor()
        self.learning_engine = AdaptiveLearningEngine()
    
    def real_time_analysis(self, video_frame, audio_data, interaction_data):
        """Perform real-time analysis of user state"""
        # Emotion analysis
        emotion_result = self.emotion_analyzer.analyze_facial_emotion(video_frame)
        
        # Speech analysis
        speech_result = self.emotion_analyzer.analyze_speech_patterns(audio_data)
        
        # Engagement calculation
        engagement_result = self.emotion_analyzer.calculate_engagement_score(
            emotion_result, speech_result, interaction_data
        )
        
        # Cognitive load monitoring
        cognitive_result = self.cognitive_monitor.track_interaction_patterns(
            interaction_data.get('actions', [])
        )
        
        return {
            'emotion': emotion_result,
            'speech': speech_result,
            'engagement': engagement_result,
            'cognitive_load': cognitive_result,
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_intervention_recommendations(self, analysis_results, user_profile):
        """Generate personalized intervention recommendations"""
        recommendations = []
        
        # Based on emotional state
        if analysis_results.get('emotion', {}).get('emotion') in ['angry', 'fear', 'sad']:
            recommendations.extend([
                "Emotional regulation break recommended",
                "Try calming sensory activities",
                "Practice mindfulness exercises"
            ])
        
        # Based on cognitive load
        cognitive_load = analysis_results.get('cognitive_load', {}).get('cognitive_load', 0.5)
        if cognitive_load > 0.7:
            recommendations.extend([
                "Reduce task complexity",
                "Provide additional visual supports",
                "Break activity into smaller steps"
            ])
        
        # Condition-specific recommendations
        condition = user_profile.get('condition')
        if condition == 'adhd' and analysis_results.get('engagement', {}).get('engagement_score', 0.5) < 0.4:
            recommendations.extend([
                "Add movement breaks",
                "Increase interactivity",
                "Use fidget tools"
            ])
        
        return recommendations
