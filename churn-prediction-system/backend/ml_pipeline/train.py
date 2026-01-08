import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.pipeline import Pipeline
from preprocess import get_preprocessor

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'WA_Fn-UseC_-Telco-Customer-Churn.csv') 
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'churn_model.pkl')

def train():
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        print(f"Error: Dataset not found at {DATA_PATH}")
        print("Please download 'WA_Fn-UseC_-Telco-Customer-Churn.csv' from Kaggle and place it in backend/data/")
        return

    df = pd.read_csv(DATA_PATH)
    
    # Separation
    X = df.drop('Churn', axis=1)
    y = df['Churn'].map({'Yes': 1, 'No': 0})

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Get Preprocessing Pipeline
    preprocessor = get_preprocessor()

    # Model Pipeline
    # Using scale_pos_weight to handle class imbalance directly in XGBoost
    # Estimate scale_pos_weight: sum(negative instances) / sum(positive instances)
    neg = (y_train == 0).sum()
    pos = (y_train == 1).sum()
    scale_weight = neg / pos

    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', XGBClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            scale_pos_weight=scale_weight,
            use_label_encoder=False,
            eval_metric='logloss',
            random_state=42
        ))
    ])

    print("Training model...")
    model.fit(X_train, y_train)

    print("Evaluating model...")
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_proba):.4f}")

    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print("Done!")

if __name__ == "__main__":
    train()
