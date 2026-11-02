import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import styles from './AppShell.module.css';

export function AppShell() {
  useTheme();
  const { accentColor } = useSettingsStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-primary', accentColor);
  }, [accentColor]);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <TopBar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
