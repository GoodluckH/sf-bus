export interface MetaLinks {
  next: boolean;
  previous: boolean;
  self: string;
  map: string;
  display: string;
  schedule: string;
  agency: string;
  trips: string;
  stops: string;
  directions: string;
  geojson: string;
  shapes: string;
}

export interface Meta {
  totalCount: number;
  dataCount: number;
  links: MetaLinks;
  limit: number;
  offset: number;
}

export interface Properties {
  name: string;
}

export interface GeoJsonData {
  type: string;
  properties: Properties;
  coordinates: number[][][];
}

export interface GeoJsonResponse {
  meta: Meta;
  data: GeoJsonData;
}
