import { LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const route = url.searchParams.get("route");

  try {
    const response = await fetch(
      `https://webservices.umoiq.com/api/pub/v1/agencies/sfmta-cis/routes/${route}?key=0be8ebd0284ce712a63f29dcaf7798c4`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};
