import { useEffect, useState } from 'react';

const read = () => ({ width: window.innerWidth, height: window.innerHeight });

export function useWallSize(): { width: number; height: number } {
  const [size, setSize] = useState(read);
  useEffect(() => {
    const on = () => setSize(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}
