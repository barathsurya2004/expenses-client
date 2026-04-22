import { LEGACY_COLOR_MAP } from '../components/ui/Common';

export const resolveColor = (color: string | undefined): string => {
  if (!color) return '#C4903D'; // ledger-accent default
  
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
    return color;
  }

  // Handle Ledger specific tokens if passed directly
  if (color === 'ledger-accent') return '#C4903D';
  if (color === 'ledger-income') return '#6DAD85';
  if (color === 'ledger-expense') return '#C46555';
  if (color === 'ledger-muted') return '#736D65';
  if (color === 'ledger-dim') return '#4A4640';

  // Handle legacy mappings
  const mapped = LEGACY_COLOR_MAP[color.replace('bg-', '').replace('text-', '')];
  if (mapped) return mapped;

  return '#C4903D';
};

export const getColorClass = (color: string | undefined): string => {
  switch (color) {
    case 'primary': return 'ledger-accent';
    case 'secondary': return 'ledger-muted';
    case 'tertiary': return 'ledger-dim';
    case 'error': return 'ledger-expense';
    case 'income': return 'ledger-income';
    case 'expense': return 'ledger-expense';
    default: return 'ledger-accent';
  }
};

export const getBgClass = (color: string | undefined): string => {
  switch (color) {
    case 'primary': return 'bg-ledger-accent';
    case 'secondary': return 'bg-ledger-muted';
    case 'tertiary': return 'bg-ledger-dim';
    case 'error': return 'bg-ledger-expense';
    case 'income': return 'bg-ledger-income';
    case 'expense': return 'bg-ledger-expense';
    default: return 'bg-ledger-accent';
  }
};

export const getTextClass = (color: string | undefined): string => {
  switch (color) {
    case 'primary': return 'text-ledger-accent';
    case 'secondary': return 'text-ledger-muted';
    case 'tertiary': return 'text-ledger-dim';
    case 'error': return 'text-ledger-expense';
    case 'income': return 'text-ledger-income';
    case 'expense': return 'text-ledger-expense';
    default: return 'text-ledger-accent';
  }
};

export const getBgAlphaClass = (color: string | undefined): string => {
    switch (color) {
      case 'primary': return 'bg-ledger-accent/20';
      case 'secondary': return 'bg-ledger-muted/20';
      case 'tertiary': return 'bg-ledger-dim/20';
      case 'error': return 'bg-ledger-expense/20';
      case 'income': return 'bg-ledger-income/20';
      case 'expense': return 'bg-ledger-expense/20';
      default: return 'bg-ledger-accent/20';
    }
  };
