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

```text
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
```

## API Used

- Forecast API: `https://api.open-meteo.com/v1/forecast`
- Air Quality API: `https://air-quality-api.open-meteo.com/v1/air-quality`
- Archive API: `https://archive-api.open-meteo.com/v1/archive`

Note: Open-Meteo currently exposes the requested pollutant metrics except `CO2`, so the dashboard shows that card as unavailable instead of inventing a value.

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

### Netlify

1. Push the project to GitHub.
2. Create a new project from the repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy.

### Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

## Links

- Live demo: `https://your-live-demo-link-here`
- GitHub repository: `https://github.com/your-username/open-meteo-weather-dashboard`
