import React, { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";

interface AnimatedSidebarProps {
  children: ReactNode;
  isVisible: boolean;
  duration?: number;
  ease?: string;
  width?: number;
  onAnimationComplete?: () => void;
}

const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({
  children,
  isVisible,
  duration = 0.3,
  ease = "power2.out",
  width = 320,
  onAnimationComplete,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    gsap.to(sidebar, {
      x: isVisible ? 0 : -width,
      duration,
      ease,
      onComplete: onAnimationComplete,
    });
  }, [isVisible, duration, ease, width, onAnimationComplete]);

  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-full bg-background border-r border-border z-30"
      style={{ width: `${width}px` }}
    >
      {children}
    </div>
  );
};

export default AnimatedSidebar; 