"use client";

import React from "react";
import { ArrowUp, Sparkles, Shield, Heart } from "lucide-react";

export function MuseumFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-museum-950 border-t border-museum-800 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-museum-850">
          {/* Main Editorial Colophon */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-lime-accent" />
              <h3 className="font-serif text-2xl font-bold tracking-tight text-ivory">
                MEMEOF DANH
              </h3>
            </div>
            <p className="font-serif italic text-museum-300 text-lg max-w-md">
              “Every image has a story. Most of them should not have happened.”
            </p>
            <p className="text-sm text-museum-400 max-w-lg leading-relaxed">
              Bảo tàng kỹ thuật số lưu trữ các kiệt tác hình ảnh và video ghi lại hành trình rèn luyện, thần thái và những sự cố bố cục của nhân vật Danh (~1.60m, ~63kg, 2 năm gym bền bỉ). Giám tuyển và lưu trữ bởi Duy.
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs text-museum-400">
            <h4 className="text-ivory uppercase tracking-wider font-semibold text-xs border-b border-museum-800 pb-2">
              HỒ SƠ HIỆN VẬT
            </h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Chủ thể nghiên cứu:</span>
                <span className="text-ivory">Danh</span>
              </li>
              <li className="flex justify-between">
                <span>Thể trọng ghi nhận:</span>
                <span className="text-ivory">~63 kg</span>
              </li>
              <li className="flex justify-between">
                <span>Chiều cao trắc địa:</span>
                <span className="text-ivory">~1.60 m</span>
              </li>
              <li className="flex justify-between">
                <span>Thâm niên phòng tập:</span>
                <span className="text-ivory">2 năm kỷ luật</span>
              </li>
              <li className="flex justify-between">
                <span>Nhiếp ảnh gia / Lưu trữ:</span>
                <span className="text-lime-accent">Duy</span>
              </li>
            </ul>
          </div>

          {/* Curatorial Disclaimer */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs text-museum-400">
            <h4 className="text-ivory uppercase tracking-wider font-semibold text-xs border-b border-museum-800 pb-2">
              ĐIỀU KHOẢN GIÁM TUYỂN
            </h4>
            <p className="leading-relaxed text-museum-400">
              Các tác phẩm được trưng bày với tinh thần trào phúng nghệ thuật cao độ và tình bạn gắn bó. Tuyệt đối không phục vụ mục đích thương mại hay lăng xê stylist.
            </p>
            <div className="pt-2">
              <button
                onClick={scrollToTop}
                data-cursor="TOP"
                className="inline-flex items-center space-x-2 text-xs font-mono text-lime-accent hover:underline"
              >
                <span>Trở về đỉnh bảo tàng</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-museum-500 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} MemeOfDanh — The Museum of Questionable Masterpieces.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-museum-400 flex items-center gap-1">
              Xây dựng với <Heart className="w-3 h-3 text-vermilion inline fill-current" /> Next.js & GSAP
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
