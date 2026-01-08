# End-to-End Customer Churn Prediction System - Implementation Guide

## Project Overview
This project builds a full-stack automated Churn Prediction System. It predicts the likelihood of a customer leaving (churning) based on their usage patterns and demographics.

**Architecture:**
- **Frontend**: React (Vite) + Tailwind CSS (User Interface)
- **Backend API**: FastAPI (Python)
- **ML Engine**: Scikit-Learn / XGBoost (Model training & inference)
- **Database**: MySQL (Persistence for customer data & prediction history)

---

## Phase 1: Environment & Project Structure

### 1.1 Directory Structure
```
churn-prediction-system/
├── backend/
│   ├── app.py              # Main FastAPI application
│   ├── config.py           # Database configuration
│   ├── models/             # Saved ML models (.pkl)
│   ├── data/               # Raw and processed datasets
│   ├── ml_pipeline/        # Scripts for training and preprocessing
│   │   ├── preprocess.py
│   │   ├── train.py
│   │   └── evaluate.py
│   └── requirements.txt
├── frontend/               # React application
├── database/
│   └── schema.sql          # SQL scripts for table creation
└── README.md
```

### 1.2 Prerequisites
- Python 3.9+
- Node.js & npm
- MySQL Server

---

## Phase 2: Database Design (MySQL)

We need two main tables: `customers` (feature store) and `predictions` (audit trail).

**FILE: `database/schema.sql`**
```sql
CREATE DATABASE IF NOT EXISTS churn_db;
USE churn_db;

CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    gender VARCHAR(10),
    senior_citizen INT,
    partner VARCHAR(5),
    dependents VARCHAR(5),
    tenure INT,
    phone_service VARCHAR(5),
    multiple_lines VARCHAR(20),
    internet_service VARCHAR(20),
    online_security VARCHAR(20),
    online_backup VARCHAR(20),
    device_protection VARCHAR(20),
    tech_support VARCHAR(20),
    streaming_tv VARCHAR(20),
    streaming_movies VARCHAR(20),
    contract VARCHAR(20),
    paperless_billing VARCHAR(5),
    payment_method VARCHAR(30),
    monthly_charges FLOAT,
    total_charges FLOAT,
    churn VARCHAR(5) -- Ground truth if available
);

CREATE TABLE IF NOT EXISTS prediction_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50),
    prediction_prob FLOAT,
    prediction_class INT, -- 0 or 1
    risk_level VARCHAR(20),
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

---

## Phase 3: Machine Learning Backend

### 3.1 Dependencies
**FILE: `backend/requirements.txt`**
```
fastapi
uvicorn
pandas
numpy
scikit-learn
xgboost
imbalanced-learn
mysql-connector-python
sqlalchemy
python-multipart
joblib
```

### 3.2 ML Pipeline Steps
1.  **Data Ingestion**: Load the Telco Customer Churn dataset (e.g., from Kaggle).
2.  **Preprocessing**:
    *   Handle missing values (`TotalCharges` often has spaces).
    *   Encoding: One-Hot Encode categorical variables.
    *   Scaling: Standardize numerical features (`tenure`, `MonthlyCharges`).
3.  **Handling Imbalance**: Use SMOTE (Synthetic Minority Over-sampling Technique) to balance Churn=Yes vs No.
4.  **Model Training**:
    *   Train XGBoostClassifier or RandomForestClassifier.
    *   Hyperparameter tuning (optional).
5.  **Evaluation**: Check ROC-AUC, Precision, Recall.
6.  **Serialization**: Save the trained model and the preprocessing scaler using `joblib`.

---

## Phase 4: Backend API (FastAPI)

The API exposes the model to the world.

**Key Endpoints:**
*   `POST /predict`: Accepts customer JSON, returns churn probability and risk factors.
*   `GET /history/{customer_id}`: Returns past predictions for a customer.
*   `POST /batch-predict`: (Optional) Takes a CSV file and predicts for all rows.

**Logic for `POST /predict`:**
1.  Receive JSON data.
2.  Convert to DataFrame.
3.  Apply loaded preprocessor (Scaling/Encoding).
4.  Model.predict_proba().
5.  Determine Risk Level:
    *   < 0.4: Low Risk
    *   0.4 - 0.7: Medium Risk
    *   > 0.7: High Risk
6.  Save result to MySQL `prediction_logs`.
7.  Return JSON response.

---

## Phase 5: Frontend (React)

### 5.1 Setup
Initialize with Vite: `npm create vite@latest frontend --template react`

### 5.2 Key Components
1.  **Dashboard**: Overview of churn statistics (charts).
2.  **Prediction Form**: Inputs corresponding to model features (Tenure, Contract Type, etc.).
3.  **Result Card**: Visual indicator (Green/Yellow/Red) of risk, displaying the probability.
4.  **History Table**: List of previous predictions.

### 5.3 UX/UI Polish
*   Use a gradient background for "High Risk".
*   Use Tooltips to explain "Contract Type" impact.
*   Real-time validation on the form.

---

## Phase 6: Deployment

1.  **Backend**: Dockerize the FastAPI app. Deploy to Render or Railway.
2.  **Frontend**: Build static assets (`npm run build`) and deploy to Vercel or Netlify.
3.  **Database**: Use a managed MySQL instance (e.g., Aiven free tier, or Railway MySQL).

---

## How to Start Implementation
1.  Initialize the git repo.
2.  Create the backend virtual environment.
3.  Download the dataset (Telco Customer Churn).
4.  Run the training script to generate `model.pkl`.
5.  Start the FastAPI server.
6.  Build the React UI.
