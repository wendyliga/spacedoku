import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../state/gameReducer';

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
      >
        <span className="tool-icon">↩️</span>
        <span className="tool-label">Undo</span>
      </button>
      <button className="tool" onClick={() => dispatch({ type: 'erase' })}>
        <span className="tool-icon">🧽</span>
        <span className="tool-label">Erase</span>
      </button>
      <button
        className={`tool ${game.notesMode ? 'tool-active' : ''}`}
        onClick={() => dispatch({ type: 'toggleNotes' })}
      >
        <span className="tool-icon">✏️</span>
        <span className="tool-label">Notes {game.notesMode ? 'on' : 'off'}</span>
      </button>
      <button className="tool tool-hint" onClick={() => dispatch({ type: 'hint' })}>
        <span className="tool-icon">💡</span>
        <span className="tool-label">Hint</span>
      </button>
    </div>
  );
}
