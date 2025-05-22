import axios from "axios";
import { baseInfo } from "./constants";

export const fetchForecastData = async (
  commodity: string,
  market: string,
  aggregation: string,
  indicator: string,
  from: string,
  to: string
) => {
  try {
    const response = await axios.get(baseInfo.url, {
      headers: {
        "x-api-key": baseInfo.key,
      },
      params: {
        commodity,
        market,
        from,
        to,
        aggregation,
        "financial-indicator": indicator,
      },
    });

    return response.data;
  } catch (err) {
    console.error("Errore nella chiamata API:", err);
    throw err;
  }
};
