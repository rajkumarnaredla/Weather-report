function WeatherCard({ title, value, unit, helperText }) {
  return (
    <article className="weather-card">
      <p className="weather-card__title">{title}</p>
      <div className="weather-card__value">
        <span>{value}</span>
        {unit ? <small>{unit}</small> : null}
      </div>
      {helperText ? <p className="weather-card__helper">{helperText}</p> : null}
    </article>
  );
}

export default WeatherCard;
