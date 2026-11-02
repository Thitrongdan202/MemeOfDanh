import gsap from 'gsap';

/** Check if animations should run */
export function shouldAnimate(level: 'full' | 'reduced' | 'off' = 'full'): boolean {
  if (level === 'off') return false;
  if (typeof window === 'undefined') return false;
  return true;
}

/** Stagger reveal for gallery cards */
export function animateGalleryEnter(
  cards: Element[],
  { delay = 0, level = 'full' }: { delay?: number; level?: 'full' | 'reduced' | 'off' } = {}
) {
  if (!shouldAnimate(level) || cards.length === 0) {
    gsap.set(cards, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    cards,
    { opacity: 0, y: level === 'reduced' ? 8 : 24, scale: level === 'full' ? 0.97 : 1 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: level === 'full' ? 0.5 : 0.25,
      stagger: level === 'full' ? 0.04 : 0.02,
      ease: 'power3.out',
      delay,
      clearProps: 'transform',
    }
  );
}

/** Card hover scale micro-interaction */
export function animateCardHover(el: Element, entering: boolean) {
  gsap.to(el, {
    scale: entering ? 1.025 : 1,
    duration: entering ? 0.3 : 0.2,
    ease: entering ? 'power2.out' : 'power2.in',
  });
}

/** Lightbox open animation */
export function animateLightboxOpen(
  overlay: Element,
  content: Element,
  level: 'full' | 'reduced' | 'off' = 'full'
) {
  if (!shouldAnimate(level)) {
    gsap.set([overlay, content], { opacity: 1, scale: 1, y: 0 });
    return;
  }
  const tl = gsap.timeline();
  tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    .fromTo(
      content,
      { opacity: 0, scale: level === 'full' ? 0.93 : 0.98, y: level === 'full' ? 24 : 8 },
      { opacity: 1, scale: 1, y: 0, duration: level === 'full' ? 0.4 : 0.2, ease: 'power3.out' },
      '-=0.1'
    );
  return tl;
}

/** Lightbox close animation */
export function animateLightboxClose(
  overlay: Element,
  content: Element,
  onComplete: () => void,
  level: 'full' | 'reduced' | 'off' = 'full'
) {
  if (!shouldAnimate(level)) {
    onComplete();
    return;
  }
  const tl = gsap.timeline({ onComplete });
  tl.to(content, {
    opacity: 0,
    scale: level === 'full' ? 0.95 : 1,
    y: level === 'full' ? 16 : 0,
    duration: 0.2,
    ease: 'power2.in',
  }).to(overlay, { opacity: 0, duration: 0.15, ease: 'power2.in' }, '-=0.05');
  return tl;
}

/** Sidebar nav item indicator slide */
export function animateSidebarIndicator(indicator: Element, target: Element) {
  const targetRect = target.getBoundingClientRect();
  const parentRect = indicator.parentElement?.getBoundingClientRect();
  if (!parentRect) return;
  gsap.to(indicator, {
    y: targetRect.top - parentRect.top,
    height: targetRect.height,
    duration: 0.35,
    ease: 'power3.out',
  });
}

/** Filter change: fade + scale */
export function animateFilterChange(container: Element, level: 'full' | 'reduced' | 'off' = 'full') {
  if (!shouldAnimate(level)) return;
  gsap.fromTo(
    container,
    { opacity: 0.6 },
    { opacity: 1, duration: 0.2, ease: 'power2.out' }
  );
}

/** Page transition in */
export function animatePageEnter(el: Element, level: 'full' | 'reduced' | 'off' = 'full') {
  if (!shouldAnimate(level)) { gsap.set(el, { opacity: 1 }); return; }
  gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
}

/** Favorite heart pulse */
export function animateFavoritePulse(el: Element) {
  gsap.timeline()
    .to(el, { scale: 1.4, duration: 0.15, ease: 'power2.out' })
    .to(el, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' });
}

/** Button press micro-interaction */
export function animateButtonPress(el: Element) {
  gsap.timeline()
    .to(el, { scale: 0.94, duration: 0.08, ease: 'power2.in' })
    .to(el, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.5)' });
}

/** Toast slide in */
export function animateToastIn(el: Element) {
  gsap.fromTo(el, { opacity: 0, x: 16, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'power3.out' });
}

export function animateToastOut(el: Element, onComplete: () => void) {
  gsap.to(el, { opacity: 0, x: 16, duration: 0.2, ease: 'power2.in', onComplete });
}
