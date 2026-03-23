import axios from "axios";

const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const ARCHIVE_API_URL = "https://archive-api.open-meteo.com/v1/archive";

const forecastDailyFields = [
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "uv_index_max",
  "wind_speed_10m_max",
  "precipitation_sum",
  "precipitation_probability_max",
].join(",");

const forecastHourlyFields = [
  "temperature_2m",
  "relative_humidity_2m",
  "precipitation",
  "visibility",
  "wind_speed_10m",
].join(",");

const airQualityHourlyFields = [
  "pm10",
  "pm2_5",
  "carbon_monoxide",
  "nitrogen_dioxide",
  "sulphur_dioxide",
  "us_aqi",
].join(",");

const historicalDailyFields = [
  "temperature_2m_mean",
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "precipitation_sum",
  "wind_speed_10m_max",
  "wind_direction_10m_dominant",
].join(",");

const historicalAirQualityFields = ["pm10", "pm2_5"].join(",");

const createParams = (coords, unit) => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  timezone: "auto",
  temperature_unit: unit,
  wind_speed_unit: "kmh",
  forecast_days: 16,
});

const average = (values) => {
  const filtered = values.filter((item) => item !== null && item !== undefined);
  if (!filtered.length) return null;
  return filtered.reduce((sum, item) => sum + item, 0) / filtered.length;
};

const maximum = (values) => {
  const filtered = values.filter((item) => item !== null && item !== undefined);
  if (!filtered.length) return null;
  return Math.max(...filtered);
};

const middayValue = (values) => values[Math.min(12, values.length - 1)] ?? null;

const minutesAfterMidnight = (dateTime) => {
  const date = new Date(dateTime);
  return date.getHours() * 60 + date.getMinutes();
};

const dateKey = (dateTime) => dateTime.split("T")[0];

const indexesForDate = (timeSeries, targetDate) =>
  timeSeries.reduce((accumulator, item, index) => {
    if (dateKey(item) === targetDate) {
      accumulator.push(index);
    }
    return accumulator;
  }, []);

const createEmptyAirQualitySnapshot = () => ({
  time: [],
  pm10: [],
  pm2_5: [],
  carbon_monoxide: [],
  nitrogen_dioxide: [],
  sulphur_dioxide: [],
  us_aqi: [],
});

