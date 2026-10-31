import { AnimatePresence, motion } from 'motion/react';
import { formatNumber } from '@/features/dashboard/shared/lib/format.ts';
import type { Vec2 } from '@/shared/lib/geometry.ts';
import { SMALL } from '@/features/dashboard/shared/lib/layout.ts';
import '@/features/dashboard/wall-marker/wall-marker.css';

type WallMarkerProps = {
  at: Vec2 | null;
  price: number | null;
  axisY: number;
  width: number;
};

const STICKER_WIDTH = 206;
const STICKER_HEIGHT = 112;

export function WallMarker({ at, price, axisY, width }: WallMarkerProps) {
  const visible = at !== null && price !== null && Number.isFinite(at.x) && Number.isFinite(at.y);
  const scale = width < SMALL ? 0.72 : 1;
  const stickerWidth = STICKER_WIDTH * scale;
  const flip = visible && at.x + 26 + stickerWidth > width - 8;
  const left = visible ? Math.max(8, Math.min(width - stickerWidth - 8, flip ? at.x - 26 - stickerWidth : at.x + 26)) : 0;
  const top = visible ? Math.max(8, at.y - STICKER_HEIGHT * scale - 10) : 0;
  return (
    <div className="wall-marker" aria-hidden="true">
      {visible && (
        <>
          {axisY > at.y && (
            <svg className="price-guide" width={width} height={axisY + 4}>
              <line x1={at.x} y1={at.y} x2={at.x} y2={axisY} stroke="var(--acid)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" opacity="0.8" />
            </svg>
          )}
          <div className="price-halo" style={{ left: at.x, top: at.y }} />
          <div className="price-dot" style={{ left: at.x, top: at.y }} />
        </>
      )}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="hello"
            className="hello"
            initial={{ opacity: 0, scale: 0.8 * scale, rotate: flip ? 8 : -12 }}
            animate={{ opacity: 1, scale, rotate: flip ? 4 : -5, left, top }}
            exit={{ opacity: 0, scale: 0.9 * scale }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{ left, top, transformOrigin: 'top left' }}
          >
            <div className="hello-top">
              <b>HELLO</b>
              <span>MON PRIX EST</span>
            </div>
            <div className="hello-price">
              <span>{formatNumber(price)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
