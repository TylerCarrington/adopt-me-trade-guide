const TabContainer = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="tab-container">
      <div className="tab-contents">
        {children}
      </div>
    </div>
  );
};

export default TabContainer;
