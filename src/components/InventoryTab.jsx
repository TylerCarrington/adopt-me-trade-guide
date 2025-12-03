import React, { useState } from 'react';
import { usePetDataContext } from '../hooks/usePetDataContext';
import { useInventory } from '../hooks/useInventory';
import { formatForDisplay } from '../utils/calculator.js';
import { TASK_COUNTS } from '../constants.mjs';
import InventoryFilter from './InventoryFilter';
import './InventoryTab.css';

const InventoryTab = ({ tabId, isActive, onSelectPet }) => {
  const { state } = usePetDataContext();
  const { inventory, incrementInventory } = useInventory();
  const petData = state.petData || [];

  const [sort, setSort] = useState({ column: 'name', direction: 'asc' });
  const [filterValue, setFilterValue] = useState('');
  const [filterCondition, setFilterCondition] = useState('None');

  // Calculate total inventory value
  const calculateTotalValue = () => {
    let total = 0;
    Object.entries(inventory).forEach(([petName, counts]) => {
      const pet = petData.find(p => p.name === petName);
      if (pet) {
        total += (pet['Regular Value'] || 0) * (counts.regular || 0);
        total += (pet['Neon Value'] || 0) * (counts.neon || 0);
        total += (pet['Mega Value'] || 0) * (counts.mega || 0);
      }
    });
    return total;
  };

  const resetInventoryFilter = () => {
    setFilterValue('');
    setFilterCondition('None');
  }

  const filterInventory = (pets) => {
    if (filterCondition === 'None' || filterValue === '') {
      return pets;
    }

    const value = parseInt(filterValue, 10);
    if (isNaN(value)) {
      return pets;
    }

    return pets.filter(pet => {
      const regularCount = pet.counts.regular || 0;
      switch (filterCondition) {
        case '>=':
          return regularCount >= value;
        case '<':
          return regularCount < value;
        case '=':
          return regularCount === value;
        default:
          return true;
      }
    });
  };

  // Get pets in inventory with their data
  const inventoryPets = Object.entries(inventory)
    .filter(([_, counts]) => counts.regular > 0 || counts.neon > 0 || counts.mega > 0)
    .map(([petName, counts]) => {
      const petInfo = petData.find(p => p.name === petName);
      const regTotal = (petInfo?.['Regular Value'] || 0) * (counts.regular || 0);
      const neonTotal = (petInfo?.['Neon Value'] || 0) * (counts.neon || 0);
      const megaTotal = (petInfo?.['Mega Value'] || 0) * (counts.mega || 0);
      const itemTotal = regTotal + neonTotal + megaTotal;
      
      const neonGain = (petInfo?.['Neon Value'] || 0) - (petInfo?.['Regular Value'] || 0) * 4;
      const tasks = TASK_COUNTS[petInfo?.rarity || 'Unknown'];
      const weightedNeonGain = !isNaN(neonGain) ? (neonGain / tasks) * 100 : NaN;
      const neonValue = petInfo?.['Neon Value'] || 0;
      const weightedNeonValue = !isNaN(neonValue) && tasks ? (neonValue / tasks) * 100 : NaN;

      return {
        name: petName,
        counts,
        petInfo: petInfo || {
          name: petName,
          'Regular Value': 0,
          'Neon Value': 0,
          'Mega Value': 0,
          rarity: 'Unknown',
        },
        regTotal,
        neonTotal,
        megaTotal,
        itemTotal,
        weightedNeonGain,
        weightedNeonValue
      };
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sort.column) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'rarity':
          aVal = a.petInfo.rarity;
          bVal = b.petInfo.rarity;
          break;
        case 'regular':
          aVal = a.counts.regular;
          bVal = b.counts.regular;
          break;
        case 'regularValue':
          aVal = a.regTotal;
          bVal = b.regTotal;
          break;
        case 'neon':
          aVal = a.counts.neon;
          bVal = b.counts.neon;
          break;
        case 'neonValue':
          aVal = a.neonTotal;
          bVal = b.neonTotal;
          break;
        case 'mega':
          aVal = a.counts.mega;
          bVal = b.counts.mega;
          break;
        case 'megaValue':
          aVal = a.megaTotal;
          bVal = b.megaTotal;
          break;
        case 'total':
          aVal = a.itemTotal;
          bVal = b.itemTotal;
          break;
        case 'weightedNeonGain':
          aVal = a.weightedNeonGain;
          bVal = b.weightedNeonGain;
          break;
        case 'weightedNeonValue':
            aVal = a.weightedNeonValue;
            bVal = b.weightedNeonValue;
            break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string') {
        return sort.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredInventory = filterInventory(inventoryPets);
  const totalValue = calculateTotalValue();

  const handleSort = (column) => {
    setSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (column) => {
    if (sort.column !== column) return '';
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div id={tabId} className={`tab-content ${isActive ? 'active' : ''}`}>
      <div className="inventory-header">
        <h2>Your Pet Inventory</h2>
        <p>Track the specific pets you own and their total value</p>
      </div>

      <div className="inventory-summary">
        <div className="summary-card">
          <h3>Inventory Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Pets:</span>
              <span className="stat-value">{inventoryPets.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">{formatForDisplay('Value', totalValue)} RP</span>
            </div>
          </div>
        </div>
      </div>

      <InventoryFilter 
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filterCondition={filterCondition}
        setFilterCondition={setFilterCondition}
        resetInventoryFilter={resetInventoryFilter}
      />

      {filteredInventory.length === 0 ? (
        <div className="empty-inventory">
          <p>Your inventory is empty or no pets match the current filter.</p>
        </div>
      ) : (
        <table className="inventory-table">
          <thead>
            <tr>
              <th 
                className={`pet-name sortable ${sort.column === 'name' ? 'sorted' : ''}`}
                onClick={() => handleSort('name')}
                title="Click to sort by pet name"
              >
                Pet Name {getSortIndicator('name')}
              </th>
              <th 
                className={`rarity sortable ${sort.column === 'rarity' ? 'sorted' : ''}`}
                onClick={() => handleSort('rarity')}
                title="Click to sort by rarity"
              >
                Rarity {getSortIndicator('rarity')}
              </th>
              <th 
                className={`inventory-count sortable ${sort.column === 'regular' ? 'sorted' : ''}`}
                onClick={() => handleSort('regular')}
                title="Click to sort by regular count"
              >
                Regular {getSortIndicator('regular')}
              </th>
              <th 
                className={`inventory-value sortable ${sort.column === 'regularValue' ? 'sorted' : ''}`}
                onClick={() => handleSort('regularValue')}
                title="Click to sort by regular value"
              >
                Regular Value {getSortIndicator('regularValue')}
              </th>
              <th 
                className={`inventory-count sortable ${sort.column === 'neon' ? 'sorted' : ''}`}
                onClick={() => handleSort('neon')}
                title="Click to sort by neon count"
              >
                Neon {getSortIndicator('neon')}
              </th>
              <th 
                className={`inventory-value sortable ${sort.column === 'neonValue' ? 'sorted' : ''}`}
                onClick={() => handleSort('neonValue')}
                title="Click to sort by neon value"
              >
                Neon Value {getSortIndicator('neonValue')}
              </th>
              <th 
                className={`inventory-count sortable ${sort.column === 'mega' ? 'sorted' : ''}`}
                onClick={() => handleSort('mega')}
                title="Click to sort by mega count"
              >
                Mega {getSortIndicator('mega')}
              </th>
              <th 
                className={`inventory-value sortable ${sort.column === 'megaValue' ? 'sorted' : ''}`}
                onClick={() => handleSort('megaValue')}
                title="Click to sort by mega value"
              >
                Mega Value {getSortIndicator('megaValue')}
              </th>
              <th 
                className={`total-value sortable ${sort.column === 'total' ? 'sorted' : ''}`}
                onClick={() => handleSort('total')}
                title="Click to sort by total value"
              >
                Total Value {getSortIndicator('total')}
              </th>
              <th 
                className={`weighted-neon-gain sortable ${sort.column === 'weightedNeonGain' ? 'sorted' : ''}`}
                onClick={() => handleSort('weightedNeonGain')}
                title="Click to sort by weighted neon gain"
              >
                Weighted Neon Gain {getSortIndicator('weightedNeonGain')}
              </th>
              <th 
                className={`weighted-neon-value sortable ${sort.column === 'weightedNeonValue' ? 'sorted' : ''}`}
                onClick={() => handleSort('weightedNeonValue')}
                title="Click to sort by weighted neon value"
              >
                Weighted Neon Value {getSortIndicator('weightedNeonValue')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const regTotal = (item.petInfo['Regular Value'] || 0) * (item.counts.regular || 0);
              const neonTotal = (item.petInfo['Neon Value'] || 0) * (item.counts.neon || 0);
              const megaTotal = (item.petInfo['Mega Value'] || 0) * (item.counts.mega || 0);
              const itemTotal = regTotal + neonTotal + megaTotal;

              return (
                <tr key={item.name} className="inventory-row">
                  <td 
                    className="pet-name clickable" 
                    onClick={() => onSelectPet && onSelectPet(item.petInfo)}
                    title="Click to view trade recommendations"
                  >
                    {item.name}
                  </td>
                  <td className="rarity">{item.petInfo.rarity}</td>
                  <td className="inventory-count">
                    <div className="count-controls">
                      <button 
                        className="count-btn minus" 
                        onClick={() => incrementInventory(item.name, 'regular', -1)}
                        title="Decrease regular count"
                      >
                        −
                      </button>
                      <span className="count-value">{item.counts.regular}</span>
                      <button 
                        className="count-btn plus" 
                        onClick={() => incrementInventory(item.name, 'regular', 1)}
                        title="Increase regular count"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="inventory-value">
                    {formatForDisplay('Value', regTotal)} RP
                  </td>
                  <td className="inventory-count">
                    <div className="count-controls">
                      <button 
                        className="count-btn minus" 
                        onClick={() => incrementInventory(item.name, 'neon', -1)}
                        title="Decrease neon count"
                      >
                        −
                      </button>
                      <span className="count-value">{item.counts.neon}</span>
                      <button 
                        className="count-btn plus" 
                        onClick={() => incrementInventory(item.name, 'neon', 1)}
                        title="Increase neon count"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="inventory-value">
                    {formatForDisplay('Value', neonTotal)} RP
                  </td>
                  <td className="inventory-count">
                    <div className="count-controls">
                      <button 
                        className="count-btn minus" 
                        onClick={() => incrementInventory(item.name, 'mega', -1)}
                        title="Decrease mega count"
                      >
                        −
                      </button>
                      <span className="count-value">{item.counts.mega}</span>
                      <button 
                        className="count-btn plus" 
                        onClick={() => incrementInventory(item.name, 'mega', 1)}
                        title="Increase mega count"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="inventory-value">
                    {formatForDisplay('Value', megaTotal)} RP
                  </td>
                  <td className="total-value">
                    <strong>{formatForDisplay('Value', itemTotal)} RP</strong>
                  </td>
                  <td className={`weighted-neon-gain ${item.weightedNeonGain >= 0 ? 'positive' : 'negative'}`}>
                    {item.weightedNeonGain >= 0 ? '+' : ''}
                    {formatForDisplay('Value', item.weightedNeonGain)} RP
                  </td>
                  <td className="weighted-neon-value">
                    {formatForDisplay('Value', item.weightedNeonValue)} RP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryTab;
