import { useEffect, useRef, useState } from "react";

export default function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // Fallback: assume visible
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      options
    );

    obs.observe(el);

    return () => obs.disconnect();
  }, [ref.current]);

  return [ref, inView];
}
