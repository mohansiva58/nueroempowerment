from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
import uvicorn
import os
import json
import io
from PIL import Image
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NeuroHub ML API", description="Multimodal AI for Neurodevelopmental Analysis")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
loaded_model = None

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    visual_data: Optional[List[List[List[List[float]]]]] = None
    audio_data: Optional[List[List[List[float]]]] = None
    text_data: Optional[List[List[List[float]]]] = None
    child_profile: Optional[dict] = {}

class PredictionResponse(BaseModel):
    status: str
    message: str
    emotion_prediction: List[float]
    attention_score: float
    adaptive_learning_params: List[float]
    routine_support_probabilities: List[float]
    recommendations: List[str]

class SimpleAnalysisRequest(BaseModel):
    age: int
    attention_level: int  # 1-10 scale
    social_interaction: int  # 1-10 scale
    communication_skills: int  # 1-10 scale
    behavioral_patterns: str
    learning_preferences: List[str]

def load_ml_model():
    """Load the pre-trained model or create a simple mock model for testing"""
    global loaded_model
    model_path = "multimodal_multitask_model.keras"
    
    try:
        if os.path.exists(model_path):
            loaded_model = tf.keras.models.load_model(model_path)
            logger.info(f"Model loaded successfully from {model_path}")
        else:
            logger.warning("Model file not found, creating mock model for demonstration")
            # Create a simple mock model for testing
            loaded_model = create_mock_model()
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        loaded_model = create_mock_model()

def create_mock_model():
    """Create a simple mock model for testing purposes"""
    # This is a simplified model for demonstration
    visual_input = tf.keras.layers.Input(shape=(64, 64, 3), name='visual_input')
    audio_input = tf.keras.layers.Input(shape=(100, 128), name='audio_input')
    text_input = tf.keras.layers.Input(shape=(50, 50), name='text_input')
    
    # Simple processing
    visual_features = tf.keras.layers.GlobalAveragePooling2D()(visual_input)
    audio_features = tf.keras.layers.GlobalAveragePooling1D()(audio_input)
    text_features = tf.keras.layers.GlobalAveragePooling1D()(text_input)
    
    combined = tf.keras.layers.concatenate([visual_features, audio_features, text_features])
    
    # Outputs
    emotion_output = tf.keras.layers.Dense(7, activation='softmax', name='emotion_output')(combined)
    attention_output = tf.keras.layers.Dense(1, activation='sigmoid', name='attention_output')(combined)
    adaptive_output = tf.keras.layers.Dense(10, activation='sigmoid', name='adaptive_learning_output')(combined)
    routine_output = tf.keras.layers.Dense(5, activation='sigmoid', name='routine_support_output')(combined)
    
    model = tf.keras.Model(
        inputs=[visual_input, audio_input, text_input],
        outputs=[emotion_output, attention_output, adaptive_output, routine_output]
    )
    
    model.compile(optimizer='adam', loss='categorical_crossentropy')
    return model

def generate_recommendations(emotion_pred, attention_score, adaptive_params, child_profile):
    """Generate personalized recommendations based on model outputs"""
    recommendations = []
    
    # Emotion-based recommendations
    emotions = ['Happy', 'Sad', 'Angry', 'Fearful', 'Surprised', 'Disgusted', 'Neutral']
    dominant_emotion = emotions[np.argmax(emotion_pred)]
    
    if dominant_emotion in ['Sad', 'Angry', 'Fearful']:
        recommendations.append("Consider calming activities and emotional regulation exercises")
    elif dominant_emotion == 'Happy':
        recommendations.append("Great emotional state! Continue with current activities")
    
    # Attention-based recommendations
    if attention_score < 0.5:
        recommendations.append("Focus training exercises recommended")
        recommendations.append("Break tasks into smaller, manageable chunks")
    else:
        recommendations.append("Good attention levels - can handle complex tasks")
    
    # Age-based recommendations
    age = child_profile.get('age', 10)
    if age < 8:
        recommendations.append("Use visual and hands-on learning approaches")
    elif age < 12:
        recommendations.append("Incorporate interactive games and puzzles")
    else:
        recommendations.append("Can handle abstract concepts and independent work")
    
    return recommendations

@app.on_event("startup")
async def startup_event():
    """Load the model when the API starts"""
    load_ml_model()

