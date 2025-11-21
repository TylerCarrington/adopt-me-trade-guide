import { useState } from 'react';
import { usePetData } from './hooks/usePetData';
import { useFilters } from './hooks/useFilters';
import { usePetDataContext } from './hooks/usePetDataContext';
import Header from './components/Header';
import TabContainer from './components/TabContainer';
import ValueAnalysisTab from './components/ValueAnalysisTab';
import TrendAnalysisTab from './components/TrendAnalysisTab';
import InventoryTab from './components/InventoryTab';
import TradeRecommendationsModal from './components/TradeRecommendationsModal';
import './styles/index.scss';

function App() {
  const [activeTab, setActiveTab] = useState('value-analysis');
  const { state, dispatch } = usePetDataContext();
  const { isLoading, error, loadData } = usePetData();
  const { filteredData, filters, sort, updateFilter, resetFilters, updateSort } = useFilters();

  const handleRefresh = () => {
    // Call with forceRefresh=true to bypass cache and fetch fresh data
    loadData(true);
  };

  const handleSelectPet = (pet) => {
    dispatch({ type: 'SELECT_PET', payload: pet });
  };

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} />
      <TabContainer activeTab={activeTab} onTabChange={setActiveTab}>
        <ValueAnalysisTab
          tabId="value-analysis"
          isActive={activeTab === 'value-analysis'}
          filteredData={filteredData}
          filters={filters}
          sort={sort}
          isLoading={isLoading}
          error={error}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
          onUpdateSort={updateSort}
          onSelectPet={handleSelectPet}
          columnOptions={getColumnOptions(state.petData)}
        />
        <TrendAnalysisTab
          tabId="trend-analysis"
          isActive={activeTab === 'trend-analysis'}
          onSelectPet={handleSelectPet}
        />
        <InventoryTab
          tabId="inventory"
          isActive={activeTab === 'inventory'}
          onSelectPet={handleSelectPet}
        />
      </TabContainer>
      {state.showModal && state.selectedPet && (
        <TradeRecommendationsModal
          pet={state.selectedPet}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

// Helper function to extract column options from pet data
const getColumnOptions = (petData) => {
  if (!petData || petData.length === 0) return [];
  const firstPet = petData[0];
  return Object.keys(firstPet).filter(
    (key) =>
      typeof firstPet[key] === 'number' &&
      !['image_url', 'year'].includes(key)
  );
};

export default App;
