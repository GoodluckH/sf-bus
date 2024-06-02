import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { ClientOnly } from "remix-utils/client-only";
import LazyMap from "~/.client/lazy-map";
import "leaflet/dist/leaflet.css";

import stylesheet from "~/tailwind.css?url";

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
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <ClientOnly fallback={<p>Loading...</p>}>{() => <LazyMap />}</ClientOnly>
    </div>
  );
}
