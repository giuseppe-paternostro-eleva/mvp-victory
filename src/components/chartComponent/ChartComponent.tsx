import { JSX, useEffect, useMemo, useState } from "react";
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
import { parseSeries, roundToOneSigFig } from "../../utils";
import { fetchForecastData } from "../../api/fetchForecastData";
import { Serie } from "../../interface";
import _ from "lodash";
import { fetchMetaData } from "../../api/fetchMetaData";
import Select from "../select/CustomSelect";
import { MarketMetaData } from "../../interface";
import { createContainer } from "victory";
import { ForecastToolbar } from "../forecastToolbar/ForecastToolbar";
import { Loader } from "../loader/Loader";
import { VictoryLegend, VictoryLabel } from "victory";

// Questi dati "frequency dovrebbero provenire dall'API, ma per ora sono hardcoded
const frequencyOptions = [
  { label: "daily", value: "daily" },
  { label: "monthly", value: "monthly" },
  { label: "yearly", value: "yearly" },
];

export const ChartComponent = (): JSX.Element => {
  const [series, setSeries] = useState<Serie[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [zoomDomain, setZoomDomain] = useState<any>(null);
  const [frequency, setFrequency] = useState<string>("monthly");
  const [metaData, setMetaData] = useState<MarketMetaData[] | null>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

  const tickCount = 10;

  const lineRange = useMemo(() => {
    if (series.length === 0) return [0, 1];
    console.log({ series });
    const lineSeries = series.filter((s) => s.type !== "area");
    /*const min = Math.min(...lineSeries.map(s => Math.min(...s.data.map(d => d.y))));*/
    const allYValues = lineSeries.flatMap((s) => s.data.map((d) => d.y));
    const min = Math.min(...allYValues);
    const max = Math.max(...allYValues);
    // const max = Math.max(
    //   ...lineSeries.map((s) => Math.max(...s.data.map((d) => d.y)))
    // );
    const adjustedMax = max * 1.1; // Adjusted to give some padding above the max value
    const adjustedMin = min * 0.9; // Adjusted to give some padding below the min value
    console.log({ adjustedMax });
    return [Math.floor(adjustedMin), roundToOneSigFig(adjustedMax)]; // Adjusted to give some padding above the max value
  }, [series]);

  const areaRange = useMemo(() => {
    if (series.length === 0) return [0, 1];
    const areaSeries = series.filter((s) => s.type === "area");
    /*const min = Math.min(...lineSeries.map(s => Math.min(...s.data.map(d => d.y))));*/
    const max = Math.max(
      ...areaSeries.map((s) => Math.max(...s.data.map((d) => d.y)))
    );
    const adjustedMax = max * 1.1; // Adjusted to give some padding above the max value
    return [0, roundToOneSigFig(adjustedMax)]; // Adjusted to give some padding above the max value
  }, [series]);

  const ticks = 10;
  const tickValues = _.range(ticks + 1);

  const handleZoom = (domain: any) => setSelectedDomain(domain);
  const handleBrush = (domain: any) => setZoomDomain(domain);

  // const tickFormat =
  //   (
  //     range: number[],
  //     formattingOptions: { determinant: number; unit?: string } = {
  //       determinant: 1,
  //     }
  //   ) =>
  //   (t: number) => {
  //     const { determinant, unit } = formattingOptions;
  //     const value = (t * (range[1] - range[0])) / ticks;
  //     console.log({ value });

  //     return `${Math.round(value) / determinant}${unit ? ` ${unit}` : ""}`;
  //   };

  // tickformat considerng also the min value of the range
  const tickFormat =
    (
      range: number[],
      formattingOptions: { determinant: number; unit?: string } = {
        determinant: 1,
      }
    ) =>
    (t: number) => {
      const { determinant, unit } = formattingOptions;
      const value = range[0] + (t * (range[1] - range[0])) / ticks;
      return `${Math.round(value) / determinant}${unit ? ` ${unit}` : ""}`;
    };

  // const normalize = (range: number[]) => (datum: any) =>
  //   datum["y"] / ((range[1] - range[0]) / ticks);
  // normalize function to normalize the y values based on the range and ticks considering also min
  const normalize = (range: number[]) => (datum: any) =>
    (datum["y"] - range[0]) / ((range[1] - range[0]) / ticks);

  const normalizedLineY = useMemo(() => normalize(lineRange), [lineRange]);
  const normalizedAreaY = useMemo(() => normalize(areaRange), [areaRange]);
  const hasAreaSeries = series.some((s) => s.type === "area");

  // metaData ordered by value
  const marketOptions = metaData?.map((mkt) => ({
    value: mkt.value,
    label: mkt.value,
  }));

  const selectedMarketData = metaData?.find(
    (mkt) => mkt.value === selectedMarket
  );

  const indicatorOptions =
    selectedMarketData?.financialIndicator.map((ind) => ({
      value: ind.value,
      label: ind.value,
    })) ?? [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const from = dayjs().subtract(7, "year").format("YYYY-MM-DD");
        const to = dayjs().format("YYYY-MM-DD");

        const metaData = await fetchMetaData("mais");
        const marketAndFinancialIndicators: MarketMetaData[] =
          metaData?.tradeExchange ?? [];
        setMetaData(marketAndFinancialIndicators);
        console.log("🚀 ~ fetchData ~ metaData:", metaData);

        const res = await fetchForecastData(
          "mais",
          selectedMarket,
          frequency,
          selectedIndicator,
          from,
          to
        );

        const marketKey = Object.keys(res)[0];
        const parsed = parseSeries(res[marketKey].data);

        setSeries(parsed);
      } catch (error) {
        console.error("Errore nella chiamata o parsing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [frequency, selectedIndicator, selectedMarket]);

  useEffect(() => {
    if (metaData && metaData.length > 0 && !selectedMarket) {
      const defaultMarket = metaData[0];
      setSelectedMarket(defaultMarket.value);

      const firstIndicator = defaultMarket.financialIndicator[0];
      if (firstIndicator) {
        setSelectedIndicator(firstIndicator.value);
      }
    }
  }, [metaData]);

  return (
    <div className="chart-iframe-wrapper">
      <div className="toolbar">
        <ForecastToolbar
          selects={[
            {
              label: "frequency",
              value: frequency,
              options: frequencyOptions,
              setValue: setFrequency,
            },
            {
              label: "Market",
              value: selectedMarket || "",
              options: marketOptions ?? [],
              setValue: (val) => {
                setSelectedMarket(val);
                setSelectedIndicator(null);
              },
            },
            {
              label: "Financial Indicator",
              value: selectedIndicator || "",
              options: indicatorOptions,
              setValue: setSelectedIndicator,
            },
          ]}
        />
      </div>
      <div className="chart-container">
        {series.length > 0 && !loading ? (
          <>
            <VictoryChart
              height={600}
              width={900}
              scale={{ x: "time" }}
              domain={{ y: [0, tickCount] }}
              containerComponent={
                <VictoryZoomVoronoiContainer
                  zoomDimension="x"
                  zoomDomain={zoomDomain}
                  onZoomDomainChange={handleZoom}
                  voronoiDimension="x"
                  // onActivated={(points) => {
                  //   if (points.length > 0) {
                  //     console.log("👉 Punto selezionato:", points[0]);
                  //     // setSelectedPoint(points[0]); // se vogliamo mostrarlo sotto
                  //   }
                  // }}
                  activateData
                  labels={({ datum }) => `${datum.y}`}
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{
                        fill: "#ffffff",
                        stroke: "#2d7ff9",
                        strokeWidth: 1,
                        filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.2))",
                      }}
                      cornerRadius={6}
                      pointerLength={8}
                      style={{
                        fontSize: 12,
                        fontFamily: "monospace",
                        fill: "#333",
                      }}
                    />
                  }
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
                tickFormat={tickFormat(lineRange)}
                style={{
                  tickLabels: { fontSize: 10 },
                  grid: {
                    stroke: ({ tick }) => (tick === 5 ? "#2d7ff9" : "#CFD8DC"),
                    strokeDasharray: "10, 5",
                  },
                }}
              />

              {/* Y DESTRA */}
              {hasAreaSeries && (
                <VictoryAxis
                  dependentAxis
                  orientation="right"
                  tickCount={tickCount}
                  tickValues={tickValues}
                  tickFormat={tickFormat(areaRange, {
                    unit: "k",
                    determinant: 1000,
                  })}
                  style={{ tickLabels: { fontSize: 10 } }}
                />
              )}

              {series.map((s) => {
                const isArea = s.type === "area";
                // const yDomain: [number, number] = isArea ? [0, 700000] : [0, 800];
                const originalY = (datum: any) => datum._originalY || datum.y;

                return isArea ? (
                  <VictoryArea
                    key={s.name}
                    name={s.name}
                    data={s.data}
                    y={normalizedAreaY}
                    // labels={({ datum }: any) =>
                    //   `${s.name}: ${Math.round(originalY(datum))}`
                    // }
                    // labelComponent={<VictoryTooltip />}
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
                    name={s.name}
                    data={s.data}
                    y={normalizedLineY}
                    // labels={({ datum }: any) => `${s.name}: ${datum.y}`}
                    // labelComponent={<VictoryTooltip />}
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
              height={50}
              scale={{ x: "time" }}
              padding={{ top: 0, left: 25, right: 25, bottom: 20 }}
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
                style={{ tickLabels: { fontSize: 6 } }}
              />
              <VictoryLine
                data={series[0]?.data || []}
                y={normalizedLineY}
                style={{ data: { stroke: "#ccc" } }}
              />
            </VictoryChart>
            {/* legend */}
            <VictoryLegend
              orientation="horizontal"
              gutter={20}
              height={30}
              symbolSpacer={5}
              itemsPerRow={4}
              data={series.map((s) => ({
                name: s.name,
                symbol: { fill: s.color },
              }))}
              style={{
                labels: { fontSize: 8 },
                border: { stroke: "transparent" },
              }}
              // labelComponent={
              // <VictoryLabel
              //   events={{
              //     onClick: (e:any,props) => {
              //       console.log("Legend clicked",e,props);
              //     },
              //   }}
              // />
              // }
            />
          </>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};
