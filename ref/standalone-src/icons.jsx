// Hairline icons — 24px viewBox, 1.6 stroke. All currentColor.

const Icon = ({ d, size = 20, stroke = 1.6, fill, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d && <path d={d} fill={fill || 'none'} />}
    {children}
  </svg>
);

const ICONS = {
  'home':      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-8.5z" />,
  'zap':       <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  'shopping-bag': <><path d="M5 7h14l-1.2 13a1 1 0 01-1 .9H7.2a1 1 0 01-1-.9L5 7z"/><path d="M9 7V5a3 3 0 016 0v2"/></>,
  'car':       <><path d="M5 17h14M6 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M15 17v2a1 1 0 001 1h1a1 1 0 001-1v-2"/><path d="M4 17l1.5-5.5a2 2 0 011.9-1.5h9.2a2 2 0 011.9 1.5L20 17"/><circle cx="7.5" cy="14.5" r="0.6" fill="currentColor"/><circle cx="16.5" cy="14.5" r="0.6" fill="currentColor"/></>,
  'coffee':    <><path d="M4 8h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4V8z"/><path d="M16 10h2a2 2 0 010 4h-2"/><path d="M7 3v2M10 3v2M13 3v2"/></>,
  'utensils':  <><path d="M7 3v8a2 2 0 002 2v8M5 3v6a2 2 0 002 2"/><path d="M17 3c-1.5 0-3 2-3 5s1.5 5 3 5v8"/></>,
  'repeat':    <><path d="M17 2l4 4-4 4"/><path d="M3 12V9a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 12v3a4 4 0 01-4 4H3"/></>,
  'shopping-cart': <><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5L7 15h12l2-8H6"/></>,
  'briefcase': <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/><path d="M3 13h18"/></>,
  'trending-up': <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
  'palette':   <><path d="M12 3a9 9 0 100 18 2 2 0 002-2v-1a2 2 0 012-2h2a3 3 0 003-3 9 9 0 00-9-10z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="9.5" cy="7" r="1" fill="currentColor"/><circle cx="14" cy="7" r="1" fill="currentColor"/><circle cx="17" cy="11" r="1" fill="currentColor"/></>,
  'film':      <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M3 16h18M7 3v18M17 3v18"/></>,
  'shield':    <path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z"/>,
  'star':      <path d="M12 3l2.7 5.7 6.3.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.3-.9L12 3z"/>,
  'search':    <><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></>,
  'filter':    <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/>,
  'plus':      <><path d="M12 5v14M5 12h14"/></>,
  'close':     <><path d="M6 6l12 12M18 6L6 18"/></>,
  'chevron-right': <path d="M9 6l6 6-6 6"/>,
  'chevron-down': <path d="M6 9l6 6 6-6"/>,
  'chevron-left': <path d="M15 6l-6 6 6 6"/>,
  'arrow-up-right': <><path d="M7 17L17 7"/><path d="M8 7h9v9"/></>,
  'arrow-down-right': <><path d="M7 7l10 10"/><path d="M17 8v9H8"/></>,
  'check':     <path d="M5 12.5l4 4 10-10"/>,
  'sparkles':  <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/></>,
  'bell':      <><path d="M6 9a6 6 0 1112 0v3l1.5 3.5h-15L6 12V9z"/><path d="M10 19a2 2 0 004 0"/></>,
  'alert':     <><path d="M12 3l10 17H2L12 3z"/><path d="M12 10v4M12 17v.5" stroke="white" strokeWidth="2"/></>,
  'wallet':    <><path d="M3 7a2 2 0 012-2h12v4H5a2 2 0 01-2-2z"/><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9H5a2 2 0 01-2-2z"/><circle cx="17" cy="14" r="1.3" fill="currentColor"/></>,
  'compass':   <><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6 6-2z" fill="currentColor"/></>,
  'list':      <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></>,
  'gift':      <><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11"/><path d="M12 9c-2 0-4-1.5-4-3a2 2 0 014 0c0 1.5-2 3-4 3M12 9c2 0 4-1.5 4-3a2 2 0 00-4 0c0 1.5 2 3 4 3"/></>,
  'flame':     <path d="M12 3c1 3 5 5 5 9a5 5 0 11-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>,
  'tag':       <><path d="M3 12V4a1 1 0 011-1h8l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></>,
  'mic':       <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></>,
  'pencil':    <><path d="M16 3l5 5-12 12H4v-5L16 3z"/></>,
  'clock':     <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  'eye':       <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
  'sun':       <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></>,
  'moon':      <path d="M21 13a8 8 0 11-10-10 7 7 0 1010 10z"/>,
  'trash':     <><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/><path d="M5 6l1 14a1 1 0 001 1h10a1 1 0 001-1l1-14"/></>,
  'image':     <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="M21 16l-5-5-10 10"/></>,
  'arrow-right': <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  'minus':     <path d="M5 12h14"/>,
  'link':      <><path d="M10 14a4 4 0 005 1l3-3a4 4 0 00-6-6l-1 1"/><path d="M14 10a4 4 0 00-5-1l-3 3a4 4 0 006 6l1-1"/></>,
  'wifi':      <><path d="M2 9a16 16 0 0120 0"/><path d="M5 13a11 11 0 0114 0"/><path d="M8.5 16.5a6 6 0 017 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></>,
  'settings':  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
  'phone':     <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></>,
  'dumbbell':  <><path d="M6 7v10M4 9v6M18 7v10M20 9v6M6 12h12"/></>,
  'receipt':   <><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
};

function Lucide({ name, size = 20, stroke = 1.6, style, color }) {
  const node = ICONS[name];
  if (!node) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} style={{ color, ...style }}>
        <circle cx="12" cy="12" r="9"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ color, ...style }}>
      {node}
    </svg>
  );
}

Object.assign(window, { Lucide, ICONS });
