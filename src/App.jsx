import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import { getLiveThemeSnapshot } from "./services/weatherApi";

const CurrentWeather = lazy(() => import("./pages/CurrentWeather"));
const HistoricalWeather = lazy(() => import("./pages/HistoricalWeather"));

const DEFAULT_COORDS = {
  latitude: 40.7128,
  longitude: -74.006,
  label: "Fallback location: New York City",
};

function App() {
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [unit, setUnit] = useState("celsius");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [themeMood, setThemeMood] = useState("day");
  const [themeLabel, setThemeLabel] = useState("Sunny sky mode");

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords(DEFAULT_COORDS);
      setLocationError("Geolocation is not supported in this browser. Showing fallback weather.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
          label: "Current device location",
        });
        setLoadingLocation(false);
      },
      () => {
        setCoords(DEFAULT_COORDS);
        setLocationError("Location access was denied. Showing fallback weather for New York City.");
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;

    let isMounted = true;

    const loadTheme = async () => {
      try {
        const snapshot = await getLiveThemeSnapshot(coords);
        if (!isMounted) return;
        setThemeMood(snapshot.mood);
        setThemeLabel(snapshot.label);
      } catch {
        if (!isMounted) return;
        setThemeMood("day");
        setThemeLabel("Sunny sky mode");
      }
    };

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, [coords]);

  if (loadingLocation) {
    return (
      <div className="app-shell theme-day">
        <Loader message="Detecting your location and preparing the dashboard..." fullscreen />
      </div>
    );
  }

  return (
    <div className={`app-shell theme-${themeMood}`}>
      <div className="sky-backdrop" aria-hidden="true">
        <span className="sky-orb" />
        <span className="cloud cloud--one" />
        <span className="cloud cloud--two" />
        <span className="cloud cloud--three" />
        <span className="rain rain--left" />
        <span className="rain rain--right" />
        <span className="star star--one" />
        <span className="star star--two" />
        <span className="star star--three" />
      </div>
      <Navbar unit={unit} setUnit={setUnit} themeLabel={themeLabel} />
      <main className="page-shell">
        {locationError ? <div className="inline-error">{locationError}</div> : null}
        <Suspense fallback={<Loader message="Loading dashboard view..." />}>
          <Routes>
            <Route path="/" element={<Navigate to="/current-weather" replace />} />
            <Route
              path="/current-weather"
              element={<CurrentWeather coords={coords} unit={unit} />}
            />
            <Route
              path="/historical-weather"
              element={<HistoricalWeather coords={coords} unit={unit} />}
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
