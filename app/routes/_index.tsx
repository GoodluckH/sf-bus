import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";

import "leaflet/dist/leaflet.css";
import stylesheet from "~/tailwind.css?url";

import { Key, useContext, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { ROUTES } from "~/assets/sf/routes";
import { RouteData, Stop } from "~/types/routes";
import { ClientOnly } from "remix-utils/client-only";
import LazyMap from "~/.client/lazy-map";
import { TransitContext } from "~/context/context";
import { usePersistedState } from "~/hooks/usePersistedState";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { PinnedStop } from "~/types/pinnedStop";
import { motion } from "framer-motion";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export default function Index() {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [searchingStops, setSearchingStops] = useState(false);
  const [loadingRoutePaths, setLoadingRoutePaths] = useState(false);
  const [selectedRouteData, setSelectedRouteData] = useState<RouteData | null>(
    null
  );
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [pinnedStops, setPinnedStops] = usePersistedState<PinnedStop[]>(
    [],
    "pinnedStops"
  );

  const providedValue = useMemo(
    () => ({
      pinnedStops,
      setPinnedStops,
      selectedRouteData,
      selectedRoutes,
      loadingRoutePaths,
      setLoadingRoutePaths,
      setSelectedRoutes,
      selectedStop,
      setSelectedStop,
    }),
    [
      selectedRouteData,
      selectedRoutes,
      loadingRoutePaths,
      selectedStop,
      pinnedStops,
    ]
  );

  const clear = () => {
    setSelectedRouteData(null);
    setSelectedRoutes([]);
    setSelectedStop(null);
  };

  const handleRouteSelection = async (key: Key) => {
    if (!key) {
      clear();
      return;
    }
    const id = (key as string).split(" - ")[0];
    const route = ROUTES[parseInt(id)];

    if (!route) {
      clear();
      return;
    }
    setSearchingStops(true);
    setSelectedRoutes(() => [route.id]);

    try {
      const routeDataResponse = await fetch(`/api/stops?route=${route.id}`);
      if (!routeDataResponse.ok) {
        throw new Error(`HTTP error! status: ${routeDataResponse.status}`);
      }
      const routeData: RouteData = await routeDataResponse.json();
      setSelectedRouteData(routeData);
    } catch (error) {
      console.error(error);
    }
    setSearchingStops(false);
  };

  const fetchRouteData = () => {
    const _pinnedStops = localStorage.getItem("pinnedStops");
    if (!_pinnedStops) return;
    const localPinnedStops: {
      id: string;
      name: string;
      direction?: string;
      route?: string;
    }[] = JSON.parse(_pinnedStops);

    localPinnedStops.forEach((stop) => {
      fetch(`api/prediction?route=${stop.route}&stopId=${stop.id}`)
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          setPinnedStops((prev) =>
            prev.map((s) => {
              if (s.id === stop.id) {
                return {
                  ...s,
                  destinations:
                    json && (json as PredictionsDestination[]).length > 0
                      ? (json as PredictionsDestination[])
                      : s.destinations,
                  initLoaded: true,
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

  useEffect(() => {
    const stops = localStorage.getItem("pinnedStops");
    if (stops) {
      const stopsArray = JSON.parse(stops);
      if (stopsArray.length > 0) {
        localStorage.setItem(
          "pinnedStops",
          JSON.stringify(
            stopsArray.map((s: any) => ({
              ...s,
              initLoaded: false,
            }))
          )
        );
        setTimeout(fetchRouteData, 100);
      }
    }

    const interval = setInterval(fetchRouteData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TransitContext.Provider value={providedValue}>
      <ClientOnly fallback={<p></p>}>
        {() => (
          <div className="w-full h-screen flex flex-col justify-center items-center relative">
            <Card
              className={`w-full max-w-lg p-5 z-[10000] absolute top-1 right-1`}
            >
              <Accordion variant="splitted" className="">
                <AccordionItem
                  key="1"
                  startContent={<IconPlus />}
                  aria-label="add-a-stop"
                  title="Add a Stop"
                  className="px-0 overflow-hidden"
                >
                  <div className="overflow-hidden flex flex-col justify-center items-center w-full">
                    <Autocomplete
                      label="Select a Route"
                      className="!z-[20000] "
                      onSelectionChange={handleRouteSelection}
                      isDisabled={searchingStops || loadingRoutePaths}
                    >
                      {ROUTES.map((info, id) => (
                        <AutocompleteItem
                          key={`${id} - ${info.title}`}
                          value={info.title}
                        >
                          {info.title}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    {searchingStops || loadingRoutePaths ? (
                      <Spinner className="mt-3" />
                    ) : (
                      <>
                        {selectedRouteData && (
                          <Autocomplete
                            label="Find a Stop"
                            className="mt-3"
                            onSelectionChange={(key) => {
                              if (!key) {
                                setSelectedStop(null);
                                return;
                              }
                              const stop =
                                selectedRouteData.stops[key as number];
                              setSelectedStop(stop || null);
                            }}
                          >
                            {selectedRouteData.stops.map((stop, id) => {
                              const direction =
                                selectedRouteData.directions.find((d) =>
                                  d.stops.includes(stop.id)
                                );
                              return (
                                <AutocompleteItem
                                  textValue={`${stop.name} - ${direction?.shortName}`}
                                  key={id}
                                  value={`${stop.name} - ${direction?.shortName}`}
                                >
                                  {stop.name} - {direction?.shortName}
                                </AutocompleteItem>
                              );
                            })}
                          </Autocomplete>
                        )}

                        <Button
                          color="primary"
                          className="mt-3 w-full"
                          isDisabled={!selectedStop}
                          onClick={() => {
                            if (selectedStop) {
                              const direction =
                                selectedRouteData?.directions.find((d) =>
                                  d.stops.includes(selectedStop.id)
                                )?.shortName;
                              const newPinnedStop = {
                                id: selectedStop.id,
                                name: selectedStop.name,
                                route: selectedRouteData?.id,
                                direction,
                                isInitDestinationsLoaded: false,
                              };

                              if (
                                pinnedStops.find(
                                  (s: any) => s.id === selectedStop?.id
                                )
                              ) {
                                setPinnedStops([
                                  ...pinnedStops.filter(
                                    (s: any) => s.id !== selectedStop?.id
                                  ),
                                ]);
                              } else {
                                setPinnedStops([...pinnedStops, newPinnedStop]);
                                fetchRouteData();
                              }
                            }
                          }}
                        >
                          {pinnedStops.find((s) => s.id === selectedStop?.id)
                            ? "Unpin Stop"
                            : "Pin Stop"}
                        </Button>
                      </>
                    )}
                  </div>
                </AccordionItem>
              </Accordion>

              {pinnedStops.length > 0 && (
                <div className="mt-10">
                  <div className="flex flex-row justify-between items-center my-2">
                    <h1 className="text-2xl font-bold">My Stops</h1>
                    <Chip
                      variant="bordered"
                      className="text-xs text-success"
                      startContent={
                        <span className="relative flex h-3 w-3 mx-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                        </span>
                      }
                    >
                      Live
                    </Chip>
                  </div>

                  {pinnedStops.map((stop, id) => (
                    <PinnedStopPredictionCard stop={stop} key={id} />
                  ))}
                </div>
              )}
            </Card>
            <LazyMap />
          </div>
        )}
      </ClientOnly>
    </TransitContext.Provider>
  );
}

const PinnedStopPredictionCard = ({ stop }: { stop: PinnedStop }) => {
  const { setPinnedStops, pinnedStops } = useContext(TransitContext);
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className="flex flex-col justify-start items-start rounded-3xl border p-2 my-2"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="flex flex-row items-center">
        <div className="text-sm font-bold">{stop.name}</div>
        <div className="ml-3 text-xs text-gray-500">{stop.route}</div>
        <Button
          isIconOnly
          color="danger"
          className="w-2"
          onClick={() => {
            setPinnedStops([...pinnedStops.filter((s) => s.id !== stop.id)]);
          }}
        >
          <IconTrash />
        </Button>
      </div>

      {!stop.initLoaded && <Spinner />}

      {stop.initLoaded &&
        stop.destinations &&
        stop.destinations.map((destination, id) => (
          <div
            key={id}
            className="flex flex-col justify-start items-start relative"
          >
            <div className="text-xs font-bold">To {destination.name}</div>
            <div className="flex flex-row items-center gap-1">
              {destination.predictions.map((prediction, id) => {
                const minsLeft = Math.round(
                  (parseInt(prediction.arrival) * 1000 - Date.now()) / 1000 / 60
                );

                return (
                  <Card
                    className="p-2 w-[100px] h-[120px] flex flex-col justify-center items-center"
                    key={id}
                    style={{
                      transform: `translateX(${-id * (hovered ? 0 : 99)}px)`,
                      zIndex: 30000 - id,
                    }}
                  >
                    <div
                      key={id}
                      className={`${
                        minsLeft === 0 ? "text-4xl" : "text-6xl"
                      } font-black text-black`}
                    >
                      {minsLeft === 0 ? "NOW" : minsLeft}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
    </motion.div>
  );
};
