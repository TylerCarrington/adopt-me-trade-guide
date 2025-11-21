import { useContext } from 'react';
import { PetDataContext } from '../context/PetDataContext';

export const usePetDataContext = () => {
  const context = useContext(PetDataContext);
  if (!context) {
    throw new Error('usePetDataContext must be used within PetDataProvider');
  }
  return context;
};
