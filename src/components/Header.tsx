import React from 'react';

export default function Header() {
  return (
    <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-1 font-bold text-xl text-primary">
        PlagiaShield<span className="text-text-main">AI</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 text-primary px-3 py-1 rounded-pill text-xs font-bold hidden sm:block">
          Pro Plan: 45/100 scans
        </div>
        <button className="sleek-btn sleek-btn-outline hidden sm:block">
          Xuất Báo Cáo
        </button>
        <button className="sleek-btn sleek-btn-primary">
          Quét Mới
        </button>
      </div>
    </header>
  );
}
