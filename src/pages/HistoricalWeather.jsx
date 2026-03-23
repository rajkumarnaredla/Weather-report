import { useEffect, useMemo, useState } from "react";
import ChartComponent from "../components/ChartComponent";
import Loader from "../components/Loader";
import { getHistoricalWeatherBundle } from "../services/weatherApi";

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateInputValue = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatLocalDate(date);
};

const formatRange = (startDate, endDate) =>
  `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;

function HistoricalWeather({ coords, unit }) {
  const [startDate, setStartDate] = useState(getDateInputValue(-31));
  const [endDate, setEndDate] = useState(getDateInputValue(-1));
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayDifference = Math.floor((end - start) / 86400000);

    if (start > end) {
      setError("Start date must be earlier than end date.");
      setHistory(null);
      setLoading(false);
      return;
    }

    if (dayDifference > 730) {
      setError("Please choose a date range of two years or less.");
      setHistory(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getHistoricalWeatherBundle(coords, unit, startDate, endDate);
        if (!isMounted) return;
        setHistory(data);
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError.message || "Unable to fetch historical weather data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [coords, unit, startDate, endDate]);

  const dateCategories = useMemo(() => {
    if (!history) return [];
    return history.daily.time.map((date) =>
      new Date(date).toLocaleDateString([], { month: "short", day: "numeric" })
    );
  }, [history]);

  if (loading) {
    return <Loader message="Loading historical weather dashboard..." />;
  }

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Historical Weather Dashboard</p>
          <h2>Archive range: {formatRange(startDate, endDate)}</h2>
          <p className="hero-panel__text">
            Compare archive weather and air-quality patterns using a responsive website dashboard
            with a maximum date range of two years.
          </p>
        </div>

        <div className="hero-panel__controls hero-panel__controls--double">
          <label className="field">
            <span>Start Date</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className="field">
            <span>End Date</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={getDateInputValue(-1)}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      </section>

      {error ? <div className="inline-error">{error}</div> : null}

      {!error && !history ? <div className="inline-error">No archive data available.</div> : null}

      {!error && history ? (
        <>
          <ChartComponent
            title="Temperature Mean, Max, and Min"
            categories={dateCategories}
            yAxisTitle={unit === "fahrenheit" ? "Temperature (deg F)" : "Temperature (deg C)"}
            series={[
              { name: "Mean", data: history.daily.temperatureMean },
              { name: "Max", data: history.daily.temperatureMax },
              { name: "Min", data: history.daily.temperatureMin },
            ]}
            wide
          />
          <ChartComponent
            title="Sunrise and Sunset"
            categories={dateCategories}
            yAxisTitle="Minutes after midnight"
            series={[
              { name: "Sunrise", data: history.daily.sunriseMinutes },
              { name: "Sunset", data: history.daily.sunsetMinutes },
            ]}
            wide
          />
          <ChartComponent
            title="Historical Precipitation"
            categories={dateCategories}
            yAxisTitle="Precipitation (mm)"
            chartType="bar"
            series={[{ name: "Precipitation", data: history.daily.precipitation }]}
            wide
          />
          <ChartComponent
            title="Maximum Wind Speed"
            categories={dateCategories}
            yAxisTitle="Wind Speed (km/h)"
            series={[{ name: "Wind Speed Max", data: history.daily.windSpeedMax }]}
            wide
          />
          <ChartComponent
            title="Dominant Wind Direction"
            categories={dateCategories}
            yAxisTitle="Direction (degrees)"
            series={[{ name: "Wind Direction", data: history.daily.windDirectionDominant }]}
            wide
          />
          <ChartComponent
            title="PM10 and PM2.5"
            categories={dateCategories}
            yAxisTitle="Particles (ug/m3)"
            series={[
              { name: "PM10", data: history.airQuality.pm10DailyAverage },
              { name: "PM2.5", data: history.airQuality.pm25DailyAverage },
            ]}
            wide
          />
        </>
      ) : null}
    </div>
  );
}

export default HistoricalWeather;