@app.get("/")
async def root():
    return {"message": "NeuroHub ML API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": loaded_model is not None,
        "message": "API is operational"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Main prediction endpoint for multimodal analysis"""
    if loaded_model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    try:
        # For demonstration, generate some sample data if not provided
        if not request.visual_data:
            visual_data = np.random.rand(1, 64, 64, 3).astype(np.float32)
        else:
            visual_data = np.array(request.visual_data, dtype=np.float32)
            
        if not request.audio_data:
            audio_data = np.random.rand(1, 100, 128).astype(np.float32)
        else:
            audio_data = np.array(request.audio_data, dtype=np.float32)
            
        if not request.text_data:
            text_data = np.random.rand(1, 50, 50).astype(np.float32)
        else:
            text_data = np.array(request.text_data, dtype=np.float32)
        
        # Make prediction
        predictions = loaded_model.predict([visual_data, audio_data, text_data])
        
        # Extract predictions
        emotion_pred = predictions[0][0].tolist()
        attention_score = float(predictions[1][0][0])
        adaptive_params = predictions[2][0].tolist()
        routine_probs = predictions[3][0].tolist()
        
        # Generate recommendations
        recommendations = generate_recommendations(
            emotion_pred, attention_score, adaptive_params, request.child_profile
        )
        
        return PredictionResponse(
            status="success",
            message="Analysis completed successfully",
            emotion_prediction=emotion_pred,
            attention_score=attention_score,
            adaptive_learning_params=adaptive_params,
            routine_support_probabilities=routine_probs,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/simple-analysis")
async def simple_analysis(request: SimpleAnalysisRequest):
    """Simplified analysis endpoint using form data"""
    try:
        # Generate mock predictions based on input parameters
        # In a real implementation, this would use your trained model
        
        # Emotion prediction based on behavioral patterns
        emotion_scores = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.4]  # Default neutral
        if "aggressive" in request.behavioral_patterns.lower():
            emotion_scores[2] = 0.6  # Angry
        elif "withdrawn" in request.behavioral_patterns.lower():
            emotion_scores[1] = 0.5  # Sad
        elif "hyperactive" in request.behavioral_patterns.lower():
            emotion_scores[4] = 0.4  # Surprised/energetic
        
        # Attention score
        attention_score = request.attention_level / 10.0
        
        # Adaptive learning parameters
        adaptive_params = [
            request.communication_skills / 10.0,
            request.social_interaction / 10.0,
            attention_score,
            0.5,  # Processing speed
            0.6,  # Memory retention
            0.7,  # Pattern recognition
            0.5,  # Motor skills
            0.6,  # Language development
            0.5,  # Executive function
            0.7   # Sensory processing
        ]
        
        # Routine support probabilities
        routine_probs = [0.7, 0.6, 0.8, 0.5, 0.6]
        
        # Generate recommendations
        recommendations = []
        
        if request.attention_level < 5:
            recommendations.append("Focus on attention-building activities")
            recommendations.append("Use shorter activity sessions with frequent breaks")
        
        if request.social_interaction < 5:
            recommendations.append("Encourage group activities and social games")
            recommendations.append("Practice turn-taking and sharing exercises")
        
        if request.communication_skills < 5:
            recommendations.append("Use visual communication aids")
            recommendations.append("Practice simple verbal expressions")
        
        if "visual" in request.learning_preferences:
            recommendations.append("Use picture cards and visual schedules")
        
        if "kinesthetic" in request.learning_preferences:
            recommendations.append("Incorporate movement and hands-on activities")
        
        if "auditory" in request.learning_preferences:
            recommendations.append("Use songs and verbal instructions")
        
        return {
            "status": "success",
            "message": "Simple analysis completed",
            "emotion_prediction": emotion_scores,
            "attention_score": attention_score,
            "adaptive_learning_params": adaptive_params,
            "routine_support_probabilities": routine_probs,
            "recommendations": recommendations,
            "child_profile": {
                "age": request.age,
                "attention_level": request.attention_level,
                "social_interaction": request.social_interaction,
                "communication_skills": request.communication_skills,
                "behavioral_patterns": request.behavioral_patterns,
                "learning_preferences": request.learning_preferences
            }
        }
        
    except Exception as e:
        logger.error(f"Simple analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
