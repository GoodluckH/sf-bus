import { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request }) => {
  // get query params
  const url = new URL(request.url);
  const route = url.searchParams.get("route");

  try {
    const response = await fetch(
      `https://sfmta.gtfs.media/gtfs/api/v1/agencies/sfmta/routes/${route}/geojson`,
      {
        mode: "no-cors",
      }
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};
