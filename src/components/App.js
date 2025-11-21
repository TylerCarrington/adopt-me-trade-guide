import React, { useState, useEffect } from 'react';
import ValueAnalysis from './ValueAnalysis';
import TrendAnalysis from './TrendAnalysis';
import PetInventory from './PetInventory';
import TradeRecommender from './TradeRecommender';
import { fetchAndParseData } from '../scraper.mjs';
import { calculatePetMetrics } from '../calculator.mjs';
import './TradeRecommender.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('value-analysis');
  const [petData, setPetData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawPets = await fetchAndParseData();
        const petsWithMetrics = calculatePetMetrics(rawPets);
        setPetData(petsWithMetrics);
      } catch (error) {
        console.error("Error loading pet data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <div className="header-container">
        <h1>Adopt Me Pet Value Tracker</h1>
        <button id="refreshDataButton">🔄 Refresh Data</button>
      </div>
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'value-analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('value-analysis')}
        >
          Value Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'trend-analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('trend-analysis')}
        >
          Trend Analyzer
        </button>
        <button 
          className={`tab-button ${activeTab === 'pet-inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('pet-inventory')}
        >
          Pet Inventory
        </button>
      </div>

      {loading ? (
        <p>Loading pet data. Please wait...</p>
      ) : (
        <>
          {activeTab === 'value-analysis' && <ValueAnalysis petData={petData} />}
          {activeTab === 'trend-analysis' && <TrendAnalysis petData={petData} />}
          {activeTab === 'pet-inventory' && <PetInventory petData={petData} />}
        </> 
      )}
      <TradeRecommender />
    </div>
  );
};

export default App;
