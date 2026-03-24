function CityBroadcastCard({ city }) {
  return (
    <article className="broadcast-card">
      <div className="broadcast-card__header">
        <div>
          <p className="broadcast-card__city">{city.name}</p>
          <p className="broadcast-card__condition">{city.conditionLabel}</p>
        </div>
        <div className={city.isDay ? "broadcast-card__badge" : "broadcast-card__badge night"}>
          {city.isDay ? "Day" : "Night"}
        </div>
      </div>
      <div className="broadcast-card__body">
        <div>
          <span className="broadcast-card__value">{city.temperature}</span>
          <small>{city.temperatureUnit}</small>
        </div>
        <p>Wind {city.windSpeed}</p>
      </div>
    </article>
  );
}

export default CityBroadcastCard;
