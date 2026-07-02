import type { GameState } from '../state/gameReducer';

interface Props {
  game: GameState;
  onQuit: () => void;
  onOpenSettings: () => void;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Hud({ game, onQuit, onOpenSettings }: Props) {
  return (
    <div className="hud">
      <button className="icon-btn" onClick={onQuit} aria-label="Back to menu">
        🏠
      </button>
      <div className="hud-stats">
        <span className="hud-stat" title="Difficulty">
          {game.puzzle.difficulty}
        </span>
        <span className="hud-stat" title="Time">
          ⏱ {formatTime(game.elapsedSeconds)}
        </span>
        <span className="hud-stat" title="Mistakes">
          ❌ {game.mistakes}
        </span>
        <span className="hud-stat" title="Hints used">
          💡 {game.hintsUsed}
        </span>
      </div>
      <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
        ⚙️
      </button>
    </div>
  );
}
