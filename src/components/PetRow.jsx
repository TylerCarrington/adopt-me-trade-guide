import { formatForDisplay } from '../utils/calculator.js';

const PetRow = ({ pet, onSelectPet }) => {
  return (
    <tr>
      <td className="pet-name" onClick={() => onSelectPet(pet)}>
        <img
          src={pet.image_url}
          alt={pet.name}
          style={{ width: '30px', height: '30px', marginRight: '8px' }}
        />
        {pet.name}
      </td>
      <td className="rarity-cell">{pet.rarity}</td>
      <td className="year-cell">{pet.year}</td>
      <td className="calculation">{formatForDisplay('Value', pet['Regular Value'])}</td>
      <td className="calculation">{formatForDisplay('PPV', pet['PPV'])}</td>
      <td className="calculation">{formatForDisplay('P-R', pet['P-R'])}</td>
      <td className="calculation">{formatForDisplay('Value', pet['Neon Value'])}</td>
      <td className="calculation">{formatForDisplay('Gain', pet['Neon Gain (N-4R)'])}</td>
      <td className="calculation">{formatForDisplay('Value', pet['Mega Value'])}</td>
      <td className="calculation">{formatForDisplay('Gain', pet['Mega Gain (M-4N)'])}</td>
      <td className="calculation">
        {formatForDisplay('Weighted Gain', pet['Weighted Neon Gain'])}      
      </td>
      <td className="calculation">{pet.Tasks}</td>
      <td className="trade-rec">
        <button
          className="recommend-button"
          onClick={() => onSelectPet(pet)}
          title={`View trade recommendations for ${pet.name}`}
        >
          💰 Trade Rec
        </button>
      </td>
    </tr>
  );
};

export default PetRow;
