import React from 'react';
import { usePetDataContext } from '../hooks/usePetDataContext';
import useTrendData from '../hooks/useTrendData';
import TrendFilterSection from './TrendFilterSection';
import TrendTable from './TrendTable';
import './TrendAnalysisTab.css';

const TrendAnalysisTab = ({ tabId, onSelectPet, isActive }) => {
  const { state } = usePetDataContext();
  const { petData, historySnapshots } = state;

  const {
    filteredTrendData,
    trendPeriod,
    setTrendPeriod,
    trendFilters,
    updateTrendFilter,
    trendSort,
    updateTrendSort,
    resetTrendFilters,
    showOnlyChanged,
    setShowOnlyChanged,
  } = useTrendData(petData, historySnapshots);

  return (
    <div id={tabId} className={`tab-content ${isActive ? 'active' : ''}`}>
      <div className="trend-header">
        <h2>Trend Analysis</h2>
        <p>Track pet value changes over time</p>
      </div>

      <TrendFilterSection
        trendPeriod={trendPeriod}
        setTrendPeriod={setTrendPeriod}
        trendFilters={trendFilters}
        updateTrendFilter={updateTrendFilter}
        resetTrendFilters={resetTrendFilters}
        showOnlyChanged={showOnlyChanged}
        setShowOnlyChanged={setShowOnlyChanged}
      />

      <TrendTable
        trendData={filteredTrendData}
        trendSort={trendSort}
        onSortChange={updateTrendSort}
        onSelectPet={onSelectPet}
      />
    </div>
  );
};

export default TrendAnalysisTab;
