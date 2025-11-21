import React, { useState } from 'react';
import './Header.css';

const Header = ({ onRefresh, activeTab, onTabChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'value-analysis', label: 'Value Analysis' },
    { id: 'trend-analysis', label: 'Trend Analyzer' },
    { id: 'inventory', label: 'Pet Inventory' },
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setMenuOpen(false); // Close menu after selecting
  };

  return (
    <nav className="sticky-header">
      <div className="nav-container">
        {/* Left side - Logo and Refresh */}
        <div className="nav-left">
          <h1 className="app-title">🚀 Adopt Me Trade Guide</h1>
          <button className="refresh-button" onClick={onRefresh} title="Refresh Data">
            🔄 Refresh
          </button>
        </div>

        {/* Hamburger menu button (mobile) */}
        <button 
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          title="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Right side - Tabs */}
        <div className={`nav-tabs ${menuOpen ? 'active' : ''}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Header;
