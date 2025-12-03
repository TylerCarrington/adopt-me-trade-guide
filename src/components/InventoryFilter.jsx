import React from 'react';
import './InventoryFilter.css';

const InventoryFilter = ({
  filterValue,
  setFilterValue,
  filterCondition,
  setFilterCondition,
  resetInventoryFilter,
}) => {
  return (
    <div className="inventory-filter-section">
      <div className="filter-row">
        <h3>Filter by Regular Count</h3>
        <div className="adv-row">
            <select
              id="inventory-adv-condition"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
            >
              <option value="None">Select Operator</option>
              <option value=">=">At least (&gt;=)</option>
              <option value="<">Less than (&lt;)</option>
              <option value="=">Exactly (=)</option>
            </select>

            <input
              id="inventory-adv-value"
              type="number"
              placeholder="Value"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              min="0"
            />
        </div>
      </div>
      <button className="clear-btn" onClick={resetInventoryFilter}>
        Clear Filter
      </button>
    </div>
  );
};

export default InventoryFilter;
