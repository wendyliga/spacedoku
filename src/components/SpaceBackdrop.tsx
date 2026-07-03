import { useMemo } from 'react';
import nebulaUrl from '../assets/bg/blue-with-stars.png';
import planetBigUrl from '../assets/bg/prop-planet-big.png';
import planetSmallUrl from '../assets/bg/prop-planet-small.png';
import asteroid1Url from '../assets/bg/asteroid-1.png';
import asteroid2Url from '../assets/bg/asteroid-2.png';

// Fixed background: pixel-art nebula, drifting planets and asteroids,
// plus twinkling stars and the occasional shooting star.
export default function SpaceBackdrop() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.2,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="backdrop" aria-hidden>
      <div className="nebula" style={{ backgroundImage: `url(${nebulaUrl})` }} />
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
      <img className="pixel drift-planet-big" src={planetBigUrl} alt="" />
      <img className="pixel drift-planet-small" src={planetSmallUrl} alt="" />
      <img className="pixel drift-asteroid-1" src={asteroid1Url} alt="" />
      <img className="pixel drift-asteroid-2" src={asteroid2Url} alt="" />
      <span className="shooting-star" />
      <span className="shooting-star" />
    </div>
  );
}
