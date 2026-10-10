import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Data betragtes som frisk i 60 sekunder, så navigation mellem sider
        // ikke henter alt igen. Ændringer invaliderer selv de relevante queries,
        // og live-data (indkøbsliste, ugeplan) holdes opdateret via Realtime.
        staleTime: 60_000,
        refetchOnWindowFocus: true,
      },
    },
  });

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
