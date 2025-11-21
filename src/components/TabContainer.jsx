import TabButtons from './TabButtons';

const TabContainer = ({ activeTab, onTabChange, children }) => {
  const tabs = [
    { id: 'value-analysis', label: 'Value Analysis' },
    { id: 'trend-analysis', label: 'Trend Analyzer' },
    { id: 'inventory', label: 'Pet Inventory (WIP)' },
  ];

  return (
    <div className="tab-container">
      <TabButtons tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <div className="tab-contents">
        {children}
      </div>
    </div>
  );
};

export default TabContainer;
