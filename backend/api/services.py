# backend/api/services.py

# --- IMPORTS ---
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
# NOTE: We do NOT import load_model or settings here anymore

# --- CONSTANTS ---
TIME_STEP = 60
FEATURES_TO_USE = ['Close', 'Open', 'High', 'Low', 'Volume']

# --- FUNCTIONS ---

def get_stock_data(ticker):
    # (This function is unchanged)
    stock = yf.Ticker(ticker)
    hist = stock.history(period="5y")
    hist.reset_index(inplace=True)
    hist = hist[['Date', 'Close', 'Open', 'High', 'Low', 'Volume']]
    return hist

def preprocess_for_prediction(df):
    # (This function is unchanged)
    data_for_scaling = df[FEATURES_TO_USE].astype(float)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data_for_scaling)
    
    close_price_scaler = MinMaxScaler(feature_range=(0, 1))
    close_price_scaler.fit_transform(data_for_scaling[['Close']])
    
    return scaled_data, close_price_scaler

# MODIFIED: This function now accepts the model as an argument
def forecast_future(model, initial_sequence, n_steps):
    future_predictions_scaled = []
    current_sequence = initial_sequence.copy()
    num_features = current_sequence.shape[2]

    for _ in range(n_steps):
        # Use the passed-in model to predict
        next_step_pred = model.predict(current_sequence)[0, 0]
        future_predictions_scaled.append(next_step_pred)
        
        new_step_features = np.zeros((1, 1, num_features))
        new_step_features[0, 0, 0] = next_step_pred

        current_sequence = np.append(current_sequence[:, 1:, :], new_step_features, axis=1)
        
    return np.array(future_predictions_scaled).reshape(-1, 1)

def get_gemini_analysis(ticker):
    # (This function is unchanged for now)
    return f"Gemini analysis suggests positive market sentiment for {ticker} due to recent product innovations."