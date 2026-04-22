import React from 'react';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, showBack, onBack, actions }) => {
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-ledger-bg/80 backdrop-blur-md border-b border-ledger-border">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={onBack}
            className="text-ledger-accent hover:bg-ledger-s2 transition-colors p-2 rounded-full active:scale-95 duration-200 flex items-center justify-center border border-ledger-border"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}
        <h1 className="font-headline tracking-tight text-xl font-bold text-ledger-text">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {actions ? actions : (
          <button className="w-10 h-10 rounded-full bg-ledger-s2 border border-ledger-border flex items-center justify-center hover:bg-ledger-s3 transition-colors duration-300 active:scale-95 text-ledger-muted">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        )}
      </div>
    </header>
  );
};

// Map legacy color names to ledger-friendly hex codes
export const LEGACY_COLOR_MAP: Record<string, string> = {
  'sky': '#5A9BE8',
  'sky-400': '#5A9BE8',
  'blue': '#5A9BE8',
  'blue-400': '#5A9BE8',
  'teal': '#4ABFAB',
  'teal-400': '#4ABFAB',
  'emerald': '#6BAE87',
  'emerald-400': '#6BAE87',
  'green': '#6DAD85',
  'green-400': '#6DAD85',
  'orange': '#C9944A',
  'orange-400': '#C9944A',
  'violet': '#A87AC9',
  'violet-400': '#A87AC9',
  'purple': '#A87AC9',
  'purple-400': '#A87AC9',
  'pink': '#C94A8A',
  'pink-400': '#C94A8A',
  'red': '#C46555',
  'red-400': '#C46555',
};

export const ProgressBar: React.FC<{ progress: number, color?: string, height?: string }> = ({ progress, color = 'ledger-accent', height = 'h-1' }) => {
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  
  // 1. Check if it's a direct color value (hex, rgb, hsl)
  const isDirectValue = color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl');
  
  if (isDirectValue) {
    return (
      <div className={`w-full ${height} bg-ledger-faint rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${safeProgress}%`, backgroundColor: color }}
        ></div>
      </div>
    );
  }

  // 2. Check if it's a legacy color name that needs mapping
  const mappedHex = LEGACY_COLOR_MAP[color.replace('bg-', '').replace('text-', '')];
  if (mappedHex) {
    return (
      <div className={`w-full ${height} bg-ledger-faint rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${safeProgress}%`, backgroundColor: mappedHex }}
        ></div>
      </div>
    );
  }

  // 3. Otherwise treat as a Tailwind class (ledger-accent, etc)
  const tailwindClass = color.startsWith('bg-') ? color : `bg-${color}`;
  return (
    <div className={`w-full ${height} bg-ledger-faint rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${tailwindClass}`}
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};
