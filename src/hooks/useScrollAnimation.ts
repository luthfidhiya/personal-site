import { useEffect, useRef, useState } from "react";

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollAnimation = <T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: options.threshold, rootMargin: options.rootMargin });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible] as const;
};
