import { useEffect, useMemo, useState } from "react";
import ChartComponent from "../components/ChartComponent";
import Loader from "../components/Loader";
import WeatherCard from "../components/WeatherCard";
import { getCurrentWeatherBundle } from "../services/weatherApi";

const formatNumber = (value, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return Number(value).toFixed(digits);
};

const formatClock = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const createDateLabel = (dateString) =>
  new Date(dateString).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const normalizeDateInput = (value, availableDates) =>
  availableDates.includes(value) ? value : availableDates[0] ?? "";

function CurrentWeather({ coords, unit }) {
  const [dashboard, setDashboard] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getCurrentWeatherBundle(coords, unit);
        if (!isMounted) return;
        setDashboard(data);
        setSelectedDate(data.availableDates[0] ?? "");
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError.message || "Unable to fetch current weather data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [coords, unit]);

  const selectedDetails = useMemo(() => {
    if (!dashboard || !selectedDate) return null;
    return dashboard.byDate[selectedDate] || null;
  }, [dashboard, selectedDate]);

  const cards = useMemo(() => {
    if (!selectedDetails) return [];

    const pollutantSummary = selectedDetails.airQualitySummary;
    const useFahrenheit = unit === "fahrenheit";

    return [
      {
        title: "Current Temperature",
        value: formatNumber(selectedDetails.currentTemperature, 1),
        unit: useFahrenheit ? "deg F" : "deg C",
        helperText: "Live today, midday estimate for future dates.",
      },
      {
        title: "Minimum Temperature",
        value: formatNumber(selectedDetails.daily.temperatureMin, 1),
        unit: useFahrenheit ? "deg F" : "deg C",
      },
      {
        title: "Maximum Temperature",
        value: formatNumber(selectedDetails.daily.temperatureMax, 1),
        unit: useFahrenheit ? "deg F" : "deg C",
      },
      {
        title: "Precipitation",
        value: formatNumber(selectedDetails.daily.precipitation, 1),
        unit: "mm",
      },
      {
        title: "Relative Humidity",
        value: formatNumber(selectedDetails.humidityAverage, 0),
        unit: "%",
      },
      {
        title: "UV Index",
        value: formatNumber(selectedDetails.daily.uvIndexMax, 1),
      },
      {
        title: "Sunrise Time",
        value: formatClock(selectedDetails.daily.sunrise),
      },
      {
        title: "Sunset Time",
        value: formatClock(selectedDetails.daily.sunset),
      },
      {
        title: "Maximum Wind Speed",
        value: formatNumber(selectedDetails.daily.windSpeedMax, 1),
        unit: "km/h",
      },
      {
        title: "Precipitation Probability Max",
        value: formatNumber(selectedDetails.daily.precipitationProbabilityMax, 0),
        unit: "%",
      },
      {
        title: "Air Quality Index",
        value: formatNumber(pollutantSummary.aqiMax, 0),
        helperText: "US AQI max for the selected day.",
      },
      {
        title: "PM10",
        value: formatNumber(pollutantSummary.pm10Average, 1),
        unit: "ug/m3",
      },
      {
        title: "PM2.5",
        value: formatNumber(pollutantSummary.pm25Average, 1),
        unit: "ug/m3",
      },
      {
        title: "Carbon Monoxide (CO)",
        value: formatNumber(pollutantSummary.coAverage, 0),
        unit: "ug/m3",
      },
      {
        title: "Carbon Dioxide (CO2)",
        value: "N/A",
        helperText: "Not provided by Open-Meteo Air Quality API.",
      },
      {
        title: "Nitrogen Dioxide (NO2)",
        value: formatNumber(pollutantSummary.no2Average, 1),
        unit: "ug/m3",
      },
      {
        title: "Sulphur Dioxide (SO2)",
        value: formatNumber(pollutantSummary.so2Average, 1),
        unit: "ug/m3",
      },
    ];
  }, [selectedDetails, unit]);

  if (loading) {
    return <Loader message="Loading current weather dashboard..." />;
  }

  if (error) {
    return <div className="inline-error">{error}</div>;
  }

  if (!dashboard || !selectedDetails) {
    return <div className="inline-error">No weather data available.</div>;
  }

  const hourlyLabels = selectedDetails.hourly.time.map((item) =>
    new Date(item).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Current Weather Dashboard</p>
          <h2>{dashboard.locationText}</h2>
          <p className="hero-panel__text">
            Explore live weather for today plus forecast weather, daily highlights, and hourly
            trends for the selected day in a responsive website dashboard.
          </p>
          {!dashboard.airQualityAvailable ? (
            <p className="hero-panel__text">
              Air-quality data is not available for this location right now, so pollutant cards and
              PM charts may show unavailable values.
            </p>
          ) : null}
          {dashboard.forecastOnlyDates?.length ? (
            <p className="hero-panel__text">
              Air-quality reporting is only available for the near-term forecast. Later forecast
              days will still appear, but pollutant values may be unavailable.
            </p>
          ) : null}
        </div>

        <div className="hero-panel__controls">
          <label className="field">
            <span>Selected Date</span>
            <input
              type="date"
              value={selectedDate}
              min={dashboard.availableDates[0]}
              max={dashboard.availableDates[dashboard.availableDates.length - 1]}
              onChange={(event) =>
                setSelectedDate(normalizeDateInput(event.target.value, dashboard.availableDates))
              }
            />
            <small className="field-hint">
              Available range: {createDateLabel(dashboard.availableDates[0])} to{" "}
              {createDateLabel(dashboard.availableDates[dashboard.availableDates.length - 1])}
            </small>
          </label>
          <div className="hero-panel__meta">
            <span>Latitude: {dashboard.latitude}</span>
            <span>Longitude: {dashboard.longitude}</span>
          </div>
        </div>
      </section>

      <section className="cards-grid">
        {cards.map((card) => (
          <WeatherCard
            key={card.title}
            title={card.title}
            value={card.value}
            unit={card.unit}
            helperText={card.helperText}
          />
        ))}
      </section>

      <ChartComponent
        title="Hourly Temperature"
        categories={hourlyLabels}
        yAxisTitle={unit === "fahrenheit" ? "Temperature (deg F)" : "Temperature (deg C)"}
        series={[{ name: "Temperature", data: selectedDetails.hourly.temperature }]}
        scrollable
      />
      <ChartComponent
        title="Hourly Relative Humidity"
        categories={hourlyLabels}
        yAxisTitle="Humidity (%)"
        series={[{ name: "Relative Humidity", data: selectedDetails.hourly.humidity }]}
        scrollable
      />
      <ChartComponent
        title="Hourly Precipitation"
        categories={hourlyLabels}
        yAxisTitle="Precipitation (mm)"
        chartType="bar"
        series={[{ name: "Precipitation", data: selectedDetails.hourly.precipitation }]}
        scrollable
      />
      <ChartComponent
        title="Hourly Visibility"
        categories={hourlyLabels}
        yAxisTitle="Visibility (m)"
        series={[{ name: "Visibility", data: selectedDetails.hourly.visibility }]}
        scrollable
      />
      <ChartComponent
        title="Hourly Wind Speed (10m)"
        categories={hourlyLabels}
        yAxisTitle="Wind Speed (km/h)"
        series={[{ name: "Wind Speed", data: selectedDetails.hourly.windSpeed }]}
        scrollable
      />
      <ChartComponent
        title="Hourly PM10 and PM2.5"
        categories={hourlyLabels}
        yAxisTitle="Particles (ug/m3)"
        series={[
          { name: "PM10", data: selectedDetails.hourly.pm10 },
          { name: "PM2.5", data: selectedDetails.hourly.pm25 },
        ]}
        scrollable
      />
    </div>
  );
}

export default CurrentWeather;
