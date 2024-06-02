import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import AllRoutes from "public/sf/routes.json";
import { useState, useEffect } from "react";
import { Path, Point, RouteData } from "~/types/routes";
import { GeoJsonResponse } from "~/types/geo";
import { useFetcher } from "@remix-run/react";

const sf_position = {
  lat: 37.755,
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

    const json: any = await response.json();
    return json;
  } catch (error) {
    console.error(`Error fetching route ${route}:`, error);
    return [];
  }
};

export default function Map() {
  const [routePaths, setRoutePaths] = useState<
    {
      coordinates: number[][][];
      color: string;
      textColor: string;
    }[]
  >([]);
  const fetcher = useFetcher();

  useEffect(() => {
    const loadRoutes = async () => {
      for (const route of AllRoutes) {
        const geoJson: GeoJsonResponse = await fetchGeoJson(route.id);

        setRoutePaths((prevPaths) => [
          ...prevPaths,
          {
            coordinates: geoJson.data.coordinates,
            color: route.color,
            textColor: route.textColor,
          },
        ]);
      }
    };

    loadRoutes();
  }, [AllRoutes]);

  return (
    <MapContainer
      center={sf_position}
      zoom={12.6}
      minZoom={12.6}
      //   maxBounds={[
      //     [37.765, -122.4196],
      //     [37.765, -122.4196],
      //   ]}
    >
      {routePaths &&
        routePaths.map((path, index) => (
          <Polyline
            key={index}
            pathOptions={{ color: `#${path.color}`, weight: 5, opacity: 0.7 }}
            positions={path.coordinates.map((coordSection) => {
              return coordSection.map((coord) => ({
                lng: coord[0],
                lat: coord[1],
              }));
            })}
          />
        ))}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
      />
    </MapContainer>
  );
}
