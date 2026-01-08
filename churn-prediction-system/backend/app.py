import sys
import os
import joblib
import pandas as pd
import numpy as np
import threading
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from fastapi.responses import Response
from report_generator import generate_report

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Configuration ---
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "AIML")
MODEL_PATH_SETTING = os.getenv("MODEL_PATH", "models/churn_model.pkl")
DATA_PATH_SETTING = os.getenv("DATA_PATH", "data/WA_Fn-UseC_-Telco-Customer-Churn.csv")

SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

import shap
import warnings

# --- 1. Setup ML Imports ---
# Add ml_pipeline to sys.path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml_pipeline'))

# Import the custom class
try:
    from preprocess import DataCleaner
except ImportError as e:
    print(f"Error importing DataCleaner: {e}")

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import timedelta

# --- 2. Database Setup ---
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "churnshield_fallback_secret")
ALGORITHM = "HS256"

SessionLocal = None
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        username = Column(String(50), unique=True, index=True)
        password = Column(String(255))
        full_name = Column(String(100))

    class PredictionLog(Base):
        __tablename__ = "prediction_logs"
        id = Column(Integer, primary_key=True, index=True)
        customer_id = Column(String(50))
        prediction_prob = Column(Float)
        prediction_class = Column(Integer)
        risk_level = Column(String(20))
        prediction_date = Column(DateTime, default=datetime.utcnow)

    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Database connected successfully.")
except Exception as e:
    print(f"WARNING: Database connection failed (Logging disabled). Error: {e}")
    SessionLocal = None

