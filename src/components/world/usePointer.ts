import { useEffect, useRef } from 'react';

export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.current.x = event.clientX / window.innerWidth * 2 - 1;
      pointer.current.y = 1 - event.clientY / window.innerHeight * 2;
    };
    const reset = () => { pointer.current.x = 0; pointer.current.y = 0; };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', reset);
    document.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', reset);
      document.removeEventListener('mouseleave', reset);
    };
  }, []);
  return pointer;
}
