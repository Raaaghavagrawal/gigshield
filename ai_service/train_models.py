import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import IsolationForest
import joblib
import os

os.makedirs("models", exist_ok=True)

def train_disruption_model():
    """ Logistic Regression for Risk (Disruption) Prediction """
    data = []
    # Features: rainfall_weighted, aqi_avg_3d, aqi_trend, is_peak_hour, is_weekend, speed_sensitivity
    cols = ['rainfall_weighted', 'aqi_avg', 'aqi_trend', 'temp', 'is_peak_hour', 'is_weekend', 'speed_sens']
    
    for _ in range(2000):
        rw = np.random.uniform(0, 250)
        aqi_avg = np.random.uniform(0, 500)
        aqi_trend = np.random.uniform(-50, 100)
        temp = np.random.uniform(15, 45)
        is_peak = np.random.choice([0, 1], p=[0.7, 0.3])
        is_wknd = np.random.choice([0, 1], p=[0.71, 0.29])
        spd_sens = np.random.choice([1.0, 1.4])
        
        # Risk score calculation logic based on user's feature weights
        score = (rw * 0.4) + (aqi_avg * 0.1) + (max(0, aqi_trend) * 0.2) + (is_peak * 25) + (is_wknd * 10 * spd_sens)
        
        target = 1 if score > 75 else 0
        data.append([rw, aqi_avg, aqi_trend, temp, is_peak, is_wknd, spd_sens, target])

    df = pd.DataFrame(data, columns=cols + ['target'])
    model = LogisticRegression(max_iter=1000)
    model.fit(df[cols], df['target'])
    joblib.dump(model, "models/disruption_model.pkl")
    print("Disruption model trained with enhanced features.")

def train_loss_model():
    """ Linear Regression for Loss Prediction """
    cols = ['rainfall_avg_3d', 'aqi', 'is_peak_hour', 'is_quick_commerce', 'avg_daily_deliveries']
    data = []
    
    for _ in range(2000):
        rain_avg = np.random.uniform(0, 150)
        aqi = np.random.uniform(0, 500)
        is_peak = np.random.choice([0, 1])
        is_qc = np.random.choice([0, 1])
        deliveries = np.random.uniform(10, 40)
        
        # Loss pct logic
        base_loss = (rain_avg * 0.3) + (aqi * 0.05) + (is_peak * 15 * (1.5 if is_qc else 1.0))
        # Deliveries slightly offset %
        loss = max(0, min(100, base_loss - (deliveries * 0.1)))
        
        data.append([rain_avg, aqi, is_peak, is_qc, deliveries, loss])
        
    df = pd.DataFrame(data, columns=cols + ['target'])
    model = LinearRegression()
    model.fit(df[cols], df['target'])
    joblib.dump(model, "models/loss_model.pkl")
    print("Loss model trained with deliveries/platform context.")

def train_anomaly_model():
    """ Isolation Forest for Fraud / Anomaly Detection """
    cols = ['payout_amount', 'payout_frequency_7d', 'anomaly_patterns_score']
    data = []
    
    # Normal behavior (90%)
    for _ in range(1800):
        amt = np.random.uniform(100, 1000)
        freq = np.random.uniform(0, 2)
        pattern = np.random.uniform(0, 20)
        data.append([amt, freq, pattern])
        
    # Anomalous behavior (10%)
    for _ in range(200):
        amt = np.random.uniform(800, 5000)
        freq = np.random.uniform(3, 10)
        pattern = np.random.uniform(60, 100)
        data.append([amt, freq, pattern])
        
    df = pd.DataFrame(data, columns=cols)
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(df)
    joblib.dump(model, "models/anomaly_model.pkl")
    print("Anomaly model trained with frequency & pattern scores.")

if __name__ == "__main__":
    train_disruption_model()
    train_loss_model()
    train_anomaly_model()
