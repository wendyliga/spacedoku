import { useState } from 'react';
import type { Difficulty, SizeKey } from '../core/types';
import { DIFFICULTIES } from '../core/types';
import { audio } from '../audio/audio';

interface Props {
  onStart: (size: SizeKey, difficulty: Difficulty) => void;
  onResume?: () => void;
  onOpenSettings: () => void;
}

const SIZE_OPTIONS: { key: SizeKey; label: string; hint: string }[] = [
  { key: '4', label: '4×4', hint: 'Quick & tiny' },
  { key: '6', label: '6×6', hint: 'Warmed up' },
  { key: '9', label: '9×9', hint: 'The classic' },
];

const DIFFICULTY_EMOJI: Record<Difficulty, string> = {
  easy: '🌱',
  medium: '🌤️',
  hard: '🌶️',
  expert: '🌋',
};

export default function StartScreen({ onStart, onResume, onOpenSettings }: Props) {
  const [size, setSize] = useState<SizeKey>('9');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  return (
    <div className="start-screen">
      <button className="icon-btn settings-corner" onClick={onOpenSettings} aria-label="Settings">
        ⚙️
      </button>

      <h1 className="logo">
        Sudoku<span className="logo-pop"> Pop!</span>
      </h1>
      <p className="tagline">Numbers never looked this fun 🎉</p>

      {onResume && (
        <button className="btn btn-resume" onClick={onResume}>
          ▶️ Resume game
        </button>
      )}

      <section className="picker">
        <h2>Board size</h2>
        <div className="picker-row">
          {SIZE_OPTIONS.map((o) => (
            <button
              key={o.key}
              className={`chip ${size === o.key ? 'chip-active' : ''}`}
              onClick={() => {
                audio.play('click');
                setSize(o.key);
              }}
            >
              <span className="chip-label">{o.label}</span>
              <span className="chip-hint">{o.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="picker">
        <h2>Difficulty</h2>
        <div className="picker-row">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`chip ${difficulty === d ? 'chip-active' : ''}`}
              onClick={() => {
                audio.play('click');
                setDifficulty(d);
              }}
            >
              <span className="chip-label">
                {DIFFICULTY_EMOJI[d]} {d}
              </span>
            </button>
          ))}
        </div>
      </section>

      <button className="btn btn-play" onClick={() => onStart(size, difficulty)}>
        Play!
      </button>
    </div>
  );
}
