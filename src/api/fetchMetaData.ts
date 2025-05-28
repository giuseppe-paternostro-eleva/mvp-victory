import axios from "axios";
import { baseInfo } from "./constants";

export const fetchMetaData = async (
  commodity: string,
) => {
  try {
    const response = await axios.get(baseInfo.urlMetaData, {
      headers: {
        "x-api-key": baseInfo.key,
      },
      params: {
        commodity,
      },
    });

    return response.data;
  } catch (err) {
    console.error("Errore nella chiamata API:", err);
    throw err;
  }
};
