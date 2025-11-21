const FilterSection = ({ filters, columnOptions, onUpdateFilter, onResetFilters }) => {
  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Ultra-Rare', 'Legendary', 'Unknown'];

  return (
    <div className="input-section">
      <h2>Value Filters</h2>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="rarityFilter">Filter by Rarity:</label>
          <select
            id="rarityFilter"
            value={filters.rarity}
            onChange={(e) => onUpdateFilter('rarity', e.target.value)}
          >
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="nameFilter">Search by Name:</label>
          <input
            id="nameFilter"
            type="text"
            placeholder="e.g. Shadow Dragon"
            value={filters.name}
            onChange={(e) => onUpdateFilter('name', e.target.value)}
          />
        </div>
      </div>

      <h2 style={{ marginTop: '20px' }}>Advanced Filters</h2>
      <div className="advanced-filters">
        <div className="filter-group">
          <label htmlFor="advFilterColumn">Value/Metric:</label>
          <select
            id="advFilterColumn"
            value={filters.advancedColumn}
            onChange={(e) => onUpdateFilter('advancedColumn', e.target.value)}
          >
            <option value="None">-- Select Value --</option>
            {columnOptions.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="advFilterCondition">Condition:</label>
          <select
            id="advFilterCondition"
            value={filters.advancedCondition}
            onChange={(e) => onUpdateFilter('advancedCondition', e.target.value)}
          >
            <option value="None">-- Select Condition --</option>
            <option value=">">Greater Than (&gt;)</option>
            <option value="<">Less Than (&lt;)</option>
            <option value="=">Equal To (=)</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="advFilterValue">Target Value:</label>
          <input
            id="advFilterValue"
            type="number"
            step="0.01"
            placeholder="e.g. 1.5"
            value={filters.advancedValue}
            onChange={(e) => onUpdateFilter('advancedValue', e.target.value)}
          />
        </div>
        <div>
          <button
            className="apply-button"
            onClick={() => {
              /* Filter is already applied via state */
            }}
            style={{ marginTop: '20px' }}
          >
            Apply Filter
          </button>
          <button
            className="clear-button"
            onClick={onResetFilters}
            style={{ marginTop: '20px', marginLeft: '10px' }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
