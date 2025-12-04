import { formatForDisplay } from '../utils/calculator.js';
import PetRow from './PetRow';

const PetTable = ({ data, sort, onHeaderClick, onSelectPet }) => {
  const headers = [
    { key: 'image_url', display: 'Pet', sortable: false, class: 'pet-name' },
    { key: 'rarity', display: 'Rarity', sortable: true, class: 'rarity-cell' },
    { key: 'year', display: 'Year', sortable: true, class: 'year-cell' },
    { key: 'Regular Value', display: 'Value', sortable: true, class: 'calculation' },
    { key: 'PPV', display: 'PPV', sortable: true, class: 'calculation' },
    { key: 'P-R', display: 'P-R', sortable: true, class: 'calculation' },
    {
      key: 'Neon Value',
      display: 'Neon Value',
      sortable: true,
      class: 'calculation',
    },
    {
      key: 'Neon Gain (N-4R)',
      display: 'Neon Gain',
      sortable: true,
      class: 'calculation',
    },
    {
      key: 'Mega Value',
      display: 'Mega Value',
      sortable: true,
      class: 'calculation',
    },
    {
      key: 'Mega Gain (M-4N)',
      display: 'Mega Gain',
      sortable: true,
      class: 'calculation',
    },
    {
      key: 'Weighted Neon Gain',
      display: 'Weighted Gain',
      sortable: true,
      class: 'calculation',
    },
    { key: 'Tasks', display: 'Tasks', sortable: true, class: 'calculation' },
    {
      key: 'trade-rec',
      display: 'Trade Rec',
      sortable: false,
      class: 'trade-rec',
    },
  ];

  const renderHeaderCell = (header) => {
    if (!header.sortable) {
      return (
        <th key={header.key} className={header.class}>
          {header.display}
        </th>
      );
    }

    const isSorted = sort.column === header.key;
    const arrowClass = isSorted ? (sort.direction === 'asc' ? '↑' : '↓') : '';

    return (
      <th
        key={header.key}
        className={`sortable ${header.class} ${isSorted ? 'sorted' : ''}`}
        onClick={() => onHeaderClick(header.key)}
        title={`Click to sort by ${header.display}`}
      >
        {header.display} {arrowClass}
      </th>
    );
  };

  return (
    <div id="results">
      {data.length === 0 ? (
        <p>No pets found matching your filters.</p>
      ) : (
        <table>
          <thead>
            <tr>{headers.map(renderHeaderCell)}</tr>
          </thead>
          <tbody>
            {data.map((pet) => (
              <PetRow key={pet.name} pet={pet} onSelectPet={onSelectPet} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PetTable;
