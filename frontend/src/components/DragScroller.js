import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Horizontal scroll container with mouse drag-to-scroll + native touch swipe
 * + optional auto-scroll that pauses on interaction and resumes after delay.
 *
 * Also exposes `data-user-scrolling="1"` attribute while user interacts
 * (drag/wheel/touch) for 1200ms after end — children can react via CSS.
 */
export default function DragScroller({
  children,
  className = '',
  style = {},
  autoScroll = false,
  autoScrollSpeed = 0.6,
  resumeDelay = 2500,
  loop = false,
  userScrollTimeout = 1200,
  ...rest
}) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const state = useRef({ startX: 0, scrollLeft: 0, moved: false });
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const pauseTimerRef = useRef(null);
  const hoveringRef = useRef(false);
  const userScrollTimerRef = useRef(null);

  const markUserScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('data-user-scrolling', '1');
    if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
    userScrollTimerRef.current = setTimeout(() => {
      if (ref.current) ref.current.removeAttribute('data-user-scrolling');
    }, userScrollTimeout);
  }, [userScrollTimeout]);

  const pauseAuto = useCallback(() => {
    pausedRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      if (!hoveringRef.current && !state.current.moved && !dragging) {
        pausedRef.current = false;
      }
    }, resumeDelay);
  }, [resumeDelay, dragging]);

  const onDown = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    state.current = { startX: clientX, scrollLeft: el.scrollLeft, moved: false };
    setDragging(true);
    pauseAuto();
    markUserScroll();
  }, [pauseAuto, markUserScroll]);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const el = ref.current;
    if (!el) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = clientX - state.current.startX;
    if (Math.abs(dx) > 4) state.current.moved = true;
    el.scrollLeft = state.current.scrollLeft - dx;
    markUserScroll();
    if (e.cancelable && !e.touches) e.preventDefault();
  }, [dragging, markUserScroll]);

  const onUp = useCallback(() => {
    setDragging(false);
    // After drag ends, re-arm the resume timer
    pauseAuto();
  }, [pauseAuto]);

  // Prevent click on child if user was dragging (after a real drag)
  const onClickCapture = useCallback((e) => {
    if (state.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      state.current.moved = false;
    }
  }, []);

  const onWheel = useCallback(() => {
    pauseAuto();
    markUserScroll();
  }, [pauseAuto, markUserScroll]);

  const onPointerEnter = useCallback(() => {
    hoveringRef.current = true;
    pausedRef.current = true;
  }, []);

  const onPointerLeave = useCallback(() => {
    hoveringRef.current = false;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      if (!hoveringRef.current && !dragging) pausedRef.current = false;
    }, resumeDelay);
  }, [resumeDelay, dragging]);

  // Auto-scroll RAF loop
  useEffect(() => {
    if (!autoScroll) return;
    let last = performance.now();
    const step = (now) => {
      const el = ref.current;
      if (!el) { rafRef.current = requestAnimationFrame(step); return; }
      const dt = Math.min(now - last, 64);
      last = now;
      if (!pausedRef.current && !dragging && !document.hidden) {
        // seamless loop: content is duplicated -> wrap at half
        if (loop) {
          const half = el.scrollWidth / 2;
          if (el.scrollLeft >= half) {
            el.scrollLeft = el.scrollLeft - half;
          }
        } else if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          el.scrollLeft = 0;
        }
        el.scrollLeft += autoScrollSpeed * (dt / 16.67);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoScroll, autoScrollSpeed, loop, dragging]);

  return (
    <div
      ref={ref}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={() => { onUp(); onPointerLeave(); }}
      onMouseEnter={onPointerEnter}
      onTouchStart={onPointerEnter}
      onTouchEnd={onPointerLeave}
      onWheel={onWheel}
      onClickCapture={onClickCapture}
      className={`drag-scroller ${dragging ? 'is-dragging' : ''} ${className}`}
      style={{
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollBehavior: 'auto',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: dragging ? 'none' : 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
