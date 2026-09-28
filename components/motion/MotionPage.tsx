'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useMotionPreference } from './MotionProvider';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const selectors = {
  heroLine: '[data-hero-line]',
  heroReveal: '[data-hero-reveal]',
  reveal: '[data-reveal]',
  line: '[data-line]',
  parallax: '[data-parallax]',
  magnetic: '[data-magnetic]',
  progress: '[data-motion-progress]',
} as const;

type MotionKind = keyof typeof selectors;

const interactiveSelector = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"]';

function isActive(element: HTMLElement) {
  if (!element.isConnected || element.closest('[hidden], [inert]')) return false;

  // A closed details still exposes its first summary, but not its other children.
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement && !parent.open) {
      const summary = parent.querySelector(':scope > summary');
      if (!summary?.contains(element)) return false;
    }
  }

  const style = getComputedStyle(element);
  return element.getClientRects().length > 0 && style.visibility !== 'hidden' && style.visibility !== 'collapse';
}

function hasInteraction(element: HTMLElement) {
  return Boolean(element.closest(interactiveSelector) || element.querySelector(interactiveSelector));
}

function canIntroduceHero() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  // History/reload restoration can happen after hydration, even if scrollY is still zero.
  return window.scrollY <= 24 && !window.location.hash && (!navigation || navigation.type === 'navigate');
}

function addMagneticMotion(element: HTMLElement) {
  const baseX = Number(gsap.getProperty(element, 'x')) || 0;
  const baseY = Number(gsap.getProperty(element, 'y')) || 0;
  // Reuse two paused tweens rather than allocating one on every pointer event.
  const xTo = gsap.quickTo(element, 'x', { duration: 0.2, ease: 'power2.out' });
  const yTo = gsap.quickTo(element, 'y', { duration: 0.2, ease: 'power2.out' });
  const reset = () => {
    xTo(baseX);
    yTo(baseY);
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.buttons || element.matches(':focus-visible, :disabled, [aria-disabled="true"]')) {
      reset();
      return;
    }

    const bounds = element.getBoundingClientRect();
    // Subtract the current displacement so the moving hit box cannot feed back into itself.
    const dx = Number(gsap.getProperty(element, 'x')) - baseX;
    const dy = Number(gsap.getProperty(element, 'y')) - baseY;
    const x = (event.clientX - (bounds.left + bounds.width / 2 - dx)) / Math.max(bounds.width / 2, 1);
    const y = (event.clientY - (bounds.top + bounds.height / 2 - dy)) / Math.max(bounds.height / 2, 1);
    const distance = 6 / Math.max(1, Math.hypot(x, y));
    xTo(baseX + x * distance);
    yTo(baseY + y * distance);
  };
  const resetEvents = ['pointerleave', 'pointercancel', 'pointerdown', 'focus', 'blur'] as const;

  element.addEventListener('pointermove', move);
  resetEvents.forEach((event) => element.addEventListener(event, reset));
  return () => {
    element.removeEventListener('pointermove', move);
    resetEvents.forEach((event) => element.removeEventListener(event, reset));
    xTo.tween.kill();
    yTo.tween.kill();
  };
}

