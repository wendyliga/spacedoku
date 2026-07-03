import type { CSSProperties } from 'react';

interface Props {
  /** Sprite sheet URL (horizontal strip of equal-size frames). */
  sheet: string;
  frames: number;
  frameW: number;
  frameH: number;
  /** Integer upscale factor to keep pixels crisp. */
  scale?: number;
  fps?: number;
  className?: string;
}

/** Animates a horizontal sprite strip with a CSS steps() animation. */
export default function PixelSprite({ sheet, frames, frameW, frameH, scale = 3, fps = 8, className }: Props) {
  const style: CSSProperties = {
    width: frameW * scale,
    height: frameH * scale,
    backgroundImage: `url(${sheet})`,
    backgroundSize: `${frames * frameW * scale}px ${frameH * scale}px`,
    animationDuration: `${frames / fps}s`,
    animationTimingFunction: `steps(${frames})`,
    ['--sprite-travel' as string]: `${-frames * frameW * scale}px`,
  };
  return <span className={className ? `sprite ${className}` : 'sprite'} style={style} aria-hidden />;
}
