import React, { useState, useMemo } from 'react';
import FilterControls from './FilterControls';
import ResultsTable from './ResultsTable';

const ValueAnalysis = ({ petData }) => {
  const [filters, setFilters] = useState({ rarity: 'All', name: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'Regular Value', direction: 'desc' });

  const rarities = useMemo(() => [...new Set(petData.map(pet => pet.rarity))].filter(r => r).sort(), [petData]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'desc' });
    }
  };

  const filteredData = useMemo(() => {
    let data = [...petData];
    if (filters.rarity !== 'All') {
      data = data.filter(pet => pet.rarity === filters.rarity);
    }
    if (filters.name) {
      data = data.filter(pet => pet.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    return data;
  }, [petData, filters]);

  const sortedData = useMemo(() => {
    let data = [...filteredData];
    data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const isANull = aVal === null || aVal === undefined || isNaN(aVal);
      const isBNull = bVal === null || bVal === undefined || isNaN(bVal);
      if (isANull && isBNull) return 0;
      if (isANull) return sortConfig.direction === 'desc' ? 1 : -1;
      if (isBNull) return sortConfig.direction === 'desc' ? -1 : 1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [filteredData, sortConfig]);

  return (
    <div>
      <FilterControls rarities={rarities} onFilterChange={handleFilterChange} />
      <ResultsTable data={sortedData} onSort={handleSort} sortConfig={sortConfig} />
    </div>
  );
};

export default ValueAnalysis;
