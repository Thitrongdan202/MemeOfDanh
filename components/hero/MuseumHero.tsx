"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArtworkMedia } from "@/lib/memes/types";
import { ArrowDown, Sparkles, Award, Film, Image as ImageIcon, Flame } from "lucide-react";

interface MuseumHeroProps {
  featuredArtwork?: ArtworkMedia;
  totalCount: number;
  imageCount: number;
  videoCount: number;
  onOpenArtwork: (artwork: ArtworkMedia) => void;
}

export function MuseumHero({
  featuredArtwork,
  totalCount,
  imageCount,
  videoCount,
  onOpenArtwork,
}: MuseumHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        delay: 0.1,
      })
        .from(
          titleRef.current,
          {
            y: 40,
            opacity: 0,
            duration: 1.1,
          },
          "-=0.5"
        )
        .from(
          subtitleRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.9,
          },
          "-=0.7"
        )
        .from(
          featuredRef.current,
          {
            scale: 0.96,
            opacity: 0,
            duration: 1.2,
          },
          "-=0.8"
        )
        .from(
          statsRef.current?.children ? Array.from(statsRef.current.children) : [],
          {
            y: 25,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
          },
          "-=0.8"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[90vh] flex flex-col justify-between pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-museum-850 overflow-hidden bg-grain"
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-lime-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Hero Text */}
      <div className="max-w-6xl mx-auto w-full text-center space-y-6 pt-4">
        {/* Exhibition Badge */}
        <div ref={badgeRef} className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-museum-850/80 border border-museum-700 backdrop-blur-sm text-xs font-mono text-museum-300">
          <span className="w-2 h-2 rounded-full bg-lime-accent animate-ping" />
          <span className="text-lime-accent uppercase tracking-widest text-[11px] font-semibold">
            BẢO TÀNG NGHỆ THUẬT ĐƯƠNG ĐẠI
          </span>
          <span className="text-museum-500">•</span>
          <span className="text-museum-300">HỒ SƠ KHẢO CỨU DANH HỌC</span>
        </div>

        {/* Monumental Headline */}
        <h1
          ref={titleRef}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-ivory uppercase leading-[0.95]"
        >
          MEMEOF DANH
          <span className="block text-2xl sm:text-3xl lg:text-4xl font-serif italic text-museum-400 font-normal tracking-normal pt-3">
            The Museum of Questionable Masterpieces
          </span>
        </h1>

        {/* Tagline */}
        <p
          ref={subtitleRef}
          className="max-w-2xl mx-auto text-base sm:text-xl text-museum-300 font-serif italic leading-relaxed"
        >
          “Mỗi bức ảnh đều có một câu chuyện. Phần lớn trong số đó lẽ ra không nên xảy ra.”
        </p>
      </div>

      {/* Center Featured Acquisition Showcase */}
      {featuredArtwork && (
        <div ref={featuredRef} className="max-w-4xl mx-auto w-full mt-10">
          <div
            onClick={() => onOpenArtwork(featuredArtwork)}
            data-cursor="XEM"
            className="group relative cursor-pointer rounded-2xl overflow-hidden bg-museum-900 border border-museum-700/80 hover:border-lime-accent/60 transition-all duration-500 shadow-2xl p-4 sm:p-6"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Image Preview Container */}
              <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-xl overflow-hidden bg-museum-950 flex items-center justify-center">
                {featuredArtwork.type === "video" ? (
                  <video
                    src={`/api/media/${featuredArtwork.safeUrl}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={`/api/media/${featuredArtwork.safeUrl}`}
                    alt={featuredArtwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                )}
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-museum-950/80 backdrop-blur-md border border-museum-700 text-[10px] font-mono text-lime-accent uppercase">
                  KIỆT TÁC TIÊU BIỂU #{featuredArtwork.catalogNumber.toString().padStart(3, "0")}
                </div>
              </div>

              {/* Curatorial Info */}
              <div className="w-full md:w-1/2 space-y-3.5 text-left">
                <div className="flex items-center space-x-2 text-xs font-mono text-museum-400">
                  <span className="text-lime-accent font-semibold">{featuredArtwork.id}</span>
                  <span>•</span>
                  <span>{featuredArtwork.format.toUpperCase()}</span>
                  <span>•</span>
                  <span>{featuredArtwork.humorStyle}</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-ivory group-hover:text-lime-accent transition-colors">
                  {featuredArtwork.title}
                </h3>

                <blockquote className="border-l-2 border-lime-accent pl-3 text-sm italic text-museum-300 font-serif">
                  "{featuredArtwork.curatorReview}"
                </blockquote>

                <p className="text-xs text-museum-400 line-clamp-2 leading-relaxed">
                  {featuredArtwork.description}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-lime-accent group-hover:underline flex items-center gap-1">
                    Chiêm ngưỡng chi tiết & bình phẩm AI →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Live Museum Statistics */}
      <div
        ref={statsRef}
        className="max-w-5xl mx-auto w-full mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="p-4 rounded-xl bg-museum-900/60 border border-museum-800 text-center">
          <div className="font-serif text-3xl font-bold text-ivory">{totalCount}</div>
          <div className="text-[11px] font-mono text-museum-400 uppercase tracking-wider mt-1">
            Tổng hiện vật lưu trữ
          </div>
        </div>

        <div className="p-4 rounded-xl bg-museum-900/60 border border-museum-800 text-center">
          <div className="font-serif text-3xl font-bold text-lime-accent">{imageCount}</div>
          <div className="text-[11px] font-mono text-museum-400 uppercase tracking-wider mt-1">
            Nhiếp ảnh & Meme
          </div>
        </div>

        <div className="p-4 rounded-xl bg-museum-900/60 border border-museum-800 text-center">
          <div className="font-serif text-3xl font-bold text-vermilion">{videoCount}</div>
          <div className="text-[11px] font-mono text-museum-400 uppercase tracking-wider mt-1">
            Tư liệu chuyển động
          </div>
        </div>

        <div className="p-4 rounded-xl bg-museum-900/60 border border-museum-800 text-center">
          <div className="font-serif text-3xl font-bold text-ivory">100%</div>
          <div className="text-[11px] font-mono text-museum-400 uppercase tracking-wider mt-1">
            Giám tuyển độc bản
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="flex justify-center mt-8">
        <a
          href="#gallery-section"
          data-cursor="CUỘN"
          className="flex flex-col items-center space-y-1.5 text-museum-500 hover:text-lime-accent transition-colors"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">
            KHÁM PHÁ PHÒNG TRƯNG BÀY
          </span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
