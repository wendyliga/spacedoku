import type { CSSProperties } from 'react';

interface Props {
  /** Sprite URL; may be a horizontal strip, use `frame`/`frames` to crop one. */
  src: string;
  w: number;
  h: number;
  scale?: number;
  frame?: number;
  frames?: number;
  className?: string;
}

/** Static pixel-art icon, optionally cropped from a sprite strip. */
export default function PixelIcon({ src, w, h, scale = 2, frame = 0, frames = 1, className }: Props) {
  const style: CSSProperties = {
    width: w * scale,
    height: h * scale,
    backgroundImage: `url(${src})`,
    backgroundSize: `${frames * w * scale}px ${h * scale}px`,
    backgroundPosition: `${-frame * w * scale}px 0`,
  };
  return <span className={className ? `pixel-icon ${className}` : 'pixel-icon'} style={style} aria-hidden />;
}
