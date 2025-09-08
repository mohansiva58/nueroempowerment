#!/usr/bin/env python3
"""
Test script for the ML API server
"""
import requests
import json

# Test the health endpoint
def test_health():
    try:
        response = requests.get("http://localhost:8000/health")
        print("Health Check Response:", response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

# Test the simple analysis endpoint
def test_simple_analysis():
    test_data = {
        "age": 8,
        "attention_level": 6,
        "social_interaction": 7,
        "communication_skills": 5,
        "behavioral_patterns": "sometimes hyperactive, enjoys group activities",
        "learning_preferences": ["visual", "kinesthetic"]
    }
    
    try:
        response = requests.post("http://localhost:8000/simple-analysis", json=test_data)
        print("Simple Analysis Response:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Simple analysis test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing ML API Server...")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing Health Endpoint:")
    if test_health():
        print("✅ Health check passed")
    else:
        print("❌ Health check failed")
    
    # Test simple analysis
    print("\n2. Testing Simple Analysis Endpoint:")
    if test_simple_analysis():
        print("✅ Simple analysis test passed")
    else:
        print("❌ Simple analysis test failed")
    
    print("\n" + "=" * 50)
    print("API Server is ready for integration with the React frontend!")
