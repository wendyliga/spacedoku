import type { GameState } from '../state/gameReducer';
import Icon from './Icon';
import PixelIcon from './PixelIcon';
import planetUrl from '../assets/bg/prop-planet-small.png';
import helmetUrl from '../assets/sprites/LivesCounter.png';
import asteroidUrl from '../assets/bg/asteroid-2.png';
import diamondUrl from '../assets/sprites/Diamond.png';

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
      <button className="icon-btn" onClick={onQuit} aria-label="Back to menu" data-tip="Save and return to the main menu">
        <PixelIcon src={planetUrl} w={16} h={16} scale={2} />
        <span className="icon-btn-label">Menu</span>
      </button>
      <div className="hud-stats">
        <span className="hud-stat" data-tip="Mission rank (difficulty)">
          {game.puzzle.difficulty}
        </span>
        <span className="hud-stat" data-tip="Mission clock: time played">
          <Icon name="clock" size={16} />
          {formatTime(game.elapsedSeconds)}
        </span>
        <span className="hud-stat" data-tip="Asteroid hits: wrong numbers placed">
          <PixelIcon src={asteroidUrl} w={21} h={17} scale={1} />
          {game.mistakes}
        </span>
        <span className="hud-stat" data-tip="Assists: hints used">
          <PixelIcon src={diamondUrl} w={16} h={16} scale={1} />
          {game.hintsUsed}
        </span>
      </div>
      <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings" data-tip="Sound and gameplay settings">
        <PixelIcon src={helmetUrl} w={32} h={32} scale={1} />
        <span className="icon-btn-label">Settings</span>
      </button>
    </div>
  );
}
