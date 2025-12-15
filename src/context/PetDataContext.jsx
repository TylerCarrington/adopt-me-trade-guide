import { createContext, useReducer } from 'react';

export const PetDataContext = createContext();

const initialState = {
  petData: [],
  historySnapshots: [],
  isLoading: false,
  error: null,
  filters: {
    rarity: 'All',
    name: '',
    advancedColumn: 'Regular Value',
    advancedCondition: '<=',
    advancedValue: '',
  },
  sort: {
    column: 'Regular Value',
    direction: 'desc',
  },
  trendPeriod: 7,
  trendFilters: {
    rarity: 'All',
    name: '',
    advancedColumn: 'None',
    advancedCondition: 'None',
    advancedValue: '',
  },
  trendSort: {
    column: 'Value Change %',
    direction: 'desc',
  },
  inventory: {},
  selectedPet: null,
  showModal: false,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PET_DATA':
      return { ...state, petData: action.payload };
    
    case 'SET_HISTORY_SNAPSHOTS':
      return { ...state, historySnapshots: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          rarity: 'All',
          name: '',
          advancedColumn: 'Regular Value',
          advancedCondition: '<=',
          advancedValue: '',
        },
      };
    
    case 'UPDATE_SORT':
      return {
        ...state,
        sort: action.payload,
      };
    
    case 'UPDATE_TREND_PERIOD':
      return {
        ...state,
        trendPeriod: action.payload,
      };
    
    case 'UPDATE_TREND_FILTER':
      return {
        ...state,
        trendFilters: { ...state.trendFilters, ...action.payload },
      };
    
    case 'RESET_TREND_FILTERS':
      return {
        ...state,
        trendFilters: {
          rarity: 'All',
          name: '',
          advancedColumn: 'None',
          advancedCondition: 'None',
          advancedValue: '',
        },
      };
    
    case 'UPDATE_TREND_SORT':
      return {
        ...state,
        trendSort: action.payload,
      };
    
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: { ...state.inventory, ...action.payload },
      };
    
    case 'SELECT_PET':
      return {
        ...state,
        selectedPet: action.payload,
        showModal: true,
      };
    
    case 'CLOSE_MODAL':
      return {
        ...state,
        showModal: false,
      };
    
    default:
      return state;
  }
};

export const PetDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <PetDataContext.Provider value={{ state, dispatch }}>
      {children}
    </PetDataContext.Provider>
  );
};
