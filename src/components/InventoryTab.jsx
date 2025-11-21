import React from 'react';
import { usePetDataContext } from '../hooks/usePetDataContext';
import { useInventory } from '../hooks/useInventory';
import { formatForDisplay } from '../utils/calculator.js';
import './InventoryTab.css';

const InventoryTab = ({ tabId, isActive, onSelectPet }) => {
  const { state } = usePetDataContext();
  const { inventory, incrementInventory } = useInventory();
  const petData = state.petData || [];

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

  // Get pets in inventory with their data
  const inventoryPets = Object.entries(inventory)
    .filter(([_, counts]) => counts.regular > 0 || counts.neon > 0 || counts.mega > 0)
    .map(([petName, counts]) => {
      const petInfo = petData.find(p => p.name === petName);
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
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalValue = calculateTotalValue();

  if (!isActive) {
    return null;
  }

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

      {inventoryPets.length === 0 ? (
        <div className="empty-inventory">
          <p>Your inventory is empty. Add pets from the Value Analysis tab to get started!</p>
        </div>
      ) : (
        <table className="inventory-table">
          <thead>
            <tr>
              <th className="pet-name">Pet Name</th>
              <th className="rarity">Rarity</th>
              <th className="inventory-count">Regular</th>
              <th className="inventory-value">Regular Value</th>
              <th className="inventory-count">Neon</th>
              <th className="inventory-value">Neon Value</th>
              <th className="inventory-count">Mega</th>
              <th className="inventory-value">Mega Value</th>
              <th className="total-value">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {inventoryPets.map((item) => {
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
