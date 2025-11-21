import { useState, useMemo, useCallback } from 'react';
import { calculateTrendData, applyTrendFiltersAndSort } from '../utils/trend_analyzer.js';

/**
 * Hook to manage trend data, filtering, and sorting
 * Mirrors the logic from trend_analyzer.mjs but in React with hooks
 */
export const useTrendData = (petData, historySnapshots) => {
  const [trendPeriod, setTrendPeriod] = useState(7); // Default 7 days
  const [trendFilters, setTrendFilters] = useState({
    nameFilter: '',
    rarityFilter: 'All',
    advancedColumn: 'None',
    advancedCondition: 'None',
    advancedValue: '',
  });
  const [trendSort, setTrendSort] = useState({
    column: 'Value Change %',
    direction: 'desc',
  });

  // Calculate trend data whenever period or source data changes
  const rawTrendData = useMemo(() => {
    if (!petData || petData.length === 0 || !historySnapshots || historySnapshots.length === 0) {
      return [];
    }

    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - trendPeriod);

    // Find closest historical snapshot
    const closestSnapshot = historySnapshots.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.date).getTime() - targetDate.getTime());
      const currDiff = Math.abs(new Date(curr.date).getTime() - targetDate.getTime());
      return currDiff < prevDiff ? curr : prev;
    }, historySnapshots[0]);

    if (!closestSnapshot) return [];

    const previousPetsMap = new Map(closestSnapshot.pets.map(p => [p.name, p]));
    const trendData = [];

    const calculateChange = (current, previous) => {
      if (isNaN(current) || isNaN(previous) || previous === 0) {
        return { change: null, percent: null };
      }
      const change = current - previous;
      const percent = (change / previous) * 100;
      return { change, percent };
    };

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
        'Value Change': null,
        'Value Change %': null,
        'Neon Change': null,
        'Neon Change %': null,
        'Mega Change': null,
        'Mega Change %': null,
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

      trendData.push(trend);
    });

    return trendData;
  }, [petData, historySnapshots, trendPeriod]);

  // Filter and sort trend data
  const filteredTrendData = useMemo(() => {
    const advValue = parseFloat(trendFilters.advancedValue) || 0;

    let filtered = rawTrendData.filter(pet => {
      // Rarity filter
      if (trendFilters.rarityFilter !== 'All' && pet.rarity !== trendFilters.rarityFilter) {
        return false;
      }

      // Name filter
      if (trendFilters.nameFilter && !pet.name.toLowerCase().includes(trendFilters.nameFilter.toLowerCase())) {
        return false;
      }

      // Advanced filter
      if (trendFilters.advancedColumn !== 'None' && trendFilters.advancedCondition !== 'None') {
        const petValue = pet[trendFilters.advancedColumn];
        if (petValue === null || petValue === undefined || isNaN(petValue)) {
          return false;
        }

        switch (trendFilters.advancedCondition) {
          case '>':
            if (!(petValue > advValue)) return false;
            break;
          case '<':
            if (!(petValue < advValue)) return false;
            break;
          case '=':
            if (!(Math.abs(petValue - advValue) < 0.001)) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[trendSort.column];
      const bVal = b[trendSort.column];

      const isANull = aVal === null || aVal === undefined || isNaN(aVal);
      const isBNull = bVal === null || bVal === undefined || isNaN(bVal);

      if (isANull && isBNull) return 0;
      if (isANull) return trendSort.direction === 'desc' ? 1 : -1;
      if (isBNull) return trendSort.direction === 'desc' ? -1 : 1;

      if (aVal < bVal) return trendSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return trendSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rawTrendData, trendFilters, trendSort]);

  // Update filter handlers
  const updateTrendFilter = useCallback((filterName, value) => {
    setTrendFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  }, []);

  const updateTrendSort = useCallback((column) => {
    setTrendSort(prev => {
      if (prev.column === column) {
        return { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'desc' };
    });
  }, []);

  const resetTrendFilters = useCallback(() => {
    setTrendFilters({
      nameFilter: '',
      rarityFilter: 'All',
      advancedColumn: 'None',
      advancedCondition: 'None',
      advancedValue: '',
    });
  }, []);

  return {
    filteredTrendData,
    trendPeriod,
    setTrendPeriod,
    trendFilters,
    updateTrendFilter,
    trendSort,
    updateTrendSort,
    resetTrendFilters,
  };
};

export default useTrendData;
