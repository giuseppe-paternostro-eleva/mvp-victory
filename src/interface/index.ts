export type DataPoint = { x: Date; y: number };
export type SerieType = "line" | "area";

export type Serie = {
  name: string;
  data: DataPoint[];
  type: SerieType;
  color: string;
};