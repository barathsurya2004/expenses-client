export const getColorClass = (color: string | undefined): string => {
  switch (color) {
    case 'primary': return 'primary';
    case 'secondary': return 'secondary';
    case 'tertiary': return 'tertiary';
    case 'tertiary-container': return 'tertiary-container';
    case 'error': return 'error';
    case 'blue-400': return 'blue-400';
    case 'green-400': return 'green-400';
    default: return 'primary';
  }
};

export const getBgClass = (color: string | undefined): string => {
  switch (color) {
    case 'primary': return 'bg-primary';
    case 'secondary': return 'bg-secondary';
    case 'tertiary': return 'bg-tertiary';
    case 'tertiary-container': return 'bg-tertiary-container';
    case 'error': return 'bg-error';
    case 'blue-400': return 'bg-blue-400';
    case 'green-400': return 'bg-green-400';
    default: return 'bg-primary';
  }
};

export const getTextClass = (color: string | undefined): string => {
  switch (color) {
    case 'primary': return 'text-primary';
    case 'secondary': return 'text-secondary';
    case 'tertiary': return 'text-tertiary';
    case 'tertiary-container': return 'text-tertiary-container';
    case 'error': return 'text-error';
    case 'blue-400': return 'text-blue-400';
    case 'green-400': return 'text-green-400';
    default: return 'text-primary';
  }
};

export const getBgAlphaClass = (color: string | undefined): string => {
    switch (color) {
      case 'primary': return 'bg-primary/20';
      case 'secondary': return 'bg-secondary/20';
      case 'tertiary': return 'bg-tertiary/20';
      case 'tertiary-container': return 'bg-tertiary-container/20';
      case 'error': return 'bg-error/20';
      case 'blue-400': return 'bg-blue-400/20';
      case 'green-400': return 'bg-green-400/20';
      default: return 'bg-primary/20';
    }
  };
