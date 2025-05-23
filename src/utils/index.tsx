import { Serie } from "../interface";

export const parseSeries = (rawData: any[]): Serie[] => {
  return rawData.map((serie) => ({
    name: serie.legend,
    data: serie.data.map((point: any) => ({
      x: new Date(point.x),
      y: Number(point.y)
    })),
    type: serie.type,
    color: serie.stroke.color,
    _normalizationFactor: 1
  }));
};