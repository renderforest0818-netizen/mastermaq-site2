import { useRef, useEffect, useState } from 'react';

/**
 * Brand logo item. Remains grayscale by default.
 * Becomes colored when:
 *  - CSS :hover
 *  - In-viewport AND parent scroller has data-user-scrolling="1" (manual scroll)
 */
export default function BrandLogoItem({ src, alt }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);

  // Track viewport intersection inside the parent scroller
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.closest('.drag-scroller');
    const opts = {
      root: parent || null,
      rootMargin: '0px -10% 0px -10%',
      threshold: 0.55,
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setInView(entry.isIntersecting));
    }, opts);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Mirror parent's data-user-scrolling attribute into local state via MutationObserver
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.closest('.drag-scroller');
    if (!parent) return;
    const update = () => setUserScrolling(parent.getAttribute('data-user-scrolling') === '1');
    update();
    const mo = new MutationObserver(update);
    mo.observe(parent, { attributes: true, attributeFilter: ['data-user-scrolling'] });
    return () => mo.disconnect();
  }, []);

  const active = inView && userScrolling;

  return (
    <div
      ref={ref}
      className={`brand-logo-item mx-5 sm:mx-8 flex items-center justify-center w-[120px] sm:w-[140px] h-[56px] flex-shrink-0 transition-all duration-500 cursor-grab hover:grayscale-0 hover:opacity-100 ${active ? 'brand-logo-active' : 'grayscale opacity-40'}`}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[46px] max-w-[110px] object-contain pointer-events-none select-none"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}
