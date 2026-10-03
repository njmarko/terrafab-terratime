import { createFileRoute } from "@tanstack/react-router";
import { TerraClock } from "@/components/terra-clock";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <TerraClock />;
}
