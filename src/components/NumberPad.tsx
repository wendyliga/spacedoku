import type { Dispatch } from 'react';
import { SIZE_CONFIGS } from '../core/types';
import type { GameAction, GameState } from '../state/gameReducer';

interface Props {
  game: GameState;
  dispatch: Dispatch<GameAction>;
}

export default function NumberPad({ game, dispatch }: Props) {
  const size = SIZE_CONFIGS[game.puzzle.sizeKey].size;

  // How many of each digit remain to be placed (correctly-filled count vs size).
  const placed = new Array(size + 1).fill(0);
  game.cells.forEach((v, i) => {
    if (v !== 0 && v === game.puzzle.solution[i]) placed[v]++;
  });

  return (
    <div className="numpad" style={{ ['--size' as string]: size }}>
      {Array.from({ length: size }, (_, i) => {
        const v = i + 1;
        const done = placed[v] >= size;
        return (
          <button
            key={v}
            className={`numpad-key ${done ? 'numpad-done' : ''}`}
            disabled={done}
            onClick={() => dispatch({ type: 'input', value: v })}
          >
            <span className="numpad-digit">{v}</span>
            <span className="numpad-left">{done ? '✓' : size - placed[v]}</span>
          </button>
        );
      })}
    </div>
  );
}
