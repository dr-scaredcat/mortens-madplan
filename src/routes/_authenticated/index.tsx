import { createFileRoute, redirect } from "@tanstack/react-router";

// Forsiden sender videre til appens startside.
export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: () => {
    throw redirect({ to: "/opskrifter" });
  },
});
