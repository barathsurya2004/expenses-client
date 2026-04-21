import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface AnimateProps {
  children: React.ReactNode;
  type?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
  trigger?: unknown;
}

export const Animate: React.FC<AnimateProps> = ({ 
  children, 
  type = 'fade', 
  delay = 0, 
  duration = 0.6,
  className = '',
  trigger
}) => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const vars: gsap.TweenVars = {
      duration,
      delay,
      ease: 'power3.out',
      opacity: 0,
    };

    switch (type) {
      case 'slideUp':
        vars.y = 30;
        break;
      case 'slideDown':
        vars.y = -30;
        break;
      case 'slideLeft':
        vars.x = 30;
        break;
      case 'slideRight':
        vars.x = -30;
        break;
      case 'scale':
        vars.scale = 0.9;
        break;
    }

    gsap.from(container.current, {
      ...vars,
      clearProps: 'all'
    });
  }, { scope: container, dependencies: [trigger] });

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
};
