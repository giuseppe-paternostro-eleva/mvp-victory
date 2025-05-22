const API_URL =
  "/dev/forecast";

const API_KEY =  process.env.REACT_APP_API_KEY || '';

export const baseInfo: { url: string; key: string } = {
  url: API_URL,
  key: API_KEY,
};
