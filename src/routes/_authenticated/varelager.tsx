import { createFileRoute, redirect } from "@tanstack/react-router";

// Siden hed tidligere "Varelager" – gamle links sendes videre til Basisvarer.
export const Route = createFileRoute("/_authenticated/varelager")({
  beforeLoad: () => {
    throw redirect({ to: "/basisvarer" });
  },
});
