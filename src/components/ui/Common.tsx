import React from 'react';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, showBack, onBack, actions }) => {
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-5 h-16 bg-[#131316]/70 backdrop-blur-3xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="text-[#aac7ff] hover:bg-[#353438] transition-colors p-1.5 rounded-full active:scale-95 duration-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}
        {!showBack && (
          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface text-[18px]">person</span>
          </div>
        )}
        <h1 className="font-['Inter'] tracking-tight text-lg font-bold text-[#e5e1e6]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {actions ? actions : (
          <button className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center hover:opacity-70 transition-opacity duration-300 active:scale-95 transition-transform duration-200 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
          </button>
        )}
      </div>
    </header>
  );
};

export const ProgressBar: React.FC<{ progress: number, color?: string, height?: string }> = ({ progress, color = 'bg-primary', height = 'h-1.5' }) => {
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <div className={`w-full ${height} bg-surface-container-highest rounded-full overflow-hidden`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};
