interface PredictionsMetaLinks {
  agency: string;
  route: string;
  stop: string;
}

interface PredictionsMeta {
  last_fetch: number;
  links: PredictionsMetaLinks;
}

interface PredictionsPrediction {
  arrival: string;
  vehicle: string;
}

interface PredictionsDestination {
  name: string;
  predictions: PredictionsPrediction[];
}

interface PredictionsData {
  destinations: PredictionsDestination[];
}

interface PredictionsResponse {
  meta: PredictionsMeta;
  data: PredictionsData;
}
