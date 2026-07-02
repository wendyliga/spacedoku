import { memo, type Dispatch } from 'react';
import { SIZE_CONFIGS } from '../core/types';
import { isCellValid } from '../core/sudoku';
import type { GameAction, GameState } from '../state/gameReducer';

interface Props {
  game: GameState;
  dispatch: Dispatch<GameAction>;
  showErrors: boolean;
}

export default memo(function Board({ game, dispatch, showErrors }: Props) {
  const cfg = SIZE_CONFIGS[game.puzzle.sizeKey];
  const { size } = cfg;
  const sel = game.selected;
  const selRow = sel >= 0 ? Math.floor(sel / size) : -1;
  const selCol = sel >= 0 ? sel % size : -1;
  const selValue = sel >= 0 ? game.cells[sel] : 0;
  const hinted = new Set(game.hintedCells);

  return (
    <div
      className="board"
      style={{ ['--size' as string]: size }}
      role="grid"
      aria-label={`${size} by ${size} sudoku board`}
    >
      {game.cells.map((value, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        const given = game.puzzle.givens[i] !== 0;
        const sameBoxAsSel =
          sel >= 0 &&
          Math.floor(r / cfg.boxH) === Math.floor(selRow / cfg.boxH) &&
          Math.floor(c / cfg.boxW) === Math.floor(selCol / cfg.boxW);
        const related = sel >= 0 && i !== sel && (r === selRow || c === selCol || sameBoxAsSel);
        const sameValue = value !== 0 && value === selValue && i !== sel;
        const error = showErrors && value !== 0 && !given && !isCellValid(game.cells, i, cfg);

        const classes = ['cell'];
        if (given) classes.push('cell-given');
        if (i === sel) classes.push('cell-selected');
        else if (sameValue) classes.push('cell-same');
        else if (related) classes.push('cell-related');
        if (error) classes.push('cell-error');
        if (hinted.has(i)) classes.push('cell-hinted');
        if (game.lastEvent && game.lastEvent.cell === i && game.lastEvent.kind !== 'undo')
          classes.push('cell-pop');
        // Thick borders on box boundaries.
        if (c % cfg.boxW === 0 && c !== 0) classes.push('box-left');
        if (r % cfg.boxH === 0 && r !== 0) classes.push('box-top');

        return (
          <button
            key={i}
            className={classes.join(' ')}
            onClick={() => dispatch({ type: 'select', cell: i })}
            role="gridcell"
            aria-label={`row ${r + 1} column ${c + 1}${value ? `, ${value}` : ', empty'}`}
          >
            {value !== 0 ? (
              <span className="cell-value">{value}</span>
            ) : game.notes[i] !== 0 ? (
              <span className="cell-notes" style={{ ['--note-cols' as string]: cfg.boxW }}>
                {Array.from({ length: size }, (_, v) => (
                  <i key={v}>{game.notes[i] & (1 << v) ? v + 1 : ''}</i>
                ))}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
});
