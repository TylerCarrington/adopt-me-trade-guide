import { useEffect, useCallback } from 'react';
import { usePetDataContext } from './usePetDataContext';

const INVENTORY_STORAGE_KEY = 'petInventory';

export const useInventory = () => {
  const { state, dispatch } = usePetDataContext();

  // Load inventory from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (stored) {
        const inventory = JSON.parse(stored);
        dispatch({ type: 'UPDATE_INVENTORY', payload: inventory });
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }, [dispatch]);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state.inventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }, [state.inventory]);

  const getInventory = useCallback((petName) => {
    return (
      state.inventory[petName] || { regular: 0, neon: 0, mega: 0 }
    );
  }, [state.inventory]);

  const updateInventory = useCallback((petName, regular, neon, mega) => {
    const clamped = (val) => Math.max(0, Math.min(100, val));
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        [petName]: {
          regular: clamped(regular),
          neon: clamped(neon),
          mega: clamped(mega),
        },
      },
    });
  }, [dispatch]);

  const incrementInventory = useCallback((petName, type, delta) => {
    const current = getInventory(petName);
    const newValue = Math.max(0, Math.min(100, (current[type] || 0) + delta));
    updateInventory(
      petName,
      type === 'regular' ? newValue : current.regular,
      type === 'neon' ? newValue : current.neon,
      type === 'mega' ? newValue : current.mega
    );
  }, [getInventory, updateInventory]);

  return {
    inventory: state.inventory,
    getInventory,
    updateInventory,
    incrementInventory,
  };
};
