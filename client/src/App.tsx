import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MuseumPavilion } from '@/pages/MuseumPavilion';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MuseumPavilion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
