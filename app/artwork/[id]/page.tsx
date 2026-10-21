import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { loadManifest } from "@/lib/memes/manifest";
import { MuseumHeader } from "@/components/layout/MuseumHeader";
import { MuseumFooter } from "@/components/layout/MuseumFooter";
import { formatBytes, formatDate } from "@/lib/utils";
import { ArrowLeft, Sparkles, Download } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-between bg-museum-bg">
      <MuseumHeader totalArtworks={manifest.totalCount} />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-cobalt hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về phòng trưng bày chính</span>
          </Link>
        </div>

        {/* Exhibition Frame */}
        <div className="rounded-xl bg-museum-surface border border-museum-border shadow-card overflow-hidden flex flex-col lg:flex-row">
          {/* Media Viewport */}
          <div className="lg:w-3/5 bg-museum-muted/50 p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-museum-border">
            {isVideo ? (
              <video
                src={mediaSrc}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[65vh] w-auto max-w-full rounded-lg shadow-sm object-contain"
              />
            ) : (
              <img
                src={mediaSrc}
                alt={artwork.title}
                className="max-h-[65vh] w-auto max-w-full rounded-lg shadow-sm object-contain"
              />
            )}
          </div>

          {/* Dossier */}
          <div className="lg:w-2/5 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-museum-surface">
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-cobalt">
                  {artwork.id}
                </span>
                <span className="text-museum-subtle text-[11px]">
                  {artwork.humorStyle}
                </span>
              </div>

              <h1 className="font-serif text-2xl font-bold tracking-tight text-museum-text leading-snug">
                {artwork.title}
              </h1>

              <div className="p-4 rounded-xl bg-museum-muted/70 border border-museum-border space-y-2">
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-cobalt">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bình luận của giám tuyển</span>
                </div>
                <blockquote className="font-serif italic text-sm text-museum-text leading-relaxed">
                  "{artwork.curatorReview}"
                </blockquote>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-museum-secondary uppercase tracking-wider block">
                  Bối cảnh & quan sát
                </span>
                <p className="text-xs text-museum-secondary leading-relaxed">
                  {artwork.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {artwork.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-museum-muted text-museum-secondary border border-museum-border"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-museum-border text-[11px] text-museum-secondary space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Tên tệp gốc:</span>
                  <span className="text-museum-text truncate max-w-[180px]" title={artwork.filename}>
                    {artwork.filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dung lượng:</span>
                  <span className="text-museum-text">{formatBytes(artwork.sizeBytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ngày ghi nhận:</span>
                  <span className="text-museum-text">{formatDate(artwork.modifiedAt)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-museum-border">
              <a
                href={mediaSrc}
                download={artwork.filename}
                className="w-full py-2.5 px-4 rounded-lg bg-cobalt text-white text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-cobalt-hover transition-colors shadow-sm"
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
