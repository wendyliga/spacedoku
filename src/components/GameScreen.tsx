import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../state/gameReducer';
import type { Settings } from '../state/settings';
import Board from './Board';
import NumberPad from './NumberPad';
import Toolbar from './Toolbar';
import Hud from './Hud';

interface Props {
  game: GameState;
  dispatch: Dispatch<GameAction>;
  settings: Settings;
  onQuit: () => void;
  onOpenSettings: () => void;
}

export default function GameScreen({ game, dispatch, settings, onQuit, onOpenSettings }: Props) {
  return (
    <div className="game-screen">
      <Hud game={game} onQuit={onQuit} onOpenSettings={onOpenSettings} />
      <Board game={game} dispatch={dispatch} showErrors={settings.showErrors} />
      <Toolbar game={game} dispatch={dispatch} />
      <NumberPad game={game} dispatch={dispatch} />
    </div>
  );
}
