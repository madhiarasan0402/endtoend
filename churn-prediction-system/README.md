# ChurnShield Pro 🛡️

A production-ready full-stack application to predict customer churn risk using Machine Learning.

## 🚀 Features
- **Real-time Prediction**: Instant churn probability assessment.
- **Risk Visualization**: Interactive dashboard with risk levels (Low/Medium/High).
- **Explainability**: Key factors driving the churn risk.
- **Full Stack**: FastAPI backend + React frontend + MySQL database.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Chart.js, Formik
- **Backend**: Python, FastAPI, Scikit-Learn, XGBoost
- **Database**: MySQL (Schema included)

## 🏁 Getting Started

### 1. Backend Setup
```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Download Data
# Download 'WA_Fn-UseC_-Telco-Customer-Churn.csv' from Kaggle and place in backend/data/

# Train Model
python ml_pipeline/train.py

# Run API
uvicorn app:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run Dev Server
npm run dev
```

### 3. Database Setup
Run the `database/schema.sql` script in your MySQL instance.
Update `backend/app.py` with your database credentials.

## 📂 Project Structure
- `backend/ml_pipeline`: Training and preprocessing scripts.
- `backend/app.py`: FastAPI application.
- `frontend/src/components`: React UI components.
