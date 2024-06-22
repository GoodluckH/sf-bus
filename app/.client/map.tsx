import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { useState, useEffect, useContext } from "react";
import { GeoJsonResponse } from "~/types/geo";

import { ROUTES } from "~/assets/sf/routes";
import { TransitContext } from "~/context/context";
import { Checkbox } from "@nextui-org/react";
import { IconHeartFilled } from "@tabler/icons-react";

const sf_position = {
  lat: 37.765,
  lng: -122.4196,
};

const API_KEY = "0be8ebd0284ce712a63f29dcaf7798c4";
const AGENCY = "sfmta-cis";

const fetchRouteData = async (route: string) => {
  try {
    const response = await fetch(
      `https://webservices.umoiq.com/api/pub/v1/agencies/${AGENCY}/routes/${route}?key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: any = await response.json();
    return json;
  } catch (error) {
    console.error(`Error fetching route ${route}:`, error);
    return [];
  }
};

const fetchGeoJson = async (route: string) => {
  try {
    const response = await fetch(`/api/geojson?route=${route}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: GeoJsonResponse = await response.json();
    return json;
  } catch (error) {
    console.error(`Error fetching route ${route}:`, error);
    return undefined;
  }
};

export default function Map() {
  const {
    selectedRoutes,
    setLoadingRoutePaths,
    selectedRouteData,
    selectedStop,
    pinnedStops,
    setPinnedStops,
  } = useContext(TransitContext);
  const [routePaths, setRoutePaths] = useState<
    {
      coordinates: number[][][];
      color: string;
      textColor: string;
    }[]
  >([]);

  useEffect(() => {
    const loadRoutes = async () => {
      setRoutePaths([]);
      setLoadingRoutePaths(true);
      for (const routeId of selectedRoutes) {
        const route = ROUTES.find((r) => r.id === routeId);
        if (!route) continue;
        const geoJson = await fetchGeoJson(route.id);
        if (!geoJson) continue;
        setRoutePaths((prevPaths) => [
          ...prevPaths,
          {
            coordinates: geoJson.data.coordinates,
            color: route.color,
            textColor: route.textColor,
          },
        ]);
      }
      setLoadingRoutePaths(false);
    };

    loadRoutes();
  }, [selectedRoutes]);
  return (
    <MapContainer
      center={sf_position}
      zoom={12.5}
      minZoom={12.5}
      className="w-full h-screen"
    >
      {routePaths &&
        routePaths.map((path, index) => (
          <Polyline
            key={index}
            pathOptions={{ color: `#${path.color}`, weight: 5, opacity: 1 }}
            positions={path.coordinates.map((coordSection) => {
              return coordSection.map((coord) => ({
                lng: coord[0],
                lat: coord[1],
              }));
            })}
          />
        ))}

      {selectedRouteData &&
        selectedRouteData.stops
          .filter((s) => {
            if (!selectedStop) return true;
            return s.id === selectedStop.id;
          })
          .map((stop, id) => (
            <Marker position={[stop.lat, stop.lon]} key={id}>
              <Popup>
                <div className="flex flex-row justify-center items-center">
                  <Checkbox
                    size="md"
                    icon={<IconHeartFilled strokeWidth={5} />}
                    color="danger"
                    onChange={() => {
                      const direction = selectedRouteData?.directions.find(
                        (d) => d.stops.includes(stop.id)
                      )?.shortName;
                      const newPinnedStop = {
                        id: stop.id,
                        name: stop.name,
                        route: selectedRouteData?.id,
                        direction,
                        isInitDestinationsLoaded: false,
                      };

                      if (
                        pinnedStops.find((s: any) => s.id === selectedStop?.id)
                      ) {
                        setPinnedStops([
                          ...pinnedStops.filter(
                            (s: any) => s.id !== selectedStop?.id
                          ),
                        ]);
                      } else {
                        setPinnedStops([...pinnedStops, newPinnedStop]);
                        // fetchRouteData();
                      }
                    }}
                  >
                    <div className="flex flex-col justify-start items-start">
                      <div
                        className="text-sm font-bold"
                        style={{
                          color: `#${selectedRouteData.color}`,
                        }}
                      >
                        To:{" "}
                        {
                          selectedRouteData.directions.find((d) =>
                            d.stops.includes(stop.id)
                          )?.name
                        }
                      </div>
                      <div className="font-black">{stop.name}</div>
                    </div>
                  </Checkbox>
                </div>
              </Popup>
            </Marker>
          ))}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
      />
    </MapContainer>
  );
}
