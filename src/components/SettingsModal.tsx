import type { Settings } from '../state/settings';
import { audio } from '../audio/audio';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onChange, onClose }: Props) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings ⚙️</h2>

        <div className="setting-row">
          <label className="setting-label" htmlFor="sfx-toggle">
            🔔 Sound effects
          </label>
          <input
            id="sfx-toggle"
            type="checkbox"
            className="switch"
            checked={settings.sfxEnabled}
            onChange={(e) => {
              set({ sfxEnabled: e.target.checked });
              if (e.target.checked) audio.play('click');
            }}
          />
        </div>
        <div className="setting-row">
          <label className="setting-label" htmlFor="sfx-volume">
            Volume
          </label>
          <input
            id="sfx-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.sfxVolume}
            disabled={!settings.sfxEnabled}
            onChange={(e) => set({ sfxVolume: Number(e.target.value) })}
            onPointerUp={() => audio.play('place')}
          />
        </div>

        <div className="setting-row">
          <label className="setting-label" htmlFor="music-toggle">
            🎵 Music
          </label>
          <input
            id="music-toggle"
            type="checkbox"
            className="switch"
            checked={settings.musicEnabled}
            onChange={(e) => set({ musicEnabled: e.target.checked })}
          />
        </div>
        <div className="setting-row">
          <label className="setting-label" htmlFor="music-volume">
            Volume
          </label>
          <input
            id="music-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.musicVolume}
            disabled={!settings.musicEnabled}
            onChange={(e) => set({ musicVolume: Number(e.target.value) })}
          />
        </div>

        <div className="setting-row">
          <label className="setting-label" htmlFor="errors-toggle">
            🚨 Highlight mistakes
          </label>
          <input
            id="errors-toggle"
            type="checkbox"
            className="switch"
            checked={settings.showErrors}
            onChange={(e) => set({ showErrors: e.target.checked })}
          />
        </div>

        <button className="btn btn-close" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
