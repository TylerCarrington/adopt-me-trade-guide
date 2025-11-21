const InventoryTab = ({ tabId, isActive }) => {
  return (
    <div id={tabId} className={`tab-content ${isActive ? 'active' : ''}`}>
      <div className="input-section">
        <h2>Your Pet Inventory</h2>
        <p>
          This feature will allow you to manage and track the specific pets you own, using the
          current pet values for a real-time inventory worth calculation.
        </p>
        <button disabled>Add Pet to Inventory (Coming Soon)</button>
        <div id="inventory-list" style={{ marginTop: '15px' }}>
          <p>Inventory list coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
