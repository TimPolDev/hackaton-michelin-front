declare module '@mapbox/polyline' {
  export interface LatLngTuple {
    latitude: number;
    longitude: number;
  }

  export interface DecodedPolyline {
    type: 'LineString';
    coordinates: number[][];
  }

  export function decode(str: string, precision?: number): number[][];
  export function encode(coordinates: number[][], precision?: number): string;
  export function fromGeoJSON(geojson: any, precision?: number): string;
  export function toGeoJSON(str: string, precision?: number): DecodedPolyline;

  const polyline: {
    decode: typeof decode;
    encode: typeof encode;
    fromGeoJSON: typeof fromGeoJSON;
    toGeoJSON: typeof toGeoJSON;
  };

  export default polyline;
}