# Dependency
def get_db():
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 3. FastAPI App ---
app = FastAPI(title="ChurnShield Pro API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Schema
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(request: LoginRequest, db=Depends(get_db)):
    if not db:
        # Fallback for demo if DB is down
        if request.username == "admin" and request.password == "admin123":
            return {"access_token": "demo_token", "username": "admin", "full_name": "Admin User"}
        raise HTTPException(status_code=503, detail="Database connection failed")

    user = db.query(User).filter(User.username == request.username).first()
    if not user or not pwd_context.verify(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "access_token": "validated_session_token", # Simple token for now
        "username": user.username,
        "full_name": user.full_name
    }

@app.post("/init-demo-user")
def init_demo_user(db=Depends(get_db)):
    if not db:
        raise HTTPException(status_code=503, detail="Database connection failed")
    
    # Check if admin exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        hashed_password = pwd_context.hash("admin123")
        new_user = User(username="admin", password=hashed_password, full_name="Admin User")
        db.add(new_user)
        db.commit()
        return {"message": "Demo user 'admin' created with password 'admin123'"}
    return {"message": "Demo user already exists"}

# Load Model & Explainer
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = None
explainer = None
feature_names = None

@app.on_event("startup")
def startup_event():
    global model, explainer, feature_names
    current_model_path = os.path.join(BASE_DIR, MODEL_PATH_SETTING)
    try:
        if os.path.exists(current_model_path):
            model = joblib.load(current_model_path)
            print(f"Model loaded from {current_model_path}")
            
            # Initialize SHAP explainer
            # Pipeline structure: [DataCleaner + ColumnTransformer] -> [XGBClassifier]
            # model.named_steps['preprocessor'] is the Pipeline from preprocess.py
            outer_preprocessor = model.named_steps['preprocessor']
            classifier = model.named_steps['classifier']
            
            # The preprocessor is a Pipeline: [DataCleaner, ColumnTransformer]
            # ColumnTransformer is the last step.
            ct = outer_preprocessor.steps[-1][1]
            feature_names = ct.get_feature_names_out()
            
            # XGBoost explainer
            explainer = shap.TreeExplainer(classifier)
            print(f"SHAP Explainer initialized with {len(feature_names)} features.")
        else:
            print(f"Warning: Model not found at {current_model_path}")
    except Exception as e:
        import traceback
        print(f"Startup Error:\n{traceback.format_exc()}")

# --- 4. Data Models ---
class CustomerData(BaseModel):
    # Optional customer_id for logging
    customer_id: Optional[str] = "Unknown"
    
    gender: str = Field(..., example="Male")
    SeniorCitizen: int = Field(..., example=0)
    Partner: str = Field(..., example="No")
    Dependents: str = Field(..., example="No")
    tenure: int = Field(..., example=12)
    PhoneService: str = Field(..., example="Yes")
    MultipleLines: str = Field(..., example="No")
    InternetService: str = Field(..., example="DSL")
    OnlineSecurity: str = Field(..., example="No")
    OnlineBackup: str = Field(..., example="Yes")
    DeviceProtection: str = Field(..., example="No")
    TechSupport: str = Field(..., example="No")
    StreamingTV: str = Field(..., example="No")
    StreamingMovies: str = Field(..., example="No")
    Contract: str = Field(..., example="Month-to-month")
    PaperlessBilling: str = Field(..., example="Yes")
    PaymentMethod: str = Field(..., example="Electronic check")
    MonthlyCharges: float = Field(..., example=55.0)
    TotalCharges: float = Field(..., example=660.0)

# --- 5. Routes ---
@app.get("/")
def read_root():
    return {"message": "Churn Prediction API with MySQL Logging is running."}

@app.get("/logs")
def get_logs(db=Depends(get_db)):
    """Fetch recent prediction logs from database"""
    if not db:
        # Return mock logs if DB is unavailable for demo purposes
        return [
            {"id": 1, "customer_id": "CUST-9921", "prediction_prob": 0.12, "risk_level": "Low", "prediction_date": "2024-03-20T10:30:00"},
            {"id": 2, "customer_id": "CUST-4432", "prediction_prob": 0.88, "risk_level": "High", "prediction_date": "2024-03-20T11:15:00"},
            {"id": 3, "customer_id": "CUST-1029", "prediction_prob": 0.45, "risk_level": "Medium", "prediction_date": "2024-03-20T12:05:00"}
        ]
    try:
        logs = db.query(PredictionLog).order_by(PredictionLog.id.desc()).limit(10).all()
        return logs
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return []

@app.get("/features")
def get_features():
    """Returns details about the features used in the model"""
    return {
        "categorical": [
            {"name": "gender", "desc": "Customer gender", "importance": "Trivial"},
            {"name": "SeniorCitizen", "desc": "Whether the customer is a senior citizen", "importance": "High"},
            {"name": "Partner", "desc": "Whether the customer has a partner", "importance": "Medium"},
            {"name": "Dependents", "desc": "Whether the customer has dependents", "importance": "Medium"},
            {"name": "InternetService", "desc": "Customer's internet service provider", "importance": "Extreme"},
            {"name": "Contract", "desc": "The contract term of the customer", "importance": "Extreme"},
            {"name": "PaymentMethod", "desc": "The customer's payment method", "importance": "High"}
        ],
        "numerical": [
            {"name": "tenure", "desc": "Number of months the customer has stayed with the company", "importance": "Extreme"},
            {"name": "MonthlyCharges", "desc": "The amount charged to the customer monthly", "importance": "High"},
            {"name": "TotalCharges", "desc": "The total amount charged to the customer", "importance": "Medium"}
        ]
    }

def log_prediction_background(data: dict, prob: float, risk: str):
    """Save prediction to database in background"""
    if SessionLocal is None:
        return
        
    db = SessionLocal()
    try:
        log_entry = PredictionLog(
            customer_id=data.get("customer_id", "Unknown"),
            prediction_prob=prob,
            prediction_class=1 if prob > 0.5 else 0,
            risk_level=risk
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"Failed to log prediction: {e}")
    finally:
        db.close()

@app.get("/stats")
def get_stats():
    """Provides aggregate statistics for the dashboard"""
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        current_data_path = os.path.join(BASE_DIR, DATA_PATH_SETTING)
        # For a real app, you would query your SQL database. 
        # For this demo, we'll calculate stats from the original dataset to show 'Enterprise' trends.
        # Check if the dataset exists
        if os.path.exists(current_data_path):
            df = pd.read_csv(current_data_path)
            churn_count = df[df['Churn'] == 'Yes'].shape[0]
            total_count = df.shape[0]
            churn_rate = (churn_count / total_count) * 100
            
            # Risk Level Mock Distribution (usually from prediction_logs table)
            risk_dist = [
                {"label": "Low Risk", "value": 65, "color": "#10b981"},
                {"label": "Medium Risk", "value": 22, "color": "#fbbf24"},
                {"label": "High Risk", "value": 13, "color": "#f43f5e"}
            ]
            
            return {
                "total_customers": total_count,
                "churn_rate": round(churn_rate, 1),
                "risk_distribution": risk_dist,
                "monthly_revenue_at_risk": 12450.00,
                "active_interventions": 342
            }
        else:
            return {"message": "Dataset not found for stats calculation"}
    except Exception as e:
        print(f"Stats Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate statistics")

@app.post("/predict")
def predict_churn(data: CustomerData, background_tasks: BackgroundTasks):
    if not model or explainer is None:
        raise HTTPException(status_code=503, detail="Model or Explainer not loaded. Please check server logs.")
    
    try:
        # Convert input to DataFrame
        input_data = data.dict()
        df = pd.DataFrame([input_data])
        
        # 1. Preprocess
        preprocessor = model.named_steps['preprocessor']
        X_transformed = preprocessor.transform(df)
        
        # 2. Predict Probability
        classifier = model.named_steps['classifier']
        prob = classifier.predict_proba(X_transformed)[0][1]
        
        # 3. Calculate SHAP Values
        shap_values = explainer.shap_values(X_transformed)[0]
        
        # Create a mapping of feature names to SHAP values
        explanations = []
        for name, val in zip(feature_names, shap_values):
            explanations.append({
                "feature": name,
                "impact": float(val)
            })
            
        # Sort by absolute impact and take top 5
        explanations = sorted(explanations, key=lambda x: abs(x["impact"]), reverse=True)[:5]
        
        # Determining Risk Level
        risk_level = "Low"
        if prob > 0.7:
            risk_level = "High"
        elif prob > 0.4:
            risk_level = "Medium"
            
        # Log in background
        background_tasks.add_task(log_prediction_background, input_data, float(prob), risk_level)
            
        # Return structured response
        return {
            "customer_id": data.customer_id,
            "churn_probability": round(float(prob), 4),
            "risk_level": risk_level,
            "explanations": explanations
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

class ReportRequest(BaseModel):
    # Flexible dict to accept all data
    data: dict

@app.post("/report")
def create_report(req: ReportRequest):
    try:
        pdf_content = generate_report(req.data)
        filename = f"ChurnReport_{req.data.get('customer_id', 'Unknown')}.pdf"
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"Report Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
