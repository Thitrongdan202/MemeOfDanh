"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArtworkMedia } from "@/lib/memes/types";
import { ArrowDown, Sparkles, ArrowRight } from "lucide-react";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useTilt } from "@/lib/motion/useTilt";
import { useMagnetic } from "@/lib/motion/useMagnetic";
import { getDuration, EASINGS } from "@/lib/motion/tokens";

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
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const { settings } = useSettings();
  const cardTiltRef = useTilt<HTMLDivElement>(settings.cardTilt ? 6 : 0);
  const ctaPrimaryRef = useMagnetic<HTMLAnchorElement>(settings.magneticButtons ? 0.3 : 0);
  const ctaSecondaryRef = useMagnetic<HTMLAnchorElement>(settings.magneticButtons ? 0.2 : 0);

  useEffect(() => {
    if (settings.reducedMotion) return;

    const ctx = gsap.context(() => {
      const dur = (base: number) =>
        getDuration(base, settings.motionIntensity, settings.reducedMotion);

      const tl = gsap.timeline({ defaults: { ease: EASINGS.emphasized } });

      tl.from(badgeRef.current, {
        y: -15,
        opacity: 0,
        duration: dur(0.6),
        delay: 0.05,
      })
        .from(
          headlineRef.current,
          {
            y: 30,
            opacity: 0,
            duration: dur(0.8),
          },
          "-=0.4"
        )
        .from(
          subtitleRef.current,
          {
            y: 20,
            opacity: 0,
            duration: dur(0.7),
          },
          "-=0.5"
        )
        .from(
          ctaGroupRef.current?.children ? Array.from(ctaGroupRef.current.children) : [],
          {
            y: 15,
            opacity: 0,
            stagger: 0.08,
            duration: dur(0.5),
          },
          "-=0.4"
        )
        .from(
          statsRef.current?.children ? Array.from(statsRef.current.children) : [],
          {
            y: 15,
            opacity: 0,
            stagger: 0.08,
            duration: dur(0.5),
          },
          "-=0.3"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [settings.motionIntensity, settings.reducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative w-full border-b border-museum-border bg-editorial-grain py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Manifesto */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow Label */}
            <div
              ref={badgeRef}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-museum-muted border border-museum-border text-xs font-medium text-museum-secondary shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-semibold text-museum-text uppercase tracking-wider">
                Bảo tàng meme cá nhân
              </span>
              <span className="text-museum-borderDark">•</span>
              <span>Tư liệu độc quyền</span>
            </div>

            {/* Main Editorial Heading */}
            <h1
              ref={headlineRef}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-museum-text leading-[1.15]"
            >
              Những kiệt tác đầy nghi vấn của Danh
            </h1>

            {/* Core Tagline */}
            <p
              ref={subtitleRef}
              className="font-serif italic text-lg sm:text-xl text-museum-secondary leading-relaxed"
            >
              “Mỗi bức ảnh đều có một câu chuyện. Phần lớn trong số đó lẽ ra không nên xảy ra.”
            </p>

            {/* Human Explanatory Description */}
            <p className="text-sm sm:text-base text-museum-secondary leading-relaxed max-w-xl">
              Kho lưu trữ hình ảnh, video và các khoảnh khắc đời thường của Danh (~1m60, ~63kg, tập gym đều đặn 2 năm). Được chụp lén, sưu tầm và biên tập bởi Duy cùng các góc nhìn bình luận dí dỏm từ AI.
            </p>

            {/* Call to Actions with Magnetic micro-interaction */}
            <div ref={ctaGroupRef} className="flex flex-wrap items-center gap-3 pt-2">
              <a
                ref={ctaPrimaryRef}
                href="#gallery-section"
                data-cursor="XEM TẤT CẢ"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-sm active:scale-95 group"
              >
                <span>Xem bộ sưu tập ({totalCount})</span>
                <ArrowDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
              </a>

              <a
                ref={ctaSecondaryRef}
                href="#curatorial-statement"
                data-cursor="TUYÊN NGÔN"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-museum-surface hover:bg-museum-muted text-museum-text border border-museum-border text-xs font-medium transition-all active:scale-95 group"
              >
                <span>Tuyên ngôn giám tuyển</span>
                <ArrowRight className="w-3.5 h-3.5 text-museum-subtle transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Real Statistics Metrics */}
            <div
              ref={statsRef}
              className="pt-6 border-t border-museum-border flex flex-wrap gap-8 text-xs"
            >
              <div className="group">
                <div className="font-serif text-2xl font-bold text-museum-text transition-transform group-hover:scale-105">
                  {totalCount}
                </div>
                <div className="text-museum-subtle mt-0.5">Tổng số hiện vật</div>
              </div>
              <div className="group">
                <div className="font-serif text-2xl font-bold text-accent transition-transform group-hover:scale-105">
                  {imageCount}
                </div>
                <div className="text-museum-subtle mt-0.5">Ảnh chụp & Meme</div>
              </div>
              <div className="group">
                <div className="font-serif text-2xl font-bold text-coral transition-transform group-hover:scale-105">
                  {videoCount}
                </div>
                <div className="text-museum-subtle mt-0.5">Video chuyển động</div>
              </div>
              <div className="group">
                <div className="font-serif text-2xl font-bold text-emerald-600 transition-transform group-hover:scale-105">
                  100%
                </div>
                <div className="text-museum-subtle mt-0.5">Giám tuyển độc bản</div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Acquisition Card with 3D Tilt */}
          {featuredArtwork && (
            <div className="lg:col-span-5">
              <div
                ref={cardTiltRef}
                onClick={() => onOpenArtwork(featuredArtwork)}
                data-cursor="XEM"
                className="group cursor-pointer rounded-xl bg-museum-surface border border-museum-border p-4 shadow-card hover:shadow-cardHover transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between text-xs pb-1 border-b border-museum-border/60">
                  <div className="flex items-center space-x-1.5 font-medium text-accent">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tác phẩm tiêu biểu</span>
                  </div>
                  <span className="font-mono text-museum-subtle text-[11px]">
                    {featuredArtwork.id}
                  </span>
                </div>

                {/* Media Container */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-museum-muted flex items-center justify-center">
                  {featuredArtwork.type === "video" ? (
                    <video
                      src={`/api/media/${featuredArtwork.safeUrl}`}
                      className={`w-full h-full object-cover ${
                        settings.hoverZoom ? "group-hover:scale-105 transition-transform duration-500" : ""
                      }`}
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <img
                      src={`/api/media/${featuredArtwork.safeUrl}`}
                      alt={featuredArtwork.title}
                      className={`w-full h-full object-cover ${
                        settings.hoverZoom ? "group-hover:scale-105 transition-transform duration-500" : ""
                      }`}
                      loading="eager"
                    />
                  )}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-museum-surface/90 backdrop-blur-sm border border-museum-border text-[10px] font-medium text-museum-secondary shadow-sm">
                    {featuredArtwork.format.toUpperCase()}
                  </div>
                </div>

                {/* Title & Critique snippet */}
                <div className="space-y-2 text-left">
                  <h3 className="font-serif text-lg font-bold text-museum-text group-hover:text-accent transition-colors line-clamp-1">
                    {featuredArtwork.title}
                  </h3>

                  <blockquote className="border-l-2 border-accent pl-3 text-xs italic text-museum-secondary font-serif leading-relaxed line-clamp-2">
                    "{featuredArtwork.curatorReview}"
                  </blockquote>

                  <div className="pt-1 flex items-center justify-between text-xs text-accent font-medium group-hover:underline">
                    <span>Xem phân tích chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
