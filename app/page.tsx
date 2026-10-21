import { loadManifest } from "@/lib/memes/manifest";
import { MuseumExperience } from "@/components/MuseumExperience";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const manifest = loadManifest();

  return <MuseumExperience initialManifest={manifest} />;
}
