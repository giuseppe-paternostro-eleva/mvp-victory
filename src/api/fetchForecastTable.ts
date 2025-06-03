import axios from "axios";
import { baseInfo } from "./constants";

export const fetchForecastTable = async (
  commodity: string,
  tableType: string
) => {
  try {
    const response = await axios.get(baseInfo.urlForecastTable, {
      headers: {
        "x-api-key": baseInfo.key,
      },
      params: {
        commodity,
        tableType,
      },
    });

    return response.data;
  } catch (err) {
    console.error("Errore nella chiamata API:", err);
    throw err;
  }
};
