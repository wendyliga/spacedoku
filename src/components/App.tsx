import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Difficulty, SizeKey } from '../core/types';
import { SIZE_CONFIGS } from '../core/types';
import { generatePuzzle } from '../core/sudoku';
import { gameReducer, newGameState, type GameState } from '../state/gameReducer';
import { loadSettings, saveSettings, type Settings } from '../state/settings';
import { clearSavedGame, loadSavedGame, saveGame } from '../state/storage';
import { audio } from '../audio/audio';
import { buildHref, buildVersion } from '../core/buildInfo';
import SpaceBackdrop from './SpaceBackdrop';
import StartScreen from './StartScreen';
import GameScreen from './GameScreen';
import SettingsModal from './SettingsModal';
import WinScreen from './WinScreen';
import CreditsScreen from './CreditsScreen';

type Screen = 'start' | 'game' | 'credits';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [game, dispatch] = useReducer(gameReducer, undefined, () =>
    newGameState(generatePuzzle('4', 'easy')),
  );
  const [resumeAvailable, setResumeAvailable] = useState(() => loadSavedGame() !== null);
  const gameRef = useRef<GameState>(game);
  gameRef.current = game;

  // Unlock audio on the first user gesture anywhere (browser autoplay policy).
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Keep the audio engine in sync with settings.
  useEffect(() => {
    audio.configure(settings);
    saveSettings(settings);
  }, [settings]);

  // Game clock.
  useEffect(() => {
    if (screen !== 'game' || game.status !== 'playing') return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [screen, game.status]);

  // Persist progress; saveGame clears storage automatically once won.
  useEffect(() => {
    if (screen === 'game') saveGame(game);
  }, [screen, game]);

  // Sounds for game events.
  const lastEvent = game.lastEvent;
  useEffect(() => {
    if (!lastEvent || screen !== 'game') return;
    audio.play(lastEvent.kind);
  }, [lastEvent, screen]);

  const startNewGame = useCallback((sizeKey: SizeKey, difficulty: Difficulty) => {
    audio.play('click');
    // Defer generation past the click so the button animation stays smooth.
    setTimeout(() => {
      dispatch({ type: 'replace', state: newGameState(generatePuzzle(sizeKey, difficulty)) });
      setScreen('game');
    }, 30);
  }, []);

  const resumeGame = useCallback(() => {
    const saved = loadSavedGame();
    if (!saved) {
      setResumeAvailable(false);
      return;
    }
    audio.play('click');
    dispatch({ type: 'replace', state: saved });
    setScreen('game');
  }, []);

  const quitToMenu = useCallback(() => {
    audio.play('click');
    saveGame(gameRef.current);
    setResumeAvailable(gameRef.current.status === 'playing');
    setScreen('start');
  }, []);

  const playAgain = useCallback(() => {
    audio.play('click');
    clearSavedGame();
    setResumeAvailable(false);
    setScreen('start');
  }, []);

  // Keyboard controls.
  useEffect(() => {
    if (screen !== 'game') return;
    const onKey = (e: KeyboardEvent) => {
      if (settingsOpen || gameRef.current.status === 'won') return;
      const size = SIZE_CONFIGS[gameRef.current.puzzle.sizeKey].size;
      const sel = gameRef.current.selected;
      const move = (dr: number, dc: number) => {
        e.preventDefault();
        const cur = sel < 0 ? 0 : sel;
        const r = Math.min(size - 1, Math.max(0, Math.floor(cur / size) + dr));
        const c = Math.min(size - 1, Math.max(0, (cur % size) + dc));
        dispatch({ type: 'select', cell: r * size + c });
      };
      if (e.key === 'ArrowUp') return move(-1, 0);
      if (e.key === 'ArrowDown') return move(1, 0);
      if (e.key === 'ArrowLeft') return move(0, -1);
      if (e.key === 'ArrowRight') return move(0, 1);
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        return dispatch({ type: 'erase' });
      }
      if (e.key === 'n' || e.key === 'N') return dispatch({ type: 'toggleNotes' });
      if (e.key === 'h' || e.key === 'H') return dispatch({ type: 'hint' });
      if (e.key === 'u' || e.key === 'U' || (e.key === 'z' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        return dispatch({ type: 'undo' });
      }
      const v = parseInt(e.key, 10);
      if (!Number.isNaN(v) && v >= 1 && v <= size) dispatch({ type: 'input', value: v });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, settingsOpen]);

  return (
    <div className="app">
      <SpaceBackdrop />
      {screen === 'start' && (
        <StartScreen
          onStart={startNewGame}
          onResume={resumeAvailable ? resumeGame : undefined}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenCredits={() => setScreen('credits')}
        />
      )}
      {screen === 'credits' && <CreditsScreen onBack={() => setScreen('start')} />}
      {screen === 'game' && (
        <GameScreen
          game={game}
          dispatch={dispatch}
          settings={settings}
          onQuit={quitToMenu}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}
      {screen === 'game' && game.status === 'won' && (
        <WinScreen game={game} onPlayAgain={playAgain} />
      )}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      <footer className="site-footer">
        <a
          className="footer-link"
          href={buildHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Build</span>
          <span className="footer-build-pill">{buildVersion}</span>
        </a>
      </footer>
    </div>
  );
}
