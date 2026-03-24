# Open Meteo Weather Dashboard

A complete ReactJS weather dashboard website built with Vite. The app uses the browser geolocation API to detect the user's location on load, then fetches current, forecast, air-quality, and historical weather insights from Open-Meteo APIs.

## Features

- Responsive dashboard website with React Router navigation
- Current Weather Dashboard with metric cards and hourly ApexCharts
- Historical Weather Dashboard with date-range filtering up to 2 years
- Browser geolocation integration with graceful fallback handling
- Temperature unit toggle for Celsius and Fahrenheit
- Loading spinner and API error handling
- Deployment-ready Vite build using `npm run build`

## Tech Stack

- ReactJS
- Vite
- React Router
- Axios
- ApexCharts / react-apexcharts
- Open-Meteo APIs

## Project Structure

src/
  components/
    Navbar.jsx
    WeatherCard.jsx
    ChartComponent.jsx
    Loader.jsx
  pages/
    CurrentWeather.jsx
    HistoricalWeather.jsx
  services/
    weatherApi.js
  App.jsx
  main.jsx
  App.css

## API Used

- Forecast API: `https://api.open-meteo.com/v1/forecast`
- Air Quality API: `https://air-quality-api.open-meteo.com/v1/air-quality`
- Archive API: `https://archive-api.open-meteo.com/v1/archive`

Note: The dashboard only shows pollutant fields that are available from the Open-Meteo APIs used in this project.

## Installation

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

  Vercel
deployment done using vercel.




## Links

- Live demo: `https://weather-report-murex-seven.vercel.app/current-weather
- GitHub repository: `https://github.com/your-username/open-meteo-weather-dashboard`
