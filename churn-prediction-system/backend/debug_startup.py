import sys
import os
import joblib
import traceback
import pandas as pd

# Add ml_pipeline to sys.path just like app.py
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml_pipeline'))

try:
    print(f"Python Executable: {sys.executable}")
    print("Importing modules...")
    import shap
    import xgboost
    import sklearn
    from preprocess import DataCleaner # Test this import too
    print("Modules imported successfully.")
    
    model_path = os.path.join(os.path.dirname(__file__), "models/churn_model.pkl")
    print(f"Loading model from {model_path}...")
    
    if not os.path.exists(model_path):
        print(f"CRITICAL: Model file not found at {model_path}")
        sys.exit(1)
        
    model = joblib.load(model_path)
    print("Model loaded successfully.")
    
    print("Initializing SHAP...")
    # Mimic app.py logic
    classifier = model.named_steps['classifier']
    explainer = shap.TreeExplainer(classifier)
    print("SHAP initialized successfully.")
    
except Exception as e:
    print("\n--- ERROR DIAGNOSIS ---")
    traceback.print_exc()
