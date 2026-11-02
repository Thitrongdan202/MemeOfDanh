import React, { useState } from 'react';
import { useSettingsStore, Theme, MotionLevel } from '@/stores/settingsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { syncLibrary } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest } from '@/services/api';
import {
  Settings, Sun, Moon, Monitor, Palette, Sparkles, Layout,
  Trash2, RefreshCw, Check, Info, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './SettingsPage.module.css';

const ACCENT_COLORS = [
  { name: 'Đất Nung (Terracotta)', hex: '#C8691F' },
  { name: 'Đỏ Trầm (Crimson)', hex: '#DC2626' },
  { name: 'Xanh Ngọc (Emerald)', hex: '#059669' },
  { name: 'Chàm Cổ Điển (Indigo)', hex: '#4F46E5' },
  { name: 'Tím Hoàng Gia (Violet)', hex: '#7C3AED' },
  { name: 'Vàng Đất (Ochre)', hex: '#D97706' },
];

export function SettingsPage() {
  const qc = useQueryClient();
  const {
    theme, setTheme,
    motionLevel, setMotionLevel,
    galleryColumns, setGalleryColumns,
    accentColor, setAccentColor
  } = useSettingsStore();

  const { favorites, clear: clearFavorites } = useFavoritesStore();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const { data: manifest } = useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncLibrary();
      await qc.invalidateQueries({ queryKey: ['manifest'] });
      setSyncStatus(`Đồng bộ thành công! Thêm: ${res.stats.added}, Cập nhật: ${res.stats.updated}`);
    } catch (err: any) {
      setSyncStatus(`Lỗi đồng bộ: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleClearFavs = () => {
    if (window.confirm(`Bạn có chắc muốn xóa tất cả ${favorites.size} tác phẩm yêu thích?`)) {
      clearFavorites();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconCircle}>
            <Settings size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Cài Đặt & Cá Nhân Hóa</h1>
            <p className={styles.pageSubtitle}>
              Tùy chỉnh giao diện hiển thị, hiệu ứng chuyển động và thông số lưu trữ của bảo tàng Danh'Mus. Mọi thay đổi được lưu tự động.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Section 1: Giao diện & Chủ đề */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Sun size={18} className={styles.sectionIcon} />
            <h2 className={styles.cardTitle}>Chế Độ Giao Diện (Theme)</h2>
          </div>
          <p className={styles.cardDesc}>
            Chọn phong cách màu nền bảo tàng. Chế độ sáng mang tone giấy ấm cao cấp, chế độ tối mang tone phòng trưng bày kỹ thuật số.
          </p>

          <div className={styles.themeOptions}>
            <button
              className={cn(styles.themeOption, theme === 'light' && styles.themeActive)}
              onClick={() => setTheme('light')}
            >
              <Sun size={20} />
              <span className={styles.themeName}>Sáng (Light)</span>
              <span className={styles.themeSub}>Tông giấy ấm tự nhiên</span>
            </button>

            <button
              className={cn(styles.themeOption, theme === 'dark' && styles.themeActive)}
              onClick={() => setTheme('dark')}
            >
              <Moon size={20} />
              <span className={styles.themeName}>Tối (Dark)</span>
              <span className={styles.themeSub}>Đen xám điện ảnh sâu</span>
            </button>

            <button
              className={cn(styles.themeOption, theme === 'system' && styles.themeActive)}
              onClick={() => setTheme('system')}
            >
              <Monitor size={20} />
              <span className={styles.themeName}>Hệ Thống</span>
              <span className={styles.themeSub}>Tự động theo thiết bị</span>
            </button>
          </div>
        </div>

        {/* Section 2: Màu sắc Điểm Nhấn */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Palette size={18} className={styles.sectionIcon} />
            <h2 className={styles.cardTitle}>Màu Điểm Nhấn (Accent Color)</h2>
          </div>
          <p className={styles.cardDesc}>
            Màu sắc nhận diện áp dụng cho các nút hành động, thẻ nhãn, và huy hiệu triển lãm.
          </p>

          <div className={styles.accentGrid}>
            {ACCENT_COLORS.map((c) => {
              const isSelected = accentColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.hex}
                  className={cn(styles.accentItem, isSelected && styles.accentActive)}
                  onClick={() => setAccentColor(c.hex)}
                  title={c.name}
                >
                  <span className={styles.swatch} style={{ background: c.hex }}>
                    {isSelected && <Check size={14} color="white" />}
                  </span>
                  <span className={styles.accentLabel}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Cài đặt Animation & Motion */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Sparkles size={18} className={styles.sectionIcon} />
            <h2 className={styles.cardTitle}>Chuyển Động & Hiệu Ứng (Motion Design)</h2>
          </div>
          <p className={styles.cardDesc}>
            Điều chỉnh cường độ hoạt họa GSAP và tương tác micro-interactions trên toàn bộ trang.
          </p>

          <div className={styles.motionOptions}>
            <label className={cn(styles.radioRow, motionLevel === 'full' && styles.radioRowActive)}>
              <input
                type="radio"
                name="motion"
                checked={motionLevel === 'full'}
                onChange={() => setMotionLevel('full')}
              />
              <div>
                <div className={styles.radioTitle}>Đầy Đủ (Full Motion — Mặc định)</div>
                <div className={styles.radioSub}>Hiệu ứng mở rộng mượt mà, stagger cards, nhịp tim favorite, chuyển cảnh 60fps.</div>
              </div>
            </label>

            <label className={cn(styles.radioRow, motionLevel === 'reduced' && styles.radioRowActive)}>
              <input
                type="radio"
                name="motion"
                checked={motionLevel === 'reduced'}
                onChange={() => setMotionLevel('reduced')}
              />
              <div>
                <div className={styles.radioTitle}>Giảm Thiểu (Reduced Motion)</div>
                <div className={styles.radioSub}>Chuyển cảnh nhẹ nhàng, không zoom lớn hoặc xoay chuyển mạnh. Tối ưu pin và tập trung.</div>
              </div>
            </label>

            <label className={cn(styles.radioRow, motionLevel === 'off' && styles.radioRowActive)}>
              <input
                type="radio"
                name="motion"
                checked={motionLevel === 'off'}
                onChange={() => setMotionLevel('off')}
              />
              <div>
                <div className={styles.radioTitle}>Tắt Toàn Bộ (Off)</div>
                <div className={styles.radioSub}>Chuyển đổi tức thì, phù hợp với máy cấu hình thấp hoặc khi cần tốc độ tối đa.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Mật Độ Bố Cục Thư Viện */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Layout size={18} className={styles.sectionIcon} />
            <h2 className={styles.cardTitle}>Bố Cục Cột Thư Viện (Masonry Columns)</h2>
          </div>
          <p className={styles.cardDesc}>
            Tùy biến số lượng cột hiển thị của Masonry Grid.
          </p>

          <div className={styles.colButtonGroup}>
            {[
              { val: 0, label: 'Tự Động (Auto)' },
              { val: 2, label: '2 Cột' },
              { val: 3, label: '3 Cột' },
              { val: 4, label: '4 Cột' },
              { val: 5, label: '5 Cột' },
            ].map(({ val, label }) => (
              <button
                key={val}
                className={cn(styles.colBtn, galleryColumns === val && styles.colBtnActive)}
                onClick={() => setGalleryColumns(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Thư Viện & Đồng Bộ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <RefreshCw size={18} className={styles.sectionIcon} />
            <h2 className={styles.cardTitle}>Trạng Thái Thư Viện & Đồng Bộ</h2>
          </div>
          <p className={styles.cardDesc}>
            Quét lại thư mục <code>memes/</code> để phát hiện ảnh/video mới được thêm vào đĩa cứng.
          </p>

          <div className={styles.syncBox}>
            <div className={styles.syncInfoRow}>
              <span>Tổng số tác phẩm:</span>
              <strong>{manifest?.totalCount || 0}</strong>
            </div>
            <div className={styles.syncInfoRow}>
              <span>Hình ảnh:</span>
              <strong>{manifest?.imageCount || 0}</strong>
            </div>
            <div className={styles.syncInfoRow}>
              <span>Video:</span>
              <strong>{manifest?.videoCount || 0}</strong>
            </div>
            <div className={styles.syncInfoRow}>
              <span>Đồng bộ lần cuối:</span>
              <span>{manifest?.lastSyncedAt ? new Date(manifest.lastSyncedAt).toLocaleString('vi-VN') : 'N/A'}</span>
            </div>

            {syncStatus && <div className={styles.syncStatusAlert}>{syncStatus}</div>}

            <button
              className={styles.syncNowBtn}
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw size={14} className={syncing ? styles.spinning : ''} />
              <span>{syncing ? 'Đang quét và đồng bộ thư mục...' : 'Đồng Bộ Ngay Bây Giờ'}</span>
            </button>
          </div>
        </div>

        {/* Section 6: Quản Lý Dữ Liệu Cục Bộ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Trash2 size={18} className={styles.sectionIcon} />
            <h2 className={styles.cardTitle}>Dữ Liệu Cục Bộ</h2>
          </div>
          <p className={styles.cardDesc}>
            Quản lý các thông tin đã lưu trữ trên trình duyệt của bạn (danh sách yêu thích, cấu hình).
          </p>

          <div className={styles.dataActionRow}>
            <div>
              <div className={styles.dataActionTitle}>Danh Sách Yêu Thích</div>
              <div className={styles.dataActionSub}>Đang lưu trữ {favorites.size} tác phẩm trong bộ nhớ trình duyệt.</div>
            </div>
            <button
              className={styles.btnClearFav}
              onClick={handleClearFavs}
              disabled={favorites.size === 0}
            >
              Xóa Yêu Thích
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
