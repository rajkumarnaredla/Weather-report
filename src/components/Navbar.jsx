import { NavLink } from "react-router-dom";

function Navbar({ unit, setUnit, themeLabel }) {
  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">Open-Meteo + React</p>
        <h1>Weather Intelligence Dashboard</h1>
        <p className="theme-status">{themeLabel}</p>
      </div>

      <nav className="nav-links">
        <NavLink
          to="/current-weather"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Current Weather
        </NavLink>
        <NavLink
          to="/historical-weather"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Historical Weather
        </NavLink>
      </nav>

      <div className="toggle-group" aria-label="Temperature unit toggle">
        <button
          type="button"
          className={unit === "celsius" ? "toggle-button active" : "toggle-button"}
          onClick={() => setUnit("celsius")}
        >
          Celsius
        </button>
        <button
          type="button"
          className={unit === "fahrenheit" ? "toggle-button active" : "toggle-button"}
          onClick={() => setUnit("fahrenheit")}
        >
          Fahrenheit
        </button>
      </div>
    </header>
  );
}

export default Navbar;
