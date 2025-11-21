import React from 'react';

const FilterControls = ({ rarities, onFilterChange }) => {
  return (
    <div className="input-section">
      <h2>Value Filters</h2>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="rarityFilter">Filter by Rarity:</label>
          <select id="rarityFilter" onChange={(e) => onFilterChange('rarity', e.target.value)}>
            <option value="All">All Rarities</option>
            {rarities.map(rarity => <option key={rarity} value={rarity}>{rarity}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="nameFilter">Search by Name:</label>
          <input type="text" id="nameFilter" placeholder="e.g. Shadow Dragon" onChange={(e) => onFilterChange('name', e.target.value)} />
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
