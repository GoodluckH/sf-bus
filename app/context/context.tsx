import { createContext } from "react";
import { PinnedStop } from "~/types/pinnedStop";
import { RouteData, Stop } from "~/types/routes";

export const TransitContext = createContext<{
  selectedRoutes: string[];
  selectedRouteData: RouteData | null;
  selectedStop: Stop | null;
  pinnedStops: PinnedStop[];
  setPinnedStops: (stops: PinnedStop[]) => void;
  setSelectedStop: (stop: Stop | null) => void;
  loadingRoutePaths: boolean;
  setLoadingRoutePaths: (loading: boolean) => void;
  setSelectedRoutes: (routes: string[]) => void;
}>({
  selectedStop: null,
  pinnedStops: [],
  setPinnedStops: (s: PinnedStop[]) => {},
  setSelectedStop: (s: Stop | null) => {},
  selectedRoutes: [],
  selectedRouteData: null,
  loadingRoutePaths: false,
  setLoadingRoutePaths: (l: boolean) => {},
  setSelectedRoutes: (r: string[]) => {},
});
