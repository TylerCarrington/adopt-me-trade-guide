import { useInventory } from '../hooks/useInventory';

const InventoryControls = ({ petName }) => {
  const { getInventory, incrementInventory } = useInventory();
  const inventory = getInventory(petName);

  const handleIncrement = (type, delta) => {
    incrementInventory(petName, type, delta);
  };

  return (
    <div id="inventory-controls" className="inventory-controls">
      <span className="inventory-label">Inventory:</span>

      <span className="inventory-item">
        <span className="inventory-type-label">Regular</span>
        <button
          className="inv-minus"
          onClick={() => handleIncrement('regular', -1)}
          type="button"
        >
          −
        </button>
        <span className="inv-count">{inventory.regular}</span>
        <button
          className="inv-plus"
          onClick={() => handleIncrement('regular', 1)}
          type="button"
        >
          +
        </button>
      </span>

      <span className="inventory-item">
        <span className="inventory-type-label">Neon</span>
        <button className="inv-minus" onClick={() => handleIncrement('neon', -1)} type="button">
          −
        </button>
        <span className="inv-count">{inventory.neon}</span>
        <button className="inv-plus" onClick={() => handleIncrement('neon', 1)} type="button">
          +
        </button>
      </span>

      <span className="inventory-item">
        <span className="inventory-type-label">Mega</span>
        <button className="inv-minus" onClick={() => handleIncrement('mega', -1)} type="button">
          −
        </button>
        <span className="inv-count">{inventory.mega}</span>
        <button className="inv-plus" onClick={() => handleIncrement('mega', 1)} type="button">
          +
        </button>
      </span>
    </div>
  );
};

export default InventoryControls;
