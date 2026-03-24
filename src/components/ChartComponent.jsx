import Chart from "react-apexcharts";

function ChartComponent({
  title,
  series,
  categories,
  yAxisTitle,
  chartType = "line",
  height = 340,
  yAxisFormatter,
  scrollable = false,
}) {
  const normalizedSeries = series.map((entry) => ({
    ...entry,
    data: Array.isArray(entry.data) ? entry.data : [],
  }));
  const chartMinWidth = scrollable
    ? `${Math.max(720, categories.length * (chartType === "bar" ? 44 : 34))}px`
    : "100%";

  const options = {
    chart: {
      id: title,
      type: chartType,
      animations: {
        enabled: false,
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      toolbar: {
        show: true,
        autoSelected: "zoom",
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: false,
      },
      foreColor: "#dbe7ff",
      background: "transparent",
    },
    colors: ["#7dd3fc", "#f9a826", "#fb7185", "#4ade80"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: chartType === "bar" ? 0 : 3,
    },
    fill: {
      type: chartType === "bar" ? "solid" : "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: "rgba(219, 231, 255, 0.08)",
    },
    legend: {
      labels: {
        colors: "#dbe7ff",
      },
    },
    xaxis: {
      categories,
      tickPlacement: "on",
      labels: {
        rotate: -35,
        style: {
          colors: "#9db0d3",
        },
      },
    },
    yaxis: {
      title: {
        text: yAxisTitle,
        style: {
          color: "#dbe7ff",
        },
      },
      labels: {
        style: {
          colors: "#9db0d3",
        },
        formatter: yAxisFormatter,
      },
    },
    tooltip: {
      theme: "dark",
    },
    noData: {
      text: "No data available for this chart",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#9db0d3",
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "55%",
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
  };

  return (
    <section className="chart-card">
      <div className="chart-card__header">
        <h3>{title}</h3>
        <p>
          {scrollable
            ? "Scroll horizontally or use the toolbar to inspect the timeline."
            : "Use the toolbar to zoom in and reset the timeline."}
        </p>
      </div>
      <div className={scrollable ? "chart-scroll" : "chart-frame"}>
        <div className="chart-frame" style={scrollable ? { minWidth: chartMinWidth } : undefined}>
          <Chart
            options={options}
            series={normalizedSeries}
            type={chartType}
            height={height}
            width="100%"
          />
        </div>
      </div>
    </section>
  );
}

export default ChartComponent;
