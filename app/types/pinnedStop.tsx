export interface PinnedStop {
  id: string;
  name: string;
  direction?: string;
  route?: string;
  destinations?: PredictionsDestination[];
  initLoaded?: boolean;
}
