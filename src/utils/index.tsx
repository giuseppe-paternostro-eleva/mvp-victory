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

export const roundToOneSigFig = (n: number) => {
  if (n === 0) return 0;

  const sign = Math.sign(n);
  n = Math.abs(n);

  const exp = Math.floor(Math.log10(n));
  const mag = Math.pow(10, exp);

  const rounded = Math.round(n / mag) * mag;
  return sign * rounded;
}