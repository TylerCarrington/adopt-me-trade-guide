import FilterSection from './FilterSection';
import PetTable from './PetTable';

const ValueAnalysisTab = ({
  tabId,
  filteredData,
  filters,
  sort,
  isLoading,
  error,
  onUpdateFilter,
  onResetFilters,
  onUpdateSort,
  onSelectPet,
  columnOptions,
  isActive,
}) => {
  return (
    <div id={tabId} className={`tab-content ${isActive ? 'active' : ''}`}>
      <FilterSection
        filters={filters}
        columnOptions={columnOptions}
        onUpdateFilter={onUpdateFilter}
        onResetFilters={onResetFilters}
      />
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">Loading pet data. Please wait...</div>}
      {!isLoading && !error && (
        <PetTable
          data={filteredData}
          sort={sort}
          onHeaderClick={onUpdateSort}
          onSelectPet={onSelectPet}
        />
      )}
    </div>
  );
};

export default ValueAnalysisTab;
