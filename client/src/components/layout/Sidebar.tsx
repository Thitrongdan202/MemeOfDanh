import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Heart, Clock, Sparkles, Settings, Zap,
  Film, ImageIcon, ChevronRight
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Bộ Sưu Tập', icon: LayoutGrid, end: true },
  { to: '/favorites', label: 'Yêu Thích', icon: Heart },
  { to: '/videos', label: 'Video', icon: Film },
  { to: '/images', label: 'Hình Ảnh', icon: ImageIcon },
  { to: '/recent', label: 'Mới Nhất', icon: Clock },
  { to: '/ai-studio', label: 'AI Studio', icon: Sparkles },
  { to: '/settings', label: 'Cài Đặt', icon: Settings },
];

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🏛</span>
        <div>
          <div className={styles.logoName}>Danh'Mus</div>
          <div className={styles.logoTagline}>Bảo Tàng Meme</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(styles.navItem, isActive && styles.navItemActive)
            }
          >
            <Icon size={16} className={styles.navIcon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className={styles.footer}>
        <button
          className={styles.themeBtn}
          onClick={() =>
            setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
          }
          title={`Chế độ: ${theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}`}
        >
          <span className={styles.themeBtnIcon}>
            {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '⚙️'}
          </span>
          <span className={styles.themeBtnLabel}>
            {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}
          </span>
        </button>
      </div>
    </aside>
  );
}
