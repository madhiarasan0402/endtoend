import joblib
import os
import sys

# Define path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'churn_model.pkl')

# Add pipeline path
sys.path.append(os.path.join(BASE_DIR, 'ml_pipeline'))

try:
    from preprocess import DataCleaner
    print("Loading model...")
    model = joblib.load(MODEL_PATH)
    print("Model loaded.")
    
    outer_preprocessor = model.named_steps['preprocessor']
    print(f"Outer preprocessor steps: {outer_preprocessor.steps}")
    
    ct = outer_preprocessor.steps[-1][1]
    print(f"Last step found: {ct}")
    
    names = ct.get_feature_names_out()
    print(f"Feature names extracted: {len(names)} names.")
    
except Exception as e:
    import traceback
    print(traceback.format_exc())
