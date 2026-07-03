import { useState } from 'react';
import type { Difficulty, SizeKey } from '../core/types';
import { DIFFICULTIES } from '../core/types';
import { audio } from '../audio/audio';
import PixelIcon from './PixelIcon';
import PixelSprite from './PixelSprite';
import astronautJumpUrl from '../assets/sprites/Astronaut_Jump.png';
import diamondUrl from '../assets/sprites/Diamond.png';
import helmetUrl from '../assets/sprites/LivesCounter.png';

interface Props {
  onStart: (size: SizeKey, difficulty: Difficulty) => void;
  onResume?: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
}

const SIZE_OPTIONS: { key: SizeKey; label: string; hint: string }[] = [
  { key: '4', label: '4×4', hint: 'Moon hop' },
  { key: '6', label: '6×6', hint: 'Orbit run' },
  { key: '9', label: '9×9', hint: 'Deep space' },
];

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Cadet',
  medium: 'Pilot',
  hard: 'Commander',
  expert: 'Alien',
};

// Difficulty is shown as 1–4 glowing pips instead of an emoji.
const DIFFICULTY_PIPS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

export default function StartScreen({ onStart, onResume, onOpenSettings, onOpenCredits }: Props) {
  const [size, setSize] = useState<SizeKey>('9');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  return (
    <div className="start-screen">
      <div className="menu-corner-actions">
        <button className="icon-btn" onClick={onOpenCredits} aria-label="Credits">
          <PixelIcon src={diamondUrl} w={16} h={16} scale={2} />
          <span className="icon-btn-label">Credits</span>
        </button>
        <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
          <PixelIcon src={helmetUrl} w={32} h={32} scale={1} />
          <span className="icon-btn-label">Settings</span>
        </button>
      </div>

      <h1 className="logo">
        Space<span className="logo-pop">doku</span>
      </h1>
      <p className="tagline">Number puzzles from outer space</p>

      <section className="picker">
        <h2>Star chart</h2>
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
        <h2>Mission rank</h2>
        <div className="picker-row">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`chip chip-rank ${difficulty === d ? 'chip-active' : ''}`}
              onClick={() => {
                audio.play('click');
                setDifficulty(d);
              }}
            >
              <span className="chip-label">{DIFFICULTY_LABELS[d]}</span>
              <span className="pips" aria-hidden>
                {Array.from({ length: 4 }, (_, i) => (
                  <span key={i} className={`pip ${i < DIFFICULTY_PIPS[d] ? 'pip-on' : ''}`} />
                ))}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="start-actions">
        <button className="btn btn-play" onClick={() => onStart(size, difficulty)}>
          <span className="launch-badge">
            <PixelSprite
              sheet={astronautJumpUrl}
              frames={5}
              frameW={24}
              frameH={24}
              scale={2}
              fps={8}
            />
          </span>
          Launch
        </button>
        {onResume && (
          <button className="btn btn-resume" onClick={onResume}>
            Resume mission
          </button>
        )}
      </div>
    </div>
  );
}
