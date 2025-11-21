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
      let rawPets;
      try {
        // Try to fetch from external API first
        rawPets = await fetchAndParseData();
      } catch (fetchError) {
        console.warn('Failed to fetch from external API, attempting fallback...', fetchError);
        // Fall back to loading history snapshots which contain the pet data
        const history = loadHistory();
        if (history.length > 0) {
          // Use the most recent snapshot as current data
          const latestSnapshot = history[history.length - 1];
          rawPets = latestSnapshot.pets.map(pet => ({
            name: pet.name,
            rarity: pet.rarity,
            year: pet.year,
            image_url: pet.image_url,
            regular: pet.regular,
            neon: pet.neon,
            mega: pet.mega,
          }));
        } else {
          throw fetchError; // If no fallback data, throw the original error
        }
      }
      
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
      // Try one more time with loaded history as absolute fallback
      try {
        const history = loadHistory();
        if (history.length > 0) {
          const latestSnapshot = history[history.length - 1];
          const rawPets = latestSnapshot.pets.map(pet => ({
            name: pet.name,
            rarity: pet.rarity,
            year: pet.year,
            image_url: pet.image_url,
            regular: pet.regular,
            neon: pet.neon,
            mega: pet.mega,
          }));
          const petsWithMetrics = calculatePetMetrics(rawPets);
          dispatch({ type: 'SET_PET_DATA', payload: petsWithMetrics });
          dispatch({ type: 'SET_HISTORY_SNAPSHOTS', payload: history });
          dispatch({ type: 'SET_LOADING', payload: false });
          console.log('Successfully loaded from history fallback');
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
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
