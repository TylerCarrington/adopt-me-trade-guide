import { useEffect, useCallback } from 'react';
import { usePetDataContext } from './usePetDataContext';
import { fetchAndParseData } from '../utils/scraper.js';
import { calculatePetMetrics } from '../utils/calculator.js';
import { saveSnapshot, loadHistory } from '../utils/history_tracker.js';

export const usePetData = () => {
  const { state, dispatch } = usePetDataContext();

  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const rawPets = await fetchAndParseData();
      const petsWithMetrics = calculatePetMetrics(rawPets);
      
      dispatch({ type: 'SET_PET_DATA', payload: petsWithMetrics });
      
      // Save snapshot to history
      saveSnapshot(petsWithMetrics);
      
      // Load history for trend analysis
      const history = loadHistory();
      dispatch({ type: 'SET_HISTORY_SNAPSHOTS', payload: history });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Critical error during data load:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: `Error: Could not load pet data. ${error.message}. Please try again later.`,
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { petData: state.petData, isLoading: state.isLoading, error: state.error, loadData };
};
