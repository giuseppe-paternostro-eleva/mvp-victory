const API_KEY = process.env.REACT_APP_API_KEY || "";

export const baseInfo: {
  urlForecastGraph: string;
  urlMetaData: string;
  key: string;
} = {
  urlForecastGraph: "/dev/forecast",
  urlMetaData: "/dev/metadati",
  key: API_KEY,
};
