import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { id: "dashboard", label: "Overview", path: "/dashboard", glyph: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "transactions", label: "Transactions", path: "/transactions", glyph: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  { id: "budget", label: "Budget", path: "/budget", glyph: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { id: "wishlist", label: "Goals", path: "/wishlist", glyph: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { id: "insights", label: "Insights", path: "/insights", glyph: "M2 20h.01M7 20v-4M12 20v-8M17 20v-12M22 20V4" },
  { id: "settings", label: "Settings", path: "/settings", glyph: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" },
];

function NavIcon({ glyph, active }: { glyph: string; active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#C4903D" : "#736D65"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={glyph} />
    </svg>
  );
}

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex w-64 bg-ledger-s1 border-r border-white/10 flex-col sticky top-0 h-screen flex-shrink-0">
      {/* Wordmark */}
      <div className="p-7 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ledger-accent/15 border border-ledger-accent/30 flex items-center justify-center text-sm text-ledger-accent font-bold">₹</div>
          <div className="font-headline text-lg font-bold text-ledger-text tracking-tight">Ledger</div>
        </div>
        <div className="text-[10px] color-ledger-dim mt-1.5 tracking-widest uppercase pl-9 font-body">Personal Finance</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {NAV.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border-l-2 ${
                isActive
                  ? "bg-ledger-s3 border-ledger-accent text-ledger-text font-medium"
                  : "bg-transparent border-transparent text-ledger-muted hover:bg-ledger-s2 hover:text-ledger-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon glyph={item.glyph} active={isActive} />
                <span className="text-[13.5px] font-body tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Period chip */}
      <div className="p-5 border-t border-white/10 bg-ledger-bg/30">
        <div className="text-[10px] text-ledger-dim uppercase tracking-widest mb-1.5 font-bold">Current period</div>
        <div className="text-[13px] text-ledger-text font-semibold">April 2026</div>
        <div className="mt-2.5 bg-ledger-faint rounded-full h-[3px] overflow-hidden">
          <div className="w-[57%] h-full bg-ledger-accent rounded-full transition-all duration-1000" />
        </div>
        <div className="text-[10px] text-ledger-muted mt-2 font-medium">17 of 30 days elapsed</div>
      </div>
    </aside>
  );
};
