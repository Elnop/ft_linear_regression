import { AnimatePresence, motion } from 'motion/react';
import { formatNumber } from './format.ts';

export type PriceMarkerProps = {
  // Wall pixels of the predicted point, or null to hide the marker.
  at: { x: number; y: number } | null;
  price: number | null;
  axisY?: number; // bottom of the chart: draws a dotted drop line to it
  width: number; // wall width, to keep the sticker on screen
};

const STICKER_W = 206;
const STICKER_H = 112;

// "HELLO MON PRIX EST" name tag pointing at the predicted price on the line.
export function PriceMarker({ at, price, axisY, width }: PriceMarkerProps) {
  const visible = at !== null && price !== null && Number.isFinite(at.x) && Number.isFinite(at.y);
  const scale = width < 600 ? 0.72 : 1;
  const w = STICKER_W * scale;
  const flip = visible && at.x + 26 + w > width - 8;
  const left = visible ? Math.max(8, Math.min(width - w - 8, flip ? at.x - 26 - w : at.x + 26)) : 0;
  const top = visible ? Math.max(8, at.y - STICKER_H * scale - 10) : 0;
  return (
    <div className="wu-marker" aria-hidden="true">
      {visible && axisY !== undefined && axisY > at.y && (
        <svg width={width} height={axisY + 4} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={at.x} y1={at.y} x2={at.x} y2={axisY} stroke="var(--acid)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" opacity="0.8" />
        </svg>
      )}
      {visible && (
        <>
          <div
            style={{
              position: 'absolute',
              left: at.x - 18,
              top: at.y - 18,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(230,255,0,0.5) 0%, transparent 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: at.x - 8,
              top: at.y - 8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'var(--acid)',
              boxShadow: '0 0 0 3px rgba(0,0,0,0.55)',
            }}
          />
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
