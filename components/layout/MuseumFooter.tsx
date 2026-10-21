"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Heart } from "lucide-react";

export function MuseumFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-museum-surface border-t border-museum-border pt-14 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-museum-border">
          {/* Main Colophon */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cobalt" />
              <h3 className="font-serif text-xl font-bold tracking-tight text-museum-text">
                MEMEOF DANH
              </h3>
            </div>
            <p className="font-serif italic text-museum-secondary text-base max-w-md">
              “Mỗi bức ảnh đều có một câu chuyện. Phần lớn trong số đó lẽ ra không nên xảy ra.”
            </p>
            <p className="text-xs text-museum-secondary max-w-lg leading-relaxed">
              Dự án lưu trữ phi lợi nhuận dành tặng người bạn thân tên Danh (~1m60, ~63kg, kiên trì tập gym 2 năm). Số hóa, bảo quản và biên tập bởi Duy.
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="md:col-span-3 space-y-2 text-xs text-museum-secondary">
            <h4 className="font-semibold text-museum-text uppercase tracking-wider text-[11px] pb-1 border-b border-museum-border">
              Thông số ghi nhận
            </h4>
            <ul className="space-y-1.5 pt-1">
              <li className="flex justify-between">
                <span>Chủ thể:</span>
                <span className="font-medium text-museum-text">Danh</span>
              </li>
              <li className="flex justify-between">
                <span>Cân nặng ghi nhận:</span>
                <span className="font-medium text-museum-text">~63 kg</span>
              </li>
              <li className="flex justify-between">
                <span>Chiều cao trắc địa:</span>
                <span className="font-medium text-museum-text">~1.60 m</span>
              </li>
              <li className="flex justify-between">
                <span>Tập luyện:</span>
                <span className="font-medium text-museum-text">2 năm kỷ luật</span>
              </li>
              <li className="flex justify-between">
                <span>Biên tập & Chụp ảnh:</span>
                <span className="font-semibold text-cobalt">Duy</span>
              </li>
            </ul>
          </div>

          {/* Navigation & Controls */}
          <div className="md:col-span-3 space-y-2 text-xs text-museum-secondary">
            <h4 className="font-semibold text-museum-text uppercase tracking-wider text-[11px] pb-1 border-b border-museum-border">
              Điều hướng
            </h4>
            <ul className="space-y-2 pt-1">
              <li>
                <a href="#gallery-section" className="hover:text-cobalt transition-colors">
                  Bộ sưu tập tác phẩm
                </a>
              </li>
              <li>
                <a href="#curatorial-statement" className="hover:text-cobalt transition-colors">
                  Tuyên ngôn giám tuyển
                </a>
              </li>
              <li>
                <Link href="/typography-test" className="hover:text-cobalt transition-colors">
                  Trang kiểm tra font tiếng Việt
                </Link>
              </li>
              <li className="pt-2">
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cobalt hover:underline"
                >
                  <span>Lên đầu trang</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-museum-subtle space-y-3 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} MemeOfDanh — The Museum of Questionable Masterpieces.
          </div>
          <div className="flex items-center space-x-1 text-museum-secondary">
            <span>Thiết kế biên tập dành cho bạn bè với</span>
            <Heart className="w-3 h-3 text-coral fill-current inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
