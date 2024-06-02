export interface Point {
  lat: number;
  lon: number;
}

export interface Stop {
  id: string;
  lat: number;
  lon: number;
  name: string;
  code: string;
  hidden: boolean;
  showDestinationSelector: boolean;
  directions: string[];
}

export interface Direction {
  id: string;
  shortName: string;
  name: string;
  useForUi: boolean;
  stops: string[];
}

export interface Path {
  id: string;
  points: Point[];
}

export interface RouteData {
  id: string;
  rev: number;
  title: string;
  description: string;
  color: string;
  textColor: string;
  hidden: boolean;
  boundingBox: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  stops: Stop[];
  directions: Direction[];
  paths: Path[];
  timestamp: string;
}
