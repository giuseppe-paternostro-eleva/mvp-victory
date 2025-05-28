export type DataPoint = { x: Date | string; y: number };
export type SerieType = "line" | "area";

export type Serie = {
  name: string;
  data: DataPoint[];
  type: SerieType;
  color: string;
  _normalizationFactor:number
};

export type FinancialIndicator = {
  id: number;
  value: string;
};

export type MarketMetaData = {
  id: number;
  value: string; // es. "CBOT"
  financialIndicator: FinancialIndicator[];
};