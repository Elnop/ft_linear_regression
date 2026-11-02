import { AnimatePresence, motion } from 'motion/react';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';
import '@/features/dashboard/features/prediction/styles/wall-marker.css';

type WallMarkerProps = {
  at: Vec2 | null;
  price: number | null;
  axisY: number;
  width: number;
  height: number;
  rem: number;
};

const STICKER_WIDTH_REM = 12.875;
const STICKER_HEIGHT_REM = 7;
const OFFSET_X_REM = 1.625;
const MARGIN_REM = 0.5;
const OFFSET_Y_REM = 0.625;

export function WallMarker({ at, price, axisY, width, height, rem }: WallMarkerProps) {
  const visible = at !== null && price !== null && at.x >= 0 && at.x <= width && at.y >= 0 && at.y <= height;
  const stickerWidth = STICKER_WIDTH_REM * rem;
  const stickerHeight = STICKER_HEIGHT_REM * rem;
  const offsetX = OFFSET_X_REM * rem;
  const margin = MARGIN_REM * rem;
  const flip = visible && at.x + offsetX + stickerWidth > width - margin;
  const left = visible ? Math.max(margin, Math.min(width - stickerWidth - margin, flip ? at.x - offsetX - stickerWidth : at.x + offsetX)) : 0;
  const top = visible ? Math.max(margin, Math.min(height - stickerHeight - margin, at.y - stickerHeight - OFFSET_Y_REM * rem)) : 0;
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
            className="price-sticker"
            initial={{ opacity: 0, scale: 0.8, rotate: flip ? 8 : -12 }}
            animate={{ opacity: 1, scale: 1, rotate: flip ? 4 : -5, left, top }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{ left, top, width: `${STICKER_WIDTH_REM}rem`, transformOrigin: 'top left' }}
          >
            <div className="price-sticker-top">
              <b>HELLO</b>
              <span>MON PRIX EST</span>
            </div>
            <div className="price-sticker-price">
              <span>{formatNumber(price)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