export function MotionPage({ children, ...props }: ComponentPropsWithoutRef<'div'>) {
  const root = useRef<HTMLDivElement>(null);
  const introHandled = useRef(false);
  const revealed = useRef(new WeakSet<HTMLElement>());
  const drawnLines = useRef(new WeakSet<HTMLElement>());
  const { enabled, paused } = useMotionPreference();

  useGSAP(() => {
    const page = root.current;
    if (!page) return;
    if (!enabled) {
      // Do not mistake the conservative SSR snapshot for an actual preference change.
      if (paused || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        introHandled.current = true;
      }
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const createScene = () => {
      const finePointer = pointerQuery.matches;
      const records = new Map<MotionKind, Map<HTMLElement, gsap.Context>>();
      const kinds = Object.keys(selectors) as MotionKind[];
      kinds.forEach((kind) => records.set(kind, new Map()));
      let disposed = false;
      let frame = 0;
      let bootFrame = 0;
      let firstScan = true;
      let lastWidth = -1;
      let lastHeight = -1;

      const createMotion = (element: HTMLElement, kind: MotionKind, index: number, introduceHero: boolean) => {
        const bounds = element.getBoundingClientRect();
        const inViewport = bounds.bottom > 0 && bounds.top < window.innerHeight;
        const preserveTransform = element.matches(`${selectors.magnetic}, ${selectors.parallax}, ${selectors.line}, ${selectors.progress}`);
        const seen = kind === 'line' ? drawnLines.current : revealed.current;

        if (kind === 'heroLine' || kind === 'heroReveal') {
          if (!introduceHero || !inViewport || (kind === 'heroLine' && hasInteraction(element))) return;
        } else if (kind === 'reveal' || kind === 'line') {
          if (kind === 'line' && (hasInteraction(element) || element.matches(selectors.progress))) return;
          if (seen.has(element) || element.matches(`${selectors.heroLine}, ${selectors.heroReveal}`)) return;
          if (bounds.bottom <= 0) {
            seen.add(element);
            return;
          }
        } else if (kind === 'parallax' && hasInteraction(element)) {
          return;
        } else if (kind === 'magnetic' && (!finePointer || !element.matches('button, a[href], [role="button"]'))) {
          return;
        }

        // Each dynamic target owns a context; removed/hidden targets can be reverted
        // without rebuilding other animations or retaining detached cards in a parent context.
        return gsap.context(() => {
          if (kind === 'magnetic') return addMagneticMotion(element);

          if (kind === 'heroLine') {
            gsap.fromTo(element, { yPercent: 100 }, {
              yPercent: 0,
              duration: 0.85,
              delay: Math.min(index, 6) * 0.08,
              ease: 'power3.out',
              clearProps: 'transform',
            });
          } else if (kind === 'heroReveal') {
            gsap.fromTo(element, { opacity: 0.55, ...(preserveTransform ? {} : { y: 12 }) }, {
              opacity: 1,
              ...(preserveTransform ? {} : { y: 0 }),
              duration: 0.65,
              delay: 0.12 + Math.min(index, 8) * 0.07,
              ease: 'power2.out',
              clearProps: preserveTransform ? 'opacity' : 'opacity,transform',
            });
          } else if (kind === 'reveal' || kind === 'line') {
            const isLine = kind === 'line';
            gsap.fromTo(element,
              isLine ? { scaleX: 0.08, transformOrigin: 'left center' } : { opacity: 0.55, ...(preserveTransform ? {} : { y: 16 }) },
              {
                ...(isLine ? { scaleX: 1 } : { opacity: 1, ...(preserveTransform ? {} : { y: 0 }) }),
                duration: isLine ? 0.8 : 0.65,
                ease: 'power2.out',
                immediateRender: false,
                clearProps: isLine ? 'transform,transformOrigin' : preserveTransform ? 'opacity' : 'opacity,transform',
                onStart: () => { seen.add(element); },
                scrollTrigger: {
                  trigger: element,
                  start: 'top 90%',
                  once: true,
                  toggleActions: 'play none none none',
                },
              },
            );
          } else if (kind === 'parallax') {
            gsap.fromTo(element, { y: -12 }, {
              y: 12,
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.4,
                invalidateOnRefresh: true,
              },
            });
          } else if (kind === 'progress') {
            gsap.fromTo(element, { scaleX: 0, transformOrigin: 'left center' }, {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                start: 0,
                end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          }
        }, page);
      };

      const reconcile = () => {
        frame = 0;
        if (disposed) return;
        const introduceHero = firstScan && !introHandled.current && canIntroduceHero();
        if (firstScan) introHandled.current = true;
        firstScan = false;

        for (const kind of kinds) {
          const targets = records.get(kind)!;
          for (const [element, context] of targets) {
            if (!page.contains(element) || !element.matches(selectors[kind]) || !isActive(element)) {
              context.revert();
              targets.delete(element);
            }
          }
          const elements = Array.from(page.querySelectorAll<HTMLElement>(selectors[kind])).filter(isActive);
          elements.forEach((element, index) => {
            if (targets.has(element)) return;
            const context = createMotion(element, kind, index, introduceHero);
            if (context) targets.set(element, context);
          });
        }

        ScrollTrigger.refresh();
      };
      const schedule = () => {
        if (!disposed && !frame && !bootFrame) frame = requestAnimationFrame(reconcile);
      };

      // One refresh per frame, only for actual box-size changes. Transforms and
      // opacity do not resize the observed box, so refresh cannot feed an observer loop.
      const resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;
        schedule();
      });
      resizeObserver.observe(page);

      const mutationObserver = new MutationObserver((mutations) => {
        if (mutations.some((mutation) => {
          const target = mutation.target instanceof HTMLElement ? mutation.target : mutation.target.parentElement;
          // Test the parent for attribute changes so hiding/closing an active target still cleans it up.
          const visibleTarget = mutation.type === 'attributes' ? target?.parentElement : target;
          return visibleTarget && isActive(visibleTarget);
        })) schedule();
      });
      mutationObserver.observe(page, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        // Exclude style: GSAP writes it every frame. Hidden/class/open changes
        // and the ResizeObserver cover panel switches and expanding details.
        attributeFilter: ['hidden', 'inert', 'open', 'class', 'data-hero-line', 'data-hero-reveal', 'data-reveal', 'data-line', 'data-parallax', 'data-magnetic', 'data-motion-progress'],
      });

      // Allow hydration and native scroll restoration to settle before the first scan.
      // Cancelled Strict Mode setups do not consume the one-shot intro.
      bootFrame = requestAnimationFrame(() => {
        bootFrame = 0;
        schedule();
      });

      return () => {
        disposed = true;
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        cancelAnimationFrame(bootFrame);
        cancelAnimationFrame(frame);
        for (const targets of records.values()) {
          for (const context of targets.values()) context.revert();
          targets.clear();
        }
        records.clear();
      };
    };

    // GSAP 3.15 reverts media contexts but retains their native query listeners.
    // Own the subscriptions and use an unconditional GSAP media context so both
    // the scene and its listeners can be fully released on every toggle/unmount.
    let media: gsap.MatchMedia | undefined;
    const syncMedia = () => {
      media?.revert();
      media = undefined;
      if (!motionQuery.matches) {
        introHandled.current = true;
        return;
      }
      media = gsap.matchMedia(page);
      media.add({ all: true }, createScene);
    };
    motionQuery.addEventListener('change', syncMedia);
    pointerQuery.addEventListener('change', syncMedia);
    syncMedia();

    return () => {
      motionQuery.removeEventListener('change', syncMedia);
      pointerQuery.removeEventListener('change', syncMedia);
      media?.revert();
    };
  }, { scope: root, dependencies: [enabled, paused], revertOnUpdate: true });

  return <div {...props} ref={root} data-motion-page="">{children}</div>;
}
