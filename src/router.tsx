import { createRouter } from "@tanstack/react-router";
import { Route as RootRoute } from "./routes/__root";
import { Route as IndexRoute } from "./routes/index";

const routeTree = RootRoute.addChildren([IndexRoute]);

export function getRouter() {
  const basepath = import.meta.env.BASE_URL;
  const router = createRouter({
    basepath,
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
