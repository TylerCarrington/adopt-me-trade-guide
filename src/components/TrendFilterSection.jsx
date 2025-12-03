import React from 'react';
import './TrendFilterSection.css';

const TrendFilterSection = ({
  trendPeriod,
  setTrendPeriod,
  trendFilters,
  updateTrendFilter,
  resetTrendFilters,
  showOnlyChanged,
  setShowOnlyChanged,
}) => {
  const handlePeriodValueChange = (e) => {
    const parsedValue = parseInt(e.target.value, 10);
    setTrendPeriod({ ...trendPeriod, value: isNaN(parsedValue) ? '' : parsedValue });
  };

  const handlePeriodUnitChange = (e) => {
    setTrendPeriod({ ...trendPeriod, unit: e.target.value });
  };

  return (
    <div className="trend-filter-section">
      <div className="period-selector">
        <label htmlFor="trend-period-value">Select Period:</label>
        <input
          id="trend-period-value"
          type="number"
          value={trendPeriod.value}
          onChange={handlePeriodValueChange}
          min="1"
        />
        <select
          id="trend-period-unit"
          value={trendPeriod.unit}
          onChange={handlePeriodUnitChange}
        >
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
      </div>

      <div className="filter-row">
        <label htmlFor="show-only-changed">Show Only Changed:</label>
        <input
          id="show-only-changed"
          type="checkbox"
          checked={showOnlyChanged}
          onChange={(e) => setShowOnlyChanged(e.target.checked)}
        />
      </div>

      <div className="filter-row">
        <label htmlFor="trend-rarity-filter">Rarity:</label>
        <select
          id="trend-rarity-filter"
          value={trendFilters.rarityFilter}
          onChange={(e) => updateTrendFilter('rarityFilter', e.target.value)}
        >
          <option value="All">All</option>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Ultra-Rare">Ultra-Rare</option>
          <option value="Legendary">Legendary</option>
        </select>
      </div>

      <div className="filter-row">
        <label htmlFor="trend-name-filter">Name:</label>
        <input
          id="trend-name-filter"
          type="text"
          placeholder="Search pet name..."
          value={trendFilters.nameFilter}
          onChange={(e) => updateTrendFilter('nameFilter', e.target.value)}
        />
      </div>

      <div className="advanced-filter">
        <h3>Advanced Filter</h3>
        <div className="adv-row">
          <select
            id="trend-adv-column"
            value={trendFilters.advancedColumn}
            onChange={(e) => updateTrendFilter('advancedColumn', e.target.value)}
          >
            <option value="None">Select Column</option>
            <option value="Regular Value">Current Value</option>
            <option value="Value Change">Change Amount</option>
            <option value="Value Change %">Change %</option>
            <option value="Neon Value">Neon Value</option>
            <option value="Neon Change">Neon Change</option>
            <option value="Neon Change %">Neon Change %</option>
            <option value="Mega Value">Mega Value</option>
            <option value="Mega Change">Mega Change</option>
            <option value="Mega Change %">Mega Change %</option>
          </select>

          <select
            id="trend-adv-condition"
            value={trendFilters.advancedCondition}
            onChange={(e) => updateTrendFilter('advancedCondition', e.target.value)}
          >
            <option value="None">Select Operator</option>
            <option value=">">Greater than (&gt;)</option>
            <option value="<">Less than (&lt;)</option>
            <option value="=">Equal (=)</option>
          </select>

          <input
            id="trend-adv-value"
            type="number"
            placeholder="Value"
            value={trendFilters.advancedValue}
            onChange={(e) => updateTrendFilter('advancedValue', e.target.value)}
          />
        </div>
      </div>

      <button className="clear-btn" onClick={resetTrendFilters}>
        Clear All Filters
      </button>
    </div>
  );
};

export default TrendFilterSection;