export async function getCurrentWeatherBundle(coords, unit) {
  const forecastRequest = axios.get(FORECAST_API_URL, {
    params: {
      ...createParams(coords, unit),
      current: "temperature_2m",
      daily: forecastDailyFields,
      hourly: forecastHourlyFields,
    },
  });

  const airQualityRequest = axios.get(AIR_QUALITY_API_URL, {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: "auto",
      hourly: airQualityHourlyFields,
    },
  });

  const [forecastResponse, airQualityResponse] = await Promise.allSettled([
    forecastRequest,
    airQualityRequest,
  ]);

  if (forecastResponse.status !== "fulfilled") {
    throw new Error("Unable to fetch forecast weather data.");
  }

  const forecast = forecastResponse.value.data;
  const airQuality =
    airQualityResponse.status === "fulfilled"
      ? airQualityResponse.value.data
      : { hourly: createEmptyAirQualitySnapshot() };
  const todayDate = dateKey(new Date().toISOString());
  const byDate = {};
  const airQualityDates = [...new Set(airQuality.hourly.time.map(dateKey))];

  forecast.daily.time.forEach((date, index) => {
    const hourlyIndexes = indexesForDate(forecast.hourly.time, date);
    const airIndexes = indexesForDate(airQuality.hourly.time, date);
    const temperatureValues = hourlyIndexes.map((item) => forecast.hourly.temperature_2m[item]);
    const humidityValues = hourlyIndexes.map((item) => forecast.hourly.relative_humidity_2m[item]);

    byDate[date] = {
      currentTemperature: date === todayDate ? forecast.current.temperature_2m : middayValue(temperatureValues),
      humidityAverage: average(humidityValues),
      daily: {
        temperatureMin: forecast.daily.temperature_2m_min[index],
        temperatureMax: forecast.daily.temperature_2m_max[index],
        precipitation: forecast.daily.precipitation_sum[index],
        uvIndexMax: forecast.daily.uv_index_max[index],
        sunrise: forecast.daily.sunrise[index],
        sunset: forecast.daily.sunset[index],
        windSpeedMax: forecast.daily.wind_speed_10m_max[index],
        precipitationProbabilityMax: forecast.daily.precipitation_probability_max[index],
      },
      hourly: {
        time: hourlyIndexes.map((item) => forecast.hourly.time[item]),
        temperature: temperatureValues,
        humidity: humidityValues,
        precipitation: hourlyIndexes.map((item) => forecast.hourly.precipitation[item]),
        visibility: hourlyIndexes.map((item) => forecast.hourly.visibility[item]),
        windSpeed: hourlyIndexes.map((item) => forecast.hourly.wind_speed_10m[item]),
        pm10: airIndexes.map((item) => airQuality.hourly.pm10[item]),
        pm25: airIndexes.map((item) => airQuality.hourly.pm2_5[item]),
      },
      airQualitySummary: {
        aqiMax: maximum(airIndexes.map((item) => airQuality.hourly.us_aqi[item])),
        pm10Average: average(airIndexes.map((item) => airQuality.hourly.pm10[item])),
        pm25Average: average(airIndexes.map((item) => airQuality.hourly.pm2_5[item])),
        coAverage: average(airIndexes.map((item) => airQuality.hourly.carbon_monoxide[item])),
        no2Average: average(airIndexes.map((item) => airQuality.hourly.nitrogen_dioxide[item])),
        so2Average: average(airIndexes.map((item) => airQuality.hourly.sulphur_dioxide[item])),
      },
    };
  });

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    locationText: `${coords.label} (${coords.latitude}, ${coords.longitude})`,
    airQualityAvailable: airQualityDates.length > 0,
    availableDates: forecast.daily.time,
    forecastOnlyDates: forecast.daily.time.filter((date) => !airQualityDates.includes(date)),
    byDate,
  };
}

export async function getHistoricalWeatherBundle(coords, unit, startDate, endDate) {
  const archiveRequest = axios.get(ARCHIVE_API_URL, {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: "auto",
      start_date: startDate,
      end_date: endDate,
      temperature_unit: unit,
      wind_speed_unit: "kmh",
      daily: historicalDailyFields,
    },
  });

  const airQualityRequest = axios.get(AIR_QUALITY_API_URL, {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: "auto",
      start_date: startDate,
      end_date: endDate,
      hourly: historicalAirQualityFields,
    },
  });

  const [archiveResponse, airQualityResponse] = await Promise.allSettled([
    archiveRequest,
    airQualityRequest,
  ]);

  if (archiveResponse.status !== "fulfilled") {
    throw new Error("Unable to fetch historical weather data.");
  }

  const archive = archiveResponse.value.data;
  const airQuality =
    airQualityResponse.status === "fulfilled"
      ? airQualityResponse.value.data
      : { hourly: createEmptyAirQualitySnapshot() };

  const pm10DailyAverage = archive.daily.time.map((date) =>
    average(indexesForDate(airQuality.hourly.time, date).map((item) => airQuality.hourly.pm10[item]))
  );

  const pm25DailyAverage = archive.daily.time.map((date) =>
    average(indexesForDate(airQuality.hourly.time, date).map((item) => airQuality.hourly.pm2_5[item]))
  );

  return {
    daily: {
      time: archive.daily.time,
      temperatureMean: archive.daily.temperature_2m_mean,
      temperatureMax: archive.daily.temperature_2m_max,
      temperatureMin: archive.daily.temperature_2m_min,
      sunriseMinutes: archive.daily.sunrise.map(minutesAfterMidnight),
      sunsetMinutes: archive.daily.sunset.map(minutesAfterMidnight),
      precipitation: archive.daily.precipitation_sum,
      windSpeedMax: archive.daily.wind_speed_10m_max,
      windDirectionDominant: archive.daily.wind_direction_10m_dominant,
    },
    airQuality: {
      available: airQualityResponse.status === "fulfilled" && airQuality.hourly.time.length > 0,
      pm10DailyAverage,
      pm25DailyAverage,
    },
  };
}
