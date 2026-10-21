import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { loadManifest } from "@/lib/memes/manifest";
import { MuseumHeader } from "@/components/layout/MuseumHeader";
import { MuseumFooter } from "@/components/layout/MuseumFooter";
import { formatBytes, formatDate } from "@/lib/utils";
import { ArrowLeft, Sparkles, Download, Heart } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const manifest = loadManifest();
  const artwork = manifest.artworks.find(
    (a) => a.id.toLowerCase() === params.id.toLowerCase()
  );

  if (!artwork) {
    return {
      title: "Không tìm thấy tác phẩm — MemeOfDanh",
    };
  }

  return {
    title: `${artwork.id}: ${artwork.title} — MemeOfDanh`,
    description: artwork.curatorReview,
    openGraph: {
      title: `${artwork.id}: ${artwork.title}`,
      description: artwork.curatorReview,
      images: [
        {
          url: `/api/media/${artwork.safeUrl}`,
          width: artwork.width || 800,
          height: artwork.height || 600,
          alt: artwork.title,
        },
      ],
    },
  };
}

export default function ArtworkDetailPage({ params }: PageProps) {
  const manifest = loadManifest();
  const artwork = manifest.artworks.find(
    (a) => a.id.toLowerCase() === params.id.toLowerCase()
  );

  if (!artwork) {
    notFound();
  }

  const isVideo = artwork.type === "video";
  const mediaSrc = `/api/media/${artwork.safeUrl}`;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-museum-950">
      <MuseumHeader totalArtworks={manifest.totalCount} />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-mono text-lime-accent hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về phòng trưng bày chính</span>
          </Link>
        </div>

        {/* Exhibition Frame */}
        <div className="rounded-2xl bg-museum-900 border border-museum-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Media Viewport */}
          <div className="lg:w-3/5 bg-museum-950 p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-museum-800">
            {isVideo ? (
              <video
                src={mediaSrc}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl object-contain"
              />
            ) : (
              <img
                src={mediaSrc}
                alt={artwork.title}
                className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl object-contain"
              />
            )}
          </div>

          {/* Dossier */}
          <div className="lg:w-2/5 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-lime-accent font-bold tracking-widest uppercase">
                  {artwork.id}
                </span>
                <span className="text-museum-400 uppercase text-[11px]">
                  {artwork.humorStyle}
                </span>
              </div>

              <h1 className="font-serif text-3xl font-bold tracking-tight text-ivory">
                {artwork.title}
              </h1>

              <div className="p-4 rounded-xl bg-museum-850/80 border border-museum-750 space-y-2">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-lime-accent uppercase">
                  <Sparkles className="w-3 h-3" />
                  <span>Lời bình giám tuyển</span>
                </div>
                <blockquote className="font-serif italic text-base text-ivory leading-relaxed">
                  "{artwork.curatorReview}"
                </blockquote>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-museum-400 uppercase tracking-wider">
                  Bối cảnh & Phân tích thị giác
                </span>
                <p className="text-xs text-museum-300 font-serif leading-relaxed">
                  {artwork.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {artwork.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-museum-800 text-museum-300 border border-museum-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-museum-800 text-[11px] font-mono text-museum-400 space-y-1">
                <div className="flex justify-between">
                  <span>Tên tệp:</span>
                  <span className="text-ivory">{artwork.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dung lượng:</span>
                  <span className="text-ivory">{formatBytes(artwork.sizeBytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ngày ghi nhận:</span>
                  <span className="text-ivory">{formatDate(artwork.modifiedAt)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-museum-800">
              <a
                href={mediaSrc}
                download={artwork.filename}
                className="w-full py-2.5 px-4 rounded-lg bg-lime-accent text-museum-950 font-mono text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-lime-dim transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải ảnh gốc về máy</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <MuseumFooter />
    </div>
  );
}
