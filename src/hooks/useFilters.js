import { useMemo } from 'react';
import { usePetDataContext } from './usePetDataContext';

export const useFilters = () => {
  const { state, dispatch } = usePetDataContext();

  const updateFilter = (filterName, value) => {
    dispatch({
      type: 'UPDATE_FILTER',
      payload: { [filterName]: value },
    });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const updateSort = (column, direction = null) => {
    const newDirection = direction || (state.sort.column === column && state.sort.direction === 'asc' ? 'desc' : 'asc');
    dispatch({
      type: 'UPDATE_SORT',
      payload: { column, direction: newDirection },
    });
  };

  const filteredData = useMemo(() => {
    if (!state.petData) return [];

    let filtered = state.petData;

    // Rarity filter
    if (state.filters.rarity !== 'All') {
      filtered = filtered.filter((pet) => pet.rarity === state.filters.rarity);
    }

    // Name search
    if (state.filters.name) {
      const searchLower = state.filters.name.toLowerCase();
      filtered = filtered.filter((pet) =>
        pet.name.toLowerCase().includes(searchLower)
      );
    }

    // Advanced filter
    const { advancedColumn, advancedCondition, advancedValue } = state.filters;
    if (advancedColumn !== 'None' && advancedCondition !== 'None' && advancedValue !== '') {
      const numValue = parseFloat(advancedValue);
      if (!isNaN(numValue)) {
        filtered = filtered.filter((pet) => {
          const petValue = pet[advancedColumn];
          if (petValue === null || petValue === undefined || isNaN(petValue)) {
            return false;
          }
          switch (advancedCondition) {
            case '>':
              return petValue > numValue;
            case '<':
              return petValue < numValue;
            case '=':
              return Math.abs(petValue - numValue) < 0.001;
            default:
              return true;
          }
        });
      }
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[state.sort.column];
      const bVal = b[state.sort.column];

      const isANull = aVal === null || aVal === undefined || isNaN(aVal);
      const isBNull = bVal === null || bVal === undefined || isNaN(bVal);

      if (isANull && isBNull) return 0;
      if (isANull) return state.sort.direction === 'desc' ? 1 : -1;
      if (isBNull) return state.sort.direction === 'desc' ? -1 : 1;

      if (aVal < bVal) return state.sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return state.sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [state.petData, state.filters, state.sort]);

  return {
    filters: state.filters,
    sort: state.sort,
    filteredData,
    updateFilter,
    resetFilters,
    updateSort,
  };
};
