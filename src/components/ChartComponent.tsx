import { JSX, useEffect, useMemo, useState } from 'react';
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
import { parseSeries, roundToOneSigFig } from '../utils';
import { fetchForecastData } from "../api/fetchForecastData";
import { Serie } from "../interface";
import _ from 'lodash'

export const ChartComponent = (): JSX.Element => {
  const [series, setSeries] = useState<Serie[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [zoomDomain, setZoomDomain] = useState<any>(null);

  const tickCount = 10;

  const lineRange = useMemo(() => {
    if (series.length === 0) return [0, 1];
    console.log({ series })
    const lineSeries = series.filter(s => s.type !== "area");
    /*const min = Math.min(...lineSeries.map(s => Math.min(...s.data.map(d => d.y))));*/
    const max = Math.max(...lineSeries.map(s => Math.max(...s.data.map(d => d.y))));
    const adjustedMax = max * 1.1; // Adjusted to give some padding above the max value
    console.log({ adjustedMax })
    return [0, roundToOneSigFig(adjustedMax)]; // Adjusted to give some padding above the max value
  }, [series])
  console.log(lineRange);

   const areaRange = useMemo(() => {
    if (series.length === 0) return [0, 1];
    const areaSeries = series.filter(s => s.type === "area");
    /*const min = Math.min(...lineSeries.map(s => Math.min(...s.data.map(d => d.y))));*/
    const max = Math.max(...areaSeries.map(s => Math.max(...s.data.map(d => d.y))));
    const adjustedMax = max * 1.1; // Adjusted to give some padding above the max value
    return [0, roundToOneSigFig(adjustedMax)]; // Adjusted to give some padding above the max value
  }, [series])

  const ticks = 10;
  const tickValues = _.range(ticks + 1);

  const handleZoom = (domain: any) => setSelectedDomain(domain);
  const handleBrush = (domain: any) => setZoomDomain(domain);

  const tickFormat = (range: number[], formattingOptions: { determinant: number, unit?: string} = { determinant: 1 }) => (t: number) => {
    const { determinant, unit } = formattingOptions;
    const value = (t * (range[1] - range[0])) / ticks
    console.log({ value })

    return `${Math.round(value)/determinant}${unit ? ` ${unit}` : ''}`;
  }

  const normalize =
    (range: number[]) => (datum: any) =>
      datum["y"] /
      ((range[1] - range[0]) / ticks);

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


        setSeries(parsed);
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
              tickValues={tickValues}
              tickFormat={tickFormat(
                lineRange
              )}
              style={{
                tickLabels: { fontSize: 10 },
                grid: {
                  stroke: ({ tick }) => (tick === 5 ? "#2d7ff9" : "#CFD8DC"),
                  strokeDasharray: "10, 5",
                },
              }}
            />

            {/* Y DESTRA */}
            <VictoryAxis
              dependentAxis
              orientation="right"
              tickCount={tickCount}
              tickValues={tickValues}
              tickFormat={tickFormat(
                areaRange, { unit: 'k', determinant: 1000 }
              )}
              style={{ tickLabels: { fontSize: 10 } }}
            />

            {series.map((s) => {
              const isArea = s.type === "area";
              const yDomain: [number, number] = isArea ? [0, 700000] : [0, 800];
              const originalY = (datum: any) => datum._originalY || datum.y;

              return isArea ? (
                <VictoryArea
                  key={s.name}
                  data={s.data}
                  y={normalize(areaRange)}
                  labels={({ datum }: any) => `${s.name}: ${Math.round(originalY(datum))}`}
                  labelComponent={<VictoryTooltip />}
                  style={{
                    data: {
                      stroke: s.color,
                      fill: `${s.color}33`,
                      strokeWidth: 2,
                    },
                  }}
                />
              ) : (
                <VictoryLine
                  key={s.name}
                  data={s.data}
                  y={normalize(lineRange)}
                  labels={({ datum }: any) => `${s.name}: ${datum.y}`}
                  labelComponent={<VictoryTooltip />}
                  style={{
                    data: {
                      stroke: s.color,
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
              y={"y"}
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
