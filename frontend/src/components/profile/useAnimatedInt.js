import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function useAnimatedInt(target, duration = 0.85) {
  const [display, setDisplay] = useState(() => Math.round(Number(target) || 0));
  const prev = useRef(display);

  useEffect(() => {
    const t = Math.round(Number(target) || 0);
    const from = prev.current;
    prev.current = t;
    const c = animate(from, t, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (l) => setDisplay(Math.round(l)),
    });
    return () => c.stop();
  }, [target, duration]);

  return display;
}

export function useAnimatedScalar(target, duration = 0.85) {
  const t0 = Number(target);
  const [display, setDisplay] = useState(() => (Number.isFinite(t0) ? t0 : 0));
  const prev = useRef(display);

  useEffect(() => {
    const t = Number(target);
    const end = Number.isFinite(t) ? t : 0;
    const from = prev.current;
    prev.current = end;
    const c = animate(from, end, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
    });
    return () => c.stop();
  }, [target, duration]);

  return display;
}
