const API_KEY = process.env.REACT_APP_API_KEY || "";

export const baseInfo: {
  urlForecastGraph: string;
  urlMetaData: string;
  urlForecastTable: string;
  key: string;
} = {
  urlForecastGraph: "/dev/forecast",
  urlMetaData: "/dev/metadati",
  urlForecastTable:"/dev/tabellaForecast",
  key: API_KEY,
};
