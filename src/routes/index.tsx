import { createFileRoute } from "@tanstack/react-router";
import { TerraClock } from "@/components/terra-clock";

/**
 * `/?wallpaper=1`: the clock without buttons, menu or zoom, for use as a URL wallpaper
 * (for example Lively's "Webpage" type). Without the parameter the site is unchanged.
 */
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { wallpaper?: boolean } =>
    search.wallpaper === 1 || search.wallpaper === "1" || search.wallpaper === true ? { wallpaper: true } : {},
  component: Home,
});

function Home() {
  const { wallpaper } = Route.useSearch();
  return <TerraClock wallpaper={wallpaper === true} />;
}
