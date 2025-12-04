import React from 'react';
import TrendRow from './TrendRow';
import './TrendTable.css';

const TrendTable = ({ trendData, trendSort, onSortChange, onSelectPet }) => {
  const headers = [
    { key: 'image_url', display: 'Pet', sortable: false },
    { key: 'rarity', display: 'Rarity', sortable: true },
    { key: 'year', display: 'Year', sortable: true },
    { key: 'Regular Value', display: 'Current Value', sortable: true },
    { key: 'Value Change', display: 'Change', sortable: true },
    { key: 'Value Change %', display: 'Change %', sortable: true },
    { key: 'PPV', display: 'PPV', sortable: true },
    { key: 'PPV Change', display: 'PPV Change', sortable: true },
    { key: 'PPV Change %', display: 'PPV %', sortable: true },
    { key: 'P-R', display: 'P-R', sortable: true },
    { key: 'P-R Change', display: 'P-R Change', sortable: true },
    { key: 'P-R Change %', display: 'P-R %', sortable: true },
    { key: 'Neon Value', display: 'Current Neon', sortable: true },
    { key: 'Neon Change', display: 'Neon Change', sortable: true },
    { key: 'Neon Change %', display: 'Neon %', sortable: true },
    { key: 'Mega Value', display: 'Current Mega', sortable: true },
    { key: 'Mega Change', display: 'Mega Change', sortable: true },
    { key: 'Mega Change %', display: 'Mega %', sortable: true },
  ];

  const handleHeaderClick = (key) => {
    if (headers.find(h => h.key === key)?.sortable) {
      onSortChange(key);
    }
  };

  if (trendData.length === 0) {
    return (
      <div className="trend-table-container">
        <p className="no-data">No trend data available. Please check your filters or historical data.</p>
      </div>
    );
  }

  return (
    <div className="trend-table-container">
      <table className="trend-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                onClick={() => handleHeaderClick(header.key)}
                className={`header-${header.key.toLowerCase().replace(/\s+/g, '-')} ${
                  header.sortable ? 'sortable' : ''
                } ${trendSort.column === header.key ? `sort-${trendSort.direction}` : ''}`}
              >
                {header.display}
                {header.sortable && trendSort.column === header.key && (
                  <span className="sort-indicator">{trendSort.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trendData.map((pet) => (
            <TrendRow key={pet.name} pet={pet} onSelectPet={onSelectPet} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrendTable;
