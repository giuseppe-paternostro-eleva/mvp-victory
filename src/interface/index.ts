export type DataPoint = { x: Date | string; y: number };
export type SerieType = "line" | "area";

export type Serie = {
  name: string;
  data: DataPoint[];
  type: SerieType;
  color: string;
};