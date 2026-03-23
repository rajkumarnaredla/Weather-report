import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";

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

  if (loadingLocation) {
    return (
      <div className="app-shell">
        <Loader message="Detecting your location and preparing the dashboard..." fullscreen />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar unit={unit} setUnit={setUnit} />
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
