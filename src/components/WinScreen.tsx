import { useMemo } from 'react';
import type { GameState } from '../state/gameReducer';
import { formatTime } from './Hud';
import Icon from './Icon';
import PixelIcon from './PixelIcon';
import PixelSprite from './PixelSprite';
import astronautJumpUrl from '../assets/sprites/Astronaut_Jump.png';
import sparkleUrl from '../assets/sprites/sparkle-effect.png';
import asteroidUrl from '../assets/bg/asteroid-2.png';
import diamondUrl from '../assets/sprites/Diamond.png';

interface Props {
  game: GameState;
  onPlayAgain: () => void;
}

// Stardust palette: glowing motes instead of paper confetti.
const STARDUST_COLORS = ['#5ef2f0', '#a06bff', '#ff6ec7', '#ffd76e', '#ffffff', '#7ea8ff'];

export default function WinScreen({ game, onPlayAgain }: Props) {
  // Random stardust layout, computed once per win.
  const stardust = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2.5,
        color: STARDUST_COLORS[i % STARDUST_COLORS.length],
        spin: Math.random() < 0.5 ? 1 : -1,
        size: 3 + Math.random() * 6,
      })),
    [],
  );

  return (
    <div className="modal-backdrop win-backdrop">
      <div className="confetti-layer" aria-hidden>
        {stardust.map((c, i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              background: c.color,
              color: c.color,
              width: c.size,
              height: c.size,
              ['--spin' as string]: c.spin,
            }}
          />
        ))}
      </div>
      <div className="modal win-modal">
        <div className="win-scene">
          <PixelSprite sheet={sparkleUrl} frames={8} frameW={16} frameH={16} scale={2} fps={10} />
          <PixelSprite sheet={astronautJumpUrl} frames={5} frameW={24} frameH={24} scale={3} fps={8} />
          <PixelSprite sheet={sparkleUrl} frames={8} frameW={16} frameH={16} scale={2} fps={12} />
        </div>
        <h2 className="win-title">Mission complete</h2>
        <p className="win-sub">Sector cleared — the galaxy salutes you, captain.</p>
        <div className="win-stats">
          <div className="win-stat">
            <span className="win-stat-value">
              <Icon name="clock" size={16} />
              {formatTime(game.elapsedSeconds)}
            </span>
            <span className="win-stat-label">mission time</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-value">
              <PixelIcon src={asteroidUrl} w={21} h={17} scale={1} />
              {game.mistakes}
            </span>
            <span className="win-stat-label">asteroid hits</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-value">
              <PixelIcon src={diamondUrl} w={16} h={16} scale={1} />
              {game.hintsUsed}
            </span>
            <span className="win-stat-label">assists</span>
          </div>
        </div>
        <button className="btn btn-play" onClick={onPlayAgain}>
          Next mission
        </button>
      </div>
    </div>
  );
}
