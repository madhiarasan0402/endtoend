import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

class DataCleaner(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        # 'TotalCharges' often has empty strings in this dataset for new customers
        X['TotalCharges'] = pd.to_numeric(X['TotalCharges'], errors='coerce')
        X['TotalCharges'] = X['TotalCharges'].fillna(0)
        
        # Drop customerID if present
        if 'customerID' in X.columns:
            X = X.drop('customerID', axis=1)
            
        # Convert SeniorCitizen to string to be handled as categorical
        if 'SeniorCitizen' in X.columns:
            X['SeniorCitizen'] = X['SeniorCitizen'].astype(str)
            
        return X

def get_preprocessor():
    # Define categorical and numerical features
    categorical_features = [
        'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'PhoneService', 
        'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup', 
        'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies', 
        'Contract', 'PaperlessBilling', 'PaymentMethod'
    ]
    
    numerical_features = ['tenure', 'MonthlyCharges', 'TotalCharges']

    # Pipelines
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    # Combine
    preprocessor = ColumnTransformer([
        ('num', num_pipeline, numerical_features),
        ('cat', cat_pipeline, categorical_features)
    ], verbose_feature_names_out=False)

    return Pipeline([
        ('cleaner', DataCleaner()),
        ('preprocessor', preprocessor)
    ])
