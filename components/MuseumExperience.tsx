"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MuseumManifest, ArtworkMedia } from "@/lib/memes/types";
import { MuseumHeader } from "./layout/MuseumHeader";
import { MuseumHero } from "./hero/MuseumHero";
import { CuratorialStatement } from "./hero/CuratorialStatement";
import { GalleryFilter, FilterMediaType, SortOption } from "./gallery/GalleryFilter";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { ArtworkLightbox } from "./artwork/ArtworkLightbox";
import { MuseumFooter } from "./layout/MuseumFooter";

interface MuseumExperienceProps {
  initialManifest: MuseumManifest;
}

export function MuseumExperience({ initialManifest }: MuseumExperienceProps) {
  const [manifest, setManifest] = useState<MuseumManifest>(initialManifest);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeType, setActiveType] = useState<FilterMediaType>("all");
  const [activeSort, setActiveSort] = useState<SortOption>("catalog-asc");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("memeofdanh_favorites");
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn("Could not load favorites from localStorage:", e);
    }
  }, []);

  // Save favorites to localStorage
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("memeofdanh_favorites", JSON.stringify(Array.from(next)));
      } catch (err) {
        console.warn("Could not save favorites to localStorage:", err);
      }
      return next;
    });
  };

  // Check URL query on initial load (e.g. ?artwork=DANH-001)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const artworkId = params.get("artwork");
      if (artworkId) {
        const found = manifest.artworks.find(
          (a) => a.id.toLowerCase() === artworkId.toLowerCase()
        );
        if (found) {
          setSelectedArtwork(found);
        }
      }
    }
  }, [manifest]);

  // Handle deep-link update when selecting / closing
  const handleSelectArtwork = (artwork: ArtworkMedia) => {
    setSelectedArtwork(artwork);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("artwork", artwork.id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleCloseLightbox = () => {
    setSelectedArtwork(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("artwork");
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Sync Library Trigger
  const handleRescan = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success && data.manifest) {
        setManifest(data.manifest);
      }
    } catch (e) {
      console.error("Failed to rescan library:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Update a single artwork when regenerated
  const handleArtworkUpdated = (updated: ArtworkMedia) => {
    setManifest((prev) => ({
      ...prev,
      artworks: prev.artworks.map((a) => (a.id === updated.id ? updated : a)),
    }));
    setSelectedArtwork(updated);
  };

  // Shuffle handler
  const handleShuffle = () => {
    setActiveSort("shuffle");
    setShuffleSeed(Date.now());
  };

  // Filter & Sort Logic
  const filteredArtworks = useMemo(() => {
    let list = [...manifest.artworks];

    // 1. Filter by media type
    if (activeType === "image") {
      list = list.filter((a) => a.type === "image");
    } else if (activeType === "video") {
      list = list.filter((a) => a.type === "video");
    } else if (activeType === "favorites") {
      list = list.filter((a) => favorites.has(a.id));
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.curatorReview.toLowerCase().includes(q) ||
          a.filename.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Sort
    if (activeSort === "catalog-asc") {
      list.sort((a, b) => a.catalogNumber - b.catalogNumber);
    } else if (activeSort === "catalog-desc") {
      list.sort((a, b) => b.catalogNumber - a.catalogNumber);
    } else if (activeSort === "newest") {
      list.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    } else if (activeSort === "oldest") {
      list.sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());
    } else if (activeSort === "name") {
      list.sort((a, b) => a.filename.localeCompare(b.filename));
    } else if (activeSort === "shuffle") {
      // Deterministic pseudorandom based on shuffleSeed
      list.sort((a, b) => {
        const hashA = (a.catalogNumber * 997 + shuffleSeed) % 1000;
        const hashB = (b.catalogNumber * 997 + shuffleSeed) % 1000;
        return hashA - hashB;
      });
    }

    return list;
  }, [manifest.artworks, activeType, searchQuery, activeSort, favorites, shuffleSeed]);

  // Featured artwork: first one or DANH-001
  const featured = manifest.artworks.find((a) => a.featured) || manifest.artworks[0];

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Header */}
      <MuseumHeader
        totalArtworks={manifest.totalCount}
        onRescanRequested={handleRescan}
        isSyncing={isSyncing}
      />

      {/* Hero */}
      <MuseumHero
        featuredArtwork={featured}
        totalCount={manifest.totalCount}
        imageCount={manifest.imageCount}
        videoCount={manifest.videoCount}
        onOpenArtwork={handleSelectArtwork}
      />

      {/* Curatorial Statement */}
      <CuratorialStatement />

      {/* Main Gallery Section */}
      <main id="gallery-section" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-2 text-xs font-mono text-lime-accent uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-accent" />
            <span>PHÒNG TRIỂN LÃM CHÍNH • CATALOG TOÀN DIỆN</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ivory">
            Tuyển Tập Các Kiệt Tác Đầy Nghi Vấn
          </h2>
        </div>

        {/* Filters, Search & Sort */}
        <GalleryFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeType={activeType}
          onTypeChange={setActiveType}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          totalCount={manifest.totalCount}
          imageCount={manifest.imageCount}
          videoCount={manifest.videoCount}
          favoriteCount={favorites.size}
          onShuffle={handleShuffle}
        />

        {/* Gallery Grid */}
        <GalleryGrid
          artworks={filteredArtworks}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectArtwork={handleSelectArtwork}
          onResetFilters={() => {
            setSearchQuery("");
            setActiveType("all");
            setActiveSort("catalog-asc");
          }}
        />
      </main>

      {/* Exhibition Lightbox Modal */}
      <ArtworkLightbox
        artwork={selectedArtwork}
        allArtworks={filteredArtworks}
        onClose={handleCloseLightbox}
        onSelectArtwork={handleSelectArtwork}
        isFavorite={selectedArtwork ? favorites.has(selectedArtwork.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onArtworkUpdated={handleArtworkUpdated}
      />

      {/* Footer */}
      <MuseumFooter />
    </div>
  );
}
