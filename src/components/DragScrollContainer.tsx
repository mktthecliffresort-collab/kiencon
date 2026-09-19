import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface DragScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  showFadeGradients?: boolean;
  fadeColorClass?: string; // e.g., 'from-stone-100' or 'from-white'
  id?: string;
}

export const DragScrollContainer: React.FC<DragScrollContainerProps> = ({
  children,
  className = '',
  innerClassName = '',
  showFadeGradients = true,
  fadeColorClass = 'from-stone-50',
  id,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollability, children]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    setIsMouseDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const el = scrollRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.6; // multiplier for pleasant drag speed

    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }

    el.scrollLeft = scrollLeftState - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
    // Allow a tiny microtask before resetting hasDragged so clickCapture can block the click
    setTimeout(() => {
      setHasDragged(false);
    }, 50);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className={`relative group max-w-full min-w-0 ${className}`} id={id}>
      {/* Left scroll affordance gradient & back button */}
      {showFadeGradients && canScrollLeft && (
        <>
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r ${fadeColorClass} to-transparent transition-opacity duration-300 opacity-90`}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const el = scrollRef.current;
              if (el) el.scrollBy({ left: -160, behavior: 'smooth' });
            }}
            className="absolute left-0.5 top-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 text-stone-700 shadow-md border border-stone-200 flex items-center justify-center -translate-y-1/2 hover:bg-stone-50 active:scale-90 transition-all opacity-85 hover:opacity-100"
            title="Cuộn về trước"
            aria-label="Cuộn về trước"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Main draggable & scrollable container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        onScroll={checkScrollability}
        className={`w-full max-w-full overflow-x-auto no-scrollbar select-none touch-pan-x overscroll-x-contain cursor-grab active:cursor-grabbing scroll-smooth ${innerClassName}`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Right scroll affordance gradient & animated bouncing arrow */}
      {showFadeGradients && canScrollRight && (
        <>
          <div
            className={`absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-gradient-to-l ${fadeColorClass} to-transparent transition-opacity duration-300 opacity-95`}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const el = scrollRef.current;
              if (el) el.scrollBy({ left: 160, behavior: 'smooth' });
            }}
            className="absolute right-0.5 top-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500 text-white shadow-lg border-2 border-white flex items-center justify-center animate-bounce-horizontal hover:bg-amber-600 active:scale-90 transition-all cursor-pointer"
            title="Kéo hoặc bấm để xem thêm"
            aria-label="Kéo hoặc bấm để xem thêm"
          >
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-300 ring-1.5 ring-white animate-ping pointer-events-none" />
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </button>
        </>
      )}
    </div>
  );
};
