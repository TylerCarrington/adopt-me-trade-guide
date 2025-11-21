import InventoryControls from './InventoryControls';
import { generateTradeRecommendations } from '../utils/trade_logic.js';
import { usePetDataContext } from '../hooks/usePetDataContext';

const TradeRecommendationsModal = ({ pet, onClose }) => {
  const { state } = usePetDataContext();

  if (!pet) return null;

  // Generate recommendations HTML (using existing trade_logic.mjs)
  const recContent = generateTradeRecommendations(pet, state.petData);

  return (
    <div id="trade-recommendations" className="modal" onClick={onClose}>
      <div id="trade-recommendations-content" className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h3>Trade Recommendations</h3>
        <InventoryControls petName={pet.name} />
        <div id="recommendation-details" className="recommendation-details">
          <div dangerouslySetInnerHTML={{ __html: recContent }} />
        </div>
      </div>
    </div>
  );
};

export default TradeRecommendationsModal;
