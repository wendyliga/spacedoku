import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../state/gameReducer';
import Icon from './Icon';
import PixelIcon from './PixelIcon';
import shardsUrl from '../assets/sprites/GlassShards.png';
import sparkleUrl from '../assets/sprites/sparkle-effect.png';
import gemUrl from '../assets/sprites/GemCounter.png';

interface Props {
  game: GameState;
  dispatch: Dispatch<GameAction>;
}

export default function Toolbar({ game, dispatch }: Props) {
  return (
    <div className="toolbar">
      <button
        className="tool"
        onClick={() => dispatch({ type: 'undo' })}
        disabled={game.history.length === 0}
        data-tip="Undo your last move"
      >
        <span className="tool-icon-box">
          <Icon name="rewind" className="tool-icon" />
        </span>
        <span className="tool-label">Rewind</span>
        <span className="tool-sub">undo</span>
      </button>
      <button
        className="tool"
        onClick={() => dispatch({ type: 'erase' })}
        data-tip="Clear the selected cell"
      >
        <span className="tool-icon-box">
          <PixelIcon src={shardsUrl} w={16} h={16} frames={3} frame={0} scale={2} />
        </span>
        <span className="tool-label">Vaporize</span>
        <span className="tool-sub">erase</span>
      </button>
      <button
        className={`tool ${game.notesMode ? 'tool-active' : ''}`}
        onClick={() => dispatch({ type: 'toggleNotes' })}
        data-tip="Notes mode: pencil in small candidate numbers"
      >
        <span className="tool-icon-box">
          <PixelIcon src={sparkleUrl} w={16} h={16} frames={8} frame={3} scale={2} />
        </span>
        <span className="tool-label">Scan {game.notesMode ? 'on' : 'off'}</span>
        <span className="tool-sub">notes</span>
      </button>
      <button
        className="tool tool-hint"
        onClick={() => dispatch({ type: 'hint' })}
        data-tip="Reveal the correct number for a cell"
      >
        <span className="tool-icon-box">
          <PixelIcon src={gemUrl} w={32} h={32} scale={1} />
        </span>
        <span className="tool-label">Telescope</span>
        <span className="tool-sub">hint</span>
      </button>
    </div>
  );
}
