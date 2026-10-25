import type { MetadataRoute } from "next";
import { games } from "@game-lab/game-core";
import { siteUrl } from "../lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/` },
    ...games.map(({ slug }) => ({ url: `${siteUrl}/games/${slug}/` }))
  ];
}
