import { useMemo } from 'react';
import type { GameState } from '../state/gameReducer';
import { formatTime } from './Hud';

interface Props {
  game: GameState;
  onPlayAgain: () => void;
}

const CONFETTI_COLORS = ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#7c5cff', '#ff9f1c'];

export default function WinScreen({ game, onPlayAgain }: Props) {
  // Random confetti layout, computed once per win.
  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        spin: Math.random() < 0.5 ? 1 : -1,
        size: 6 + Math.random() * 8,
      })),
    [],
  );

  return (
    <div className="modal-backdrop win-backdrop">
      <div className="confetti-layer" aria-hidden>
        {confetti.map((c, i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              background: c.color,
              width: c.size,
              height: c.size * 0.6,
              ['--spin' as string]: c.spin,
            }}
          />
        ))}
      </div>
      <div className="modal win-modal">
        <h2 className="win-title">You did it! 🎉</h2>
        <p className="win-sub">Puzzle solved — take a bow!</p>
        <div className="win-stats">
          <div className="win-stat">
            <span className="win-stat-value">⏱ {formatTime(game.elapsedSeconds)}</span>
            <span className="win-stat-label">time</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-value">❌ {game.mistakes}</span>
            <span className="win-stat-label">mistakes</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-value">💡 {game.hintsUsed}</span>
            <span className="win-stat-label">hints</span>
          </div>
        </div>
        <button className="btn btn-play" onClick={onPlayAgain}>
          Play again
        </button>
      </div>
    </div>
  );
}
