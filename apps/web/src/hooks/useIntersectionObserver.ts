import { useEffect, useRef } from 'react';

type Options = {
  onIntersect: () => void;
  /** When false the observer is not attached at all, so no callback can fire. */
  enabled: boolean;
  rootMargin?: string;
};

/**
 * Returns a ref to attach to the sentinel element. The observer is disconnected
 * on unmount and whenever it is disabled, which is what keeps a fast scroll from
 * firing a burst of page requests.
 */
export function useIntersectionObserver<T extends Element>({
  onIntersect,
  enabled,
  rootMargin,
}: Options) {
  const targetRef = useRef<T | null>(null);
  const callbackRef = useRef(onIntersect);

  // Keep the latest callback without re-creating the observer on every render.
  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || target === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          callbackRef.current();
        }
      },
      rootMargin === undefined ? undefined : { rootMargin },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return targetRef;
}
