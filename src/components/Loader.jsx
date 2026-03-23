function Loader({ message = "Loading weather data...", fullscreen = false }) {
  return (
    <div className={fullscreen ? "loader loader--fullscreen" : "loader"}>
      <span className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export default Loader;
