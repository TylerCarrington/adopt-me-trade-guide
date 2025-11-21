const Header = ({ onRefresh }) => {
  return (
    <div className="header-container">
      <h1>Adopt Me Pet Value Tracker</h1>
      <button className="refresh-button" onClick={onRefresh} title="Refresh Data">
        🔄 Refresh Data
      </button>
    </div>
  );
};

export default Header;
