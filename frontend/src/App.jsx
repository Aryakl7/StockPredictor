import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css'; // We will create this file

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [ticker, setTicker] = useState('');
  const [duration, setDuration] = useState('1m');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    if (!ticker) {
      setError('Please enter a stock ticker.');
      return;
    }
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/predict/', {
        ticker,
        duration,
      });
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to fetch prediction. Please check the ticker and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const chartData = {
    labels: prediction?.forecast?.dates || [],
    datasets: [
      {
        label: `${ticker.toUpperCase()} Predicted Price`,
        data: prediction?.forecast?.prices || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Prediction Chatbot</h1>
      </header>
      <div className="input-section">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter stock ticker (e.g., TSLA)"
        />
        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option value="1w">1 Week</option>
          <option value="1m">1 Month</option>
          <option value="1y">1 Year</option>
        </select>
        <button onClick={handlePredict} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {prediction && (
        <div className="results-section">
          <div className="chart-container">
            <Line data={chartData} />
          </div>
          <div className="summary-container">
            <h2>Prediction for {prediction.ticker}</h2>
            <p><strong>Predicted Growth ({duration}):</strong> <span className="highlight">{prediction.growth_percentage}</span></p>
            <p><strong>Recent High:</strong> ${prediction.historical_high.toFixed(2)}</p>
            <p><strong>Recent Low:</strong> ${prediction.historical_low.toFixed(2)}</p>
            <p><strong>Model Accuracy (Est.):</strong> {prediction.prediction_accuracy}</p>
            <h3>Gemini News Analysis</h3>
            <p className="news-analysis">{prediction.news_analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;