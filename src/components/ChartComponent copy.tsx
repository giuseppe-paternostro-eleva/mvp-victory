// -- REACT
import { JSX, useEffect, useState } from "react";
// -- VICTORY
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryLegend,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryBrushContainer,
} from "victory";
// -- UTILS
import dayjs from "dayjs";
import { parseSeries } from "../utils";
// -- API
import { fetchForecastData } from "../api/fetchForecastData";
// -- TYPES
import { Serie } from "../interface";

export const ChartComponent = (): JSX.Element => {
  // state
  const [series, setSeries] = useState<Serie[]>([]);
  // need to set zoom domain for the chart
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [zoomDomain, setZoomDomain] = useState<any>(null);

  // handlers
  const handleZoom = (domain: any) => {
    setSelectedDomain(domain);
  };

  const handleBrush = (domain: any) => {
    setZoomDomain(domain);
  };

  const normalizeSeries = (serie: Serie, factor: number): Serie => ({
    ...serie,
    data: serie.data.map((d) => ({
      ...d,
      y: d.y / factor,
    })),
  });

  // useEffect to get chart data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // date
        const from = dayjs().subtract(4, "year").format("YYYY-MM-DD");
        const to = dayjs().format("YYYY-MM-DD");

        const res = await fetchForecastData(
          "mais",
          "CBOT €/t",
          "monthly",
          "Open Interest",
          from,
          to
        );

        const marketKey = Object.keys(res)[0];
        const rawSeries = res[marketKey].data;
        console.log("🚀 ~ fetchData ~ rawSeries:", rawSeries);

        const parsed = parseSeries(rawSeries);
        const highValueSeries = parsed.find((s) => s.name === "Open Interest");

        const factor = highValueSeries
          ? Math.max(...highValueSeries.data.map((d) => d.y)) / 100
          : 1;

        // Normalizza solo quella
        const normalized = parsed.map((s) =>
          s.name === "Open Interest" ? normalizeSeries(s, factor) : s
        );

        setSeries(normalized);

      } catch (error) {
        console.error("Errore nella chiamata o parsing:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* <h2 className="text-xl font-bold text-center mb-4">
        TREND DI PREZZO E PREVISIONE
      </h2> */}
      {series?.length > 0 ? (
        <>
          <VictoryChart
            height={600}
            width={600}
            scale={{ x: "time" }}
            containerComponent={
              <VictoryZoomContainer
                zoomDimension="x"
                zoomDomain={zoomDomain}
                onZoomDomainChange={handleZoom}
                allowPan
                allowZoom
              />
            }
          >
            {/* ASSE X */}
            <VictoryAxis
              tickFormat={(t) => dayjs(t).format("MM-YYYY")}
              style={{ tickLabels: { fontSize: 10 } }}
            />
            <VictoryAxis
              dependentAxis
              orientation="right"
              offsetX={600} // 👈 dipende dal width del tuo chart
              style={{ tickLabels: { fontSize: 10 } }}
            />
            ≤{/* ASSE Y  */}
            <VictoryAxis
              dependentAxis
              // style={{ tickLabels: { fontSize: 10 } }}
              style={{
                tickLabels: { fontSize: 10 },
                grid: {
                  stroke: ({ tick }) => (tick === 5 ? "#2d7ff9" : "#CFD8DC"),
                  strokeDasharray: "10, 5",
                },
              }}
            />
            {series.map((serie) => {
              const commonProps = {
                data: serie.data,
                labels: ({ datum }: any) => `${serie.name}: ${datum.y}`,
                labelComponent: <VictoryTooltip />,
                style: {
                  data: {
                    stroke: serie.color,
                    fill: serie.type === "area" ? `${serie.color}33` : "none",
                    strokeWidth: 3,
                  },
                },
              };

              return serie.type === "area" ? (
                <VictoryArea key={serie.name} {...commonProps} />
              ) : (
                <VictoryLine key={serie.name} {...commonProps} />
              );
            })}
            {/* Legenda */}
            {/* <VictoryLegend
                title="main-legend"
                x={80}
                y={10}
                orientation="horizontal"
                gutter={20}
                style={{
                  labels: { fontSize: 10 },
                  title: { fontSize: 12, fontWeight: "bold" },
                }}
                data={series?.map((s) => ({
                  name: s?.name || '',
                  symbol: { fill: s?.color || '' },
                }))}
              /> */}
            {/* <VictoryLegend
              title="main-legend"
              data={series
                .filter((s) => s.name && s.color) // 🔒 importante!
                .map((s) => ({
                  name: s.name,
                  symbol: { fill: s.color },
                }))}
            /> */}
          </VictoryChart>

          {/* SLIDER DI BRUSH SOTTO */}
          <VictoryChart
            height={100}
            scale={{ x: "time" }}
            padding={{ top: 0, left: 60, right: 60, bottom: 30 }}
            containerComponent={
              <VictoryBrushContainer
                brushDimension="x"
                brushDomain={selectedDomain}
                onBrushDomainChange={handleBrush}
              />
            }
          >
            <VictoryAxis
              tickFormat={(t) => dayjs(t).format("YY")}
              style={{ tickLabels: { fontSize: 8 } }}
            />
            <VictoryLine
              data={series[0]?.data || []}
              style={{ data: { stroke: "#ccc" } }}
            />
          </VictoryChart>
          <VictoryLegend x={125} y={20} />
        </>
      ) : (
        <p>loading</p>
      )}
    </div>
  );
};
