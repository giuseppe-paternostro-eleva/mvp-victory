import { JSX, useEffect, useState } from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryBrushContainer,
} from "victory";
import dayjs from "dayjs";
import { parseSeries } from "../utils";
import { fetchForecastData } from "../api/fetchForecastData";
import { Serie } from "../interface";

export const ChartComponent = (): JSX.Element => {
  const [series, setSeries] = useState<Serie[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [zoomDomain, setZoomDomain] = useState<any>(null);

  const tickCount = 10;

  const handleZoom = (domain: any) => setSelectedDomain(domain);
  const handleBrush = (domain: any) => setZoomDomain(domain);

  const normalizeY = (y: number, range: [number, number]) =>
    y / ((range[1] - range[0]) / tickCount);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const from = dayjs().subtract(7, "year").format("YYYY-MM-DD");
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
        const parsed = parseSeries(res[marketKey].data);

        const maxLineY = Math.max(
          ...parsed
            .filter((s) => s.type === "line")
            .flatMap((s) => s.data.map((d) => d.y))
        );

        const normalized = parsed.map((serie) => {
          if (serie.type === "area") {
            const maxAreaY = Math.max(...serie.data.map((d) => d.y));

            if (maxAreaY > maxLineY * 3) {
              const factor = maxAreaY / maxLineY;
              return {
                ...serie,
                data: serie.data.map((d) => ({ ...d, _originalY: d.y, y: d.y / factor })),
                _normalizationFactor: factor,
              };
            }
          }
          return serie;
        });

        setSeries(normalized);
      } catch (error) {
        console.error("Errore nella chiamata o parsing:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {series.length > 0 ? (
        <>
          <VictoryChart
            height={600}
            width={900}
            scale={{ x: "time" }}
            domain={{ y: [0, tickCount] }}
            containerComponent={
              <VictoryZoomContainer
                zoomDimension="x"
                zoomDomain={zoomDomain}
                onZoomDomainChange={handleZoom}
              />
            }
          >
            <VictoryAxis
              tickFormat={(t) => dayjs(t).format("MM-YYYY")}
              style={{ tickLabels: { fontSize: 10 } }}
            />

            {/* Y SINISTRA */}
            <VictoryAxis
              dependentAxis
              tickCount={tickCount}
              style={{
                tickLabels: { fontSize: 10 },
                grid: {
                  stroke: ({ tick }) => (tick === 5 ? "#2d7ff9" : "#CFD8DC"),
                  strokeDasharray: "10, 5",
                },
              }}
              tickFormat={(t) => Math.round(t * (800 / tickCount))}
            />

            {/* Y DESTRA */}
            <VictoryAxis
              dependentAxis
              orientation="right"
              tickCount={tickCount}
              tickFormat={(t) => {
                const areaSerie = series.find(
                  (s) => s.type === "area" && s._normalizationFactor
                );
                if (!areaSerie) return t;
                const factor = areaSerie._normalizationFactor;
                return `${Math.round((t * factor) / 1000)}K`;
              }}
              style={{ tickLabels: { fontSize: 10 } }}
            />

            {series.map((serie) => {
              const isArea = serie.type === "area";
              const yDomain: [number, number] = isArea ? [0, 700000] : [0, 800];
              const originalY = (datum: any) => datum._originalY || datum.y;

              return isArea ? (
                <VictoryArea
                  key={serie.name}
                  data={serie.data}
                  y={(d: any) => normalizeY(originalY(d), yDomain)}
                  labels={({ datum }: any) => `${serie.name}: ${Math.round(originalY(datum))}`}
                  labelComponent={<VictoryTooltip />}
                  style={{
                    data: {
                      stroke: serie.color,
                      fill: `${serie.color}33`,
                      strokeWidth: 2,
                    },
                  }}
                />
              ) : (
                <VictoryLine
                  key={serie.name}
                  data={serie.data}
                  y={(d: any) => normalizeY(d.y, yDomain)}
                  labels={({ datum }: any) => `${serie.name}: ${datum.y}`}
                  labelComponent={<VictoryTooltip />}
                  style={{
                    data: {
                      stroke: serie.color,
                      strokeWidth: 2,
                    },
                  }}
                />
              );
            })}
          </VictoryChart>

          {/* BRUSH */}
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
              y={(d: any) => normalizeY(d.y, [0, 800])}
              style={{ data: { stroke: "#ccc" } }}
            />
          </VictoryChart>
        </>
      ) : (
        <p>loading</p>
      )}
    </div>
  );
};
