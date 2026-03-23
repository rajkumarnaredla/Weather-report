import { Suspense, lazy } from "react";

const Chart = lazy(() => import("react-apexcharts"));

function ChartComponent({
  title,
  series,
  categories,
  yAxisTitle,
  chartType = "line",
  height = 340,
  wide = false,
}) {
  const options = {
    chart: {
      id: title,
      type: chartType,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
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
      },
    },
    tooltip: {
      theme: "dark",
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
        <p>Zoom, pan, and scroll horizontally to inspect the timeline.</p>
      </div>
      <div className="chart-scroll">
        <div className={wide ? "chart-inner chart-inner--wide" : "chart-inner"}>
          <Suspense fallback={<div className="chart-fallback">Loading chart...</div>}>
            <Chart options={options} series={series} type={chartType} height={height} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

export default ChartComponent;
