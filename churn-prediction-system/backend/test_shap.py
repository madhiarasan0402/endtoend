import joblib
import os
import sys
import shap

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'churn_model.pkl')
sys.path.append(os.path.join(BASE_DIR, 'ml_pipeline'))

try:
    from preprocess import DataCleaner
    print("Loading model...")
    model = joblib.load(MODEL_PATH)
    
    outer_preprocessor = model.named_steps['preprocessor']
    classifier = model.named_steps['classifier']
    
    ct = outer_preprocessor.steps[-1][1]
    names = ct.get_feature_names_out()
    print(f"Features: {len(names)}")
    
    print("Initializing SHAP...")
    explainer = shap.TreeExplainer(classifier)
    print("SHAP successful.")
    
except Exception as e:
    import traceback
    print(traceback.format_exc())
