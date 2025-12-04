import React from 'react';
import { formatForDisplay } from '../utils/calculator.js';
import './TrendRow.css';

const TrendRow = ({ pet, onSelectPet }) => {
  const getChangeColor = (value) => {
    if (value === null || isNaN(value)) return 'neutral';
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const formatChangeValue = (value) => {
    if (value === null || isNaN(value)) return 'N/A';
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  const handleRowClick = () => {
    if (onSelectPet) {
      onSelectPet(pet);
    }
  };

  return (
    <tr className="trend-row" onClick={handleRowClick}>
      <td className="pet-image">
        {pet.image_url ? (
          <div>
            <img src={pet.image_url} alt={pet.name} title={pet.name} />
            <span>{pet.name}</span>
          </div>
        ) : (
          <span>{pet.name}</span>
        )}
      </td>
      <td className="rarity">{pet.rarity}</td>
      <td className="year">{pet.year}</td>
      
      {/* Current Value */}
      <td className="value">
        {formatForDisplay('Value', pet['Regular Value'])} 
      </td>
      
      {/* Value Change Amount */}
      <td className={`change ${getChangeColor(pet['Value Change'])}`}>
        {formatChangeValue(pet['Value Change'])}
      </td>
      
      {/* Value Change % */}
      <td className={`change-percent ${getChangeColor(pet['Value Change %'])}`}>
        {formatChangeValue(pet['Value Change %'])}%
      </td>
      
      {/* PPV */}
      <td className="value">
        {formatForDisplay('PPV', pet['PPV'])} 
      </td>

      {/* PPV Change Amount */}
      <td className={`change ${getChangeColor(pet['PPV Change'])}`}>
        {formatChangeValue(pet['PPV Change'])}
      </td>
      
      {/* PPV Change % */}
      <td className={`change-percent ${getChangeColor(pet['PPV Change %'])}`}>
        {formatChangeValue(pet['PPV Change %'])}%
      </td>

      {/* P-R */}
      <td className="value">
        {formatForDisplay('P-R', pet['P-R'])} 
      </td>

      {/* P-R Change Amount */}
      <td className={`change ${getChangeColor(pet['P-R Change'])}`}>
        {formatChangeValue(pet['P-R Change'])}
      </td>
      
      {/* P-R Change % */}
      <td className={`change-percent ${getChangeColor(pet['P-R Change %'])}`}>
        {formatChangeValue(pet['P-R Change %'])}%
      </td>
      
      {/* Neon Value */}
      <td className="value">
        {formatForDisplay('Value', pet['Neon Value'])} 
      </td>
      
      {/* Neon Change Amount */}
      <td className={`change ${getChangeColor(pet['Neon Change'])}`}>
        {formatChangeValue(pet['Neon Change'])}
      </td>
      
      {/* Neon Change % */}
      <td className={`change-percent ${getChangeColor(pet['Neon Change %'])}`}>
        {formatChangeValue(pet['Neon Change %'])}%
      </td>
      
      {/* Mega Value */}
      <td className="value">
        {formatForDisplay('Value', pet['Mega Value'])} 
      </td>
      
      {/* Mega Change Amount */}
      <td className={`change ${getChangeColor(pet['Mega Change'])}`}>
        {formatChangeValue(pet['Mega Change'])}
      </td>
      
      {/* Mega Change % */}
      <td className={`change-percent ${getChangeColor(pet['Mega Change %'])}`}>
        {formatChangeValue(pet['Mega Change %'])}%
      </td>
    </tr>
  );
};

export default TrendRow;
