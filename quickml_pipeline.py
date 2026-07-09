import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import pickle

def extract_features(fir_csv_path):
    df = pd.read_csv(fir_csv_path)
    # Convert dates
    df['IncidentFromDate'] = pd.to_datetime(df['IncidentFromDate'])
    df['hour'] = df['IncidentFromDate'].dt.hour
    df['day_of_week'] = df['IncidentFromDate'].dt.dayofweek
    df['month'] = df['IncidentFromDate'].dt.month
    
    # Feature engineering for hotspot prediction
    features = df[['latitude', 'longitude', 'hour', 'day_of_week', 'month', 'CourtID']]
    # Mocking a target variable (crime intensity / risk score based on clustering)
    # In reality, this would be an aggregation of past incidents
    features['risk_score'] = np.where(df['CourtID'] == 1, 0.8, 0.4) + np.random.normal(0, 0.1, len(df))
    features['risk_score'] = features['risk_score'].clip(0, 1)
    
    return features

def train_model(features):
    X = features[['latitude', 'longitude', 'hour', 'day_of_week', 'month', 'CourtID']]
    y = features['risk_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    print(f"Model trained. MSE: {mse}")
    
    with open('xgboost_hotspot_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model saved to xgboost_hotspot_model.pkl")

if __name__ == '__main__':
    # 5.1 Extract historical crime data features
    features = extract_features('synthetic_data/20_CaseMaster.csv')
    # 5.2 Configure and train the XGBoost model
    train_model(features)
