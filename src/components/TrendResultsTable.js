import React from 'react';

const TrendResultsTable = ({ data, onSort }) => {
  const headers = [
    { key: "image_url", display: "Pet", sortable: false, class: "pet-name" },
    { key: "rarity", display: "Rarity", sortable: true, class: "rarity-cell" },
    { key: "Regular Value", display: "Current Value", sortable: true, class: "calculation" },
    { key: "Value Change", display: "Change", sortable: true, class: "calculation" },
    { key: "Value Change %", display: "Change %", sortable: true, class: "calculation" },
    { key: "Neon Value", display: "Current N", sortable: true, class: "calculation" },
    { key: "Neon Change", display: "N Change", sortable: true, class: "calculation" },
    { key: "Neon Change %", display: "N Change %", sortable: true, class: "calculation" },
    { key: "Mega Value", display: "Current M", sortable: true, class: "calculation" },
    { key: "Mega Change", display: "M Change", sortable: true, class: "calculation" },
    { key: "Mega Change %", display: "M Change %", sortable: true, class: "calculation" },
  ];

  const formatForDisplay = (key, value) => {
    if (value === null || value === undefined) return '—';
    if (key.includes('%')) {
      return `${value.toFixed(1)}%`;
    }
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  }

  return (
    <table>
      <thead>
        <tr>
          {headers.map(header => (
            <th 
              key={header.key} 
              className={`${header.class} ${header.sortable ? 'sortable-header' : ''}`}
              onClick={() => header.sortable && onSort(header.key)}
            >
              {header.display}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(pet => (
          <tr key={pet.name}>
            {headers.map(header => {
              let displayValue = pet[header.key];
              let cellClass = header.class || '';

              if (header.key === 'image_url') {
                const imageUrl = pet["image_url"] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                displayValue = <><img src={imageUrl} alt={pet.name} style={{height: '24px', verticalAlign: 'middle', marginRight: '8px', borderRadius: '4px'}} /> <span>{pet.name}</span></>;
              } else {
                  displayValue = formatForDisplay(header.key, displayValue);
                  if (header.key.includes('Change')) {
                    const numVal = pet[header.key];
                    if (typeof numVal === 'number') {
                        cellClass += (numVal > 0) ? ' gain-win' : (numVal < 0 ? ' gain-loss' : '');
                    }
                  }
              }
              return <td key={header.key} className={cellClass}>{displayValue}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
};

export default TrendResultsTable;
