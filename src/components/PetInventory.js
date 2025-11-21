import React, { useState, useEffect, useMemo } from 'react';
import { generateTradeRecommendations } from '../trade_logic.mjs';

const PetInventory = ({ petData }) => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeRecommendations, setTradeRecommendations] = useState('');

  useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem('petInventory')) || [];
    setInventory(savedInventory);
  }, []);

  useEffect(() => {
    localStorage.setItem('petInventory', JSON.stringify(inventory));
  }, [inventory]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredSuggestions = petData.filter(pet => 
        pet.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const addPetToInventory = (pet) => {
    setInventory([...inventory, pet]);
    setSearchTerm('');
    setSuggestions([]);
  };

  const removePetFromInventory = (petName) => {
    setInventory(inventory.filter(pet => pet.name !== petName));
  };

  const openTradeRecommender = (pet) => {
    const recommendationsHTML = generateTradeRecommendations(pet, petData);
    setTradeRecommendations(recommendationsHTML);
    setTradeModalOpen(true);
  };

  const closeTradeRecommender = () => {
    setTradeModalOpen(false);
    setTradeRecommendations('');
  };

  const inventoryValue = useMemo(() => {
    return inventory.reduce((total, pet) => total + (pet['Regular Value'] || 0), 0);
  }, [inventory]);

  return (
    <div id="pet-inventory">
      <h2>Pet Inventory</h2>
      <div className="input-section">
        <div className="filter-group">
          <label htmlFor="pet-search">Add a Pet:</label>
          <input 
            type="text" 
            id="pet-search" 
            value={searchTerm} 
            onChange={handleSearchChange} 
            placeholder="Search for a pet..." 
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map(pet => (
                <li key={pet.name} onClick={() => addPetToInventory(pet)}>
                  {pet.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div>
        <h3>Your Pets:</h3>
        <p>Total Inventory Value: {inventoryValue.toFixed(2)} RP</p>
        <ul>
          {inventory.map(pet => (
            <li key={pet.name}>
              <span>{pet.name} - {pet['Regular Value'] || 'N/A'} RP</span>
              <div>
                <button onClick={() => openTradeRecommender(pet)}>Find Trades</button>
                <button onClick={() => removePetFromInventory(pet.name)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {tradeModalOpen && (
        <div id="trade-modal" className="modal" style={{display: 'block'}}>
          <div className="modal-content">
            <span className="close-button" onClick={closeTradeRecommender}>&times;</span>
            <div dangerouslySetInnerHTML={{ __html: tradeRecommendations }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PetInventory;
