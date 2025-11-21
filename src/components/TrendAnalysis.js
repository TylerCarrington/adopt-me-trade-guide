import React, { useState, useEffect, useMemo } from 'react';
import { loadHistory } from '../history_tracker.mjs';
import TrendResultsTable from './TrendResultsTable';

// Helper function to calculate change, adapted from trend_analyzer.mjs
function calculateChange(current, previous) {
    if (isNaN(current) || isNaN(previous) || previous === 0) {
        return { change: null, percent: null };
    }
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { change, percent };
}

// Helper function to find the closest snapshot, adapted from trend_analyzer.mjs
function findClosestSnapshot(history, targetDate) {
    if (!history || history.length === 0) return null;

    const targetTime = targetDate.getTime();
    
    const closestSnapshot = history.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.date).getTime() - targetTime);
        const currDiff = Math.abs(new Date(curr.date).getTime() - targetTime);
        return (currDiff < prevDiff) ? curr : prev;
    });

    return closestSnapshot;
}

const TrendAnalysis = ({ petData }) => {
  const [trendPeriod, setTrendPeriod] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'Value Change %', direction: 'desc' });

  useEffect(() => {
    const history = loadHistory();
    
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - trendPeriod);

    const previousSnapshot = findClosestSnapshot(history, targetDate);

    if (!previousSnapshot) {
        setTrendData([]);
        return;
    }

    const previousPetsMap = new Map(previousSnapshot.pets.map(p => [p.name, p]));
    const calculatedData = [];

    petData.forEach(currentPet => {
      const previousPet = previousPetsMap.get(currentPet.name);
      const trend = {
          name: currentPet.name,
          rarity: currentPet.rarity,
          year: currentPet.year,
          image_url: currentPet.image_url,
          'Regular Value': currentPet['Regular Value'] || null,
          'Neon Value': currentPet['Neon Value'] || null,
          'Mega Value': currentPet['Mega Value'] || null,
          'Value Change': null, 'Value Change %': null,
          'Neon Change': null, 'Neon Change %': null,
          'Mega Change': null, 'Mega Change %': null,
      };

      if (previousPet) {
          const regTrend = calculateChange(currentPet['Regular Value'], previousPet.regular);
          trend['Value Change'] = regTrend.change;
          trend['Value Change %'] = regTrend.percent;

          const neonTrend = calculateChange(currentPet['Neon Value'], previousPet.neon);
          trend['Neon Change'] = neonTrend.change;
          trend['Neon Change %'] = neonTrend.percent;

          const megaTrend = calculateChange(currentPet['Mega Value'], previousPet.mega);
          trend['Mega Change'] = megaTrend.change;
          trend['Mega Change %'] = megaTrend.percent;
      }
      calculatedData.push(trend);
    });
    setTrendData(calculatedData);

  }, [petData, trendPeriod]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let data = [...trendData];
    data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const isANull = aVal === null || aVal === undefined || isNaN(aVal);
      const isBNull = bVal === null || bVal === undefined || isNaN(bVal);
      if (isANull && isBNull) return 0;
      if (isANull) return sortConfig.direction === 'desc' ? 1 : -1;
      if (isBNull) return sortConfig.direction === 'desc' ? -1 : 1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [trendData, sortConfig]);


  return (
    <div>
        <h2>Trend Analyzer</h2>
        <div className="input-section">
            <div className="filter-group">
                <label htmlFor="trendPeriod">Trend Period:</label>
                <select id="trendPeriod" value={trendPeriod} onChange={e => setTrendPeriod(parseInt(e.target.value, 10))}>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                </select>
            </div>
        </div>
      <TrendResultsTable data={sortedData} onSort={handleSort} />
    </div>
  );
};

export default TrendAnalysis;
