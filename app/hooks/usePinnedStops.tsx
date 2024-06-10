import { useState, useEffect } from "react";

const fetchRouteData = (
  pinnedStops: any[],
  setPinnedStops: (s: any) => void
) => {
  pinnedStops.forEach((stop) => {
    fetch(`api/prediction?route=${stop.route}&stopId=${stop.id}`)
      .then((response) => response.json())
      .then((json) => {
        setPinnedStops((prev: any) =>
          prev.map((s: any) => {
            if (s.id === stop.id) {
              return {
                ...s,
                destinations:
                  json && (json as PredictionsDestination[]).length > 0
                    ? json
                    : s.destinations,
                isInitDestinationsLoaded: true,
              };
            }
            return s;
          })
        );
      })

      .catch((error) => {
        console.error(error);
      });
  });
};

export const usePinnedStops = () => {
  const [pinnedStops, setPinnedStops] = useState([]);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  useEffect(() => {
    const stops = localStorage.getItem("pinnedStops");
    if (stops) {
      setPinnedStops(JSON.parse(stops));
      setIsInitialLoadComplete(false); // Initially set to false
    }

    const updatePinnedStops = (e: any) => {
      const stops = localStorage.getItem("pinnedStops");
      if (stops) {
        setPinnedStops(JSON.parse(stops));
      }
    };

    window.addEventListener("storage", updatePinnedStops);

    return () => {
      window.removeEventListener("storage", updatePinnedStops);
    };
  }, []);

  useEffect(() => {
    if (!isInitialLoadComplete) {
      // Immediately fetch data after the initial load
      fetchRouteData(pinnedStops, setPinnedStops);
      setIsInitialLoadComplete(true);
    }

    const interval = setInterval(() => {
      fetchRouteData(pinnedStops, setPinnedStops);
    }, 3000);

    return () => clearInterval(interval);
  }, [isInitialLoadComplete, pinnedStops]);

  return [pinnedStops, setPinnedStops];
};
