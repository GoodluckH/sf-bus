import { Suspense, lazy } from "react";
const Map = lazy(() => import("./map"));

export default function LazyMap() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Map />
    </Suspense>
  );
}
