import React from 'react';

const ResultsTable = ({ data, onSort, sortConfig }) => {
  const headers = [
    { key: "image_url", display: "Pet", sortable: false, class: "pet-name" },
    { key: "rarity", display: "Rarity", sortable: true, class: "rarity-cell" },
    { key: "year", display: "Year", sortable: true, class: "year-cell" },
    { key: "Regular Value", display: "Value", sortable: true, class: "calculation" },
    { key: "Neon Value", display: "Neon", sortable: true, class: "calculation" },
    { key: "Mega Value", display: "Mega", sortable: true, class: "calculation" },
    { key: "Neon Rate (N/R)", display: "N Rate", sortable: true, class: "calculation" },
    { key: "Neon Gain (N-4R)", display: "N Gain (V)", sortable: true, class: "calculation" },
    { key: "Weighted Neon Gain", display: "N Gain (W)", sortable: true, class: "calculation" },
    { key: "Mega Rate (M/N)", display: "M Rate", sortable: true, class: "calculation" },
    { key: "Mega Gain (M-4N)", display: "M Gain (V)", sortable: true, class: "calculation" },
    { key: "Weighted Mega Gain", display: "M Gain (W)", sortable: true, class: "calculation" },
    { key: "Trade Rec", display: "Trade Rec", sortable: false, class: "trade-rec" },
  ];

  const getSortIndicator = (headerKey) => {
    if (sortConfig && sortConfig.key === headerKey) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

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
              {header.display}{getSortIndicator(header.key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(pet => (
          <tr key={pet.name}>
            {headers.map(header => {
              let displayValue = pet[header.key] === null || pet[header.key] === undefined ? "—" : pet[header.key];
              if (header.key === 'image_url') {
                const imageUrl = pet["image_url"] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                displayValue = <><img src={imageUrl} alt={pet.name} style={{height: '24px', verticalAlign: 'middle', marginRight: '8px', borderRadius: '4px'}} /> <span>{pet.name}</span></>;
              }
              return <td key={header.key} className={header.class}>{displayValue}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
};

export default ResultsTable;
