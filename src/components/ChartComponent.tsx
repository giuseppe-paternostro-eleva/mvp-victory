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
  const [zoomDomain, setZoomDomain] = useState<any>(null);

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
        console.log("🚀 ~ fetchData ~ res:", res);

        const marketKey = Object.keys(res)[0];
        const rawSeries = res[marketKey].data;

        const parsed = parseSeries(rawSeries);
        setSeries(parsed);
      } catch (error) {
        console.error("Errore nella chiamata o parsing:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("series", series);
  }, [series]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">
        TREND DI PREZZO E PREVISIONE
      </h2>
      {series?.length > 0 ? (
        <>
          <VictoryChart
            height={400}
            padding={{ top: 20, bottom: 50, left: 60, right: 60 }}
            scale={{ x: "time" }}
            containerComponent={
              <VictoryZoomContainer
                zoomDimension="x"
                zoomDomain={zoomDomain}
                onZoomDomainChange={setZoomDomain}
              />
            }
          >
            {/* ASSE X */}
            <VictoryAxis
              tickFormat={(t) => dayjs(t).format("MM-YYYY")}
              style={{ tickLabels: { fontSize: 8 } }}
            />

            {/* ASSE Y LEFT */}
            <VictoryAxis
              dependentAxis
              style={{ tickLabels: { fontSize: 8 } }}
              offsetX={50}
            />

            {/* ASSE Y RIGHT per indicatore finanziario */}
            <VictoryAxis
              dependentAxis
              orientation="right"
              style={{ tickLabels: { fontSize: 8 } }}
              offsetX={340}
            />

            {series.map((serie) => {
              const commonProps = {
                key: serie.name,
                data: serie.data,
                labels: ({ datum }: any) => `${serie.name}: ${datum.y}`,
                labelComponent: <VictoryTooltip />,
                style: {
                  data: {
                    stroke: serie.color,
                    fill: serie.type === "area" ? `${serie.color}33` : "none",
                    strokeWidth: 2,
                  },
                },
              };

              return serie.type === "area" ? (
                <VictoryArea {...commonProps} />
              ) : (
                <VictoryLine {...commonProps} />
              );
            })}

            {/* Legenda */}
            {series.length > 0 && (
              <VictoryLegend
                x={80}
                y={10}
                orientation="horizontal"
                gutter={20}
                style={{ labels: { fontSize: 10 } }}
                data={series.map((s) => ({
                  name: s.name,
                  symbol: { fill: s.color },
                }))}
              />
            )}
          </VictoryChart>

          {/* SLIDER DI BRUSH SOTTO */}
          <VictoryChart
            height={100}
            scale={{ x: "time" }}
            padding={{ top: 0, left: 60, right: 60, bottom: 30 }}
            containerComponent={
              <VictoryBrushContainer
                brushDimension="x"
                brushDomain={zoomDomain}
                onBrushDomainChange={setZoomDomain}
              />
            }
          >
            <VictoryAxis
              tickFormat={(t) => dayjs(t).format("YY")}
              style={{ tickLabels: { fontSize: 7 } }}
            />
            <VictoryLine
              data={series[0]?.data || []}
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
