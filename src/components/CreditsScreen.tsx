import { audio } from '../audio/audio';

interface Props {
  onBack: () => void;
}

interface Pack {
  name: string;
  author: string;
  url: string;
  license: string;
  usedFor: string;
  terms: string;
}

const PACKS: Pack[] = [
  {
    name: 'Space Background',
    author: 'ansimuz',
    url: 'https://ansimuz.itch.io/space-background',
    license: 'CC0 · Public domain',
    usedFor: 'Nebula backdrop, planets, and asteroids',
    terms:
      'Released under CC0. It can be used, modified, redistributed, and shipped in personal or commercial projects without asking permission or giving attribution.',
  },
  {
    name: 'Lunar Battle Pack (Space Runner)',
    author: 'Matt Walkden',
    url: 'https://mattwalkden.itch.io/lunar-battle-pack',
    license: 'CC0 · Public domain',
    usedFor: 'Astronaut, sparkles, gems, helmet, and shard sprites',
    terms:
      'Released under a CC0 / public-domain dedication. Commercial use, modification, and redistribution are all allowed, with no attribution requirement.',
  },
  {
    name: 'Interface Bleeps',
    author: 'Bleeoop',
    url: 'https://bleeoop.itch.io/interface-bleeps',
    license: 'Royalty-free license',
    usedFor: 'All interface sound effects',
    terms:
      'Not public domain — a royalty-free usage license. The sounds can be used in unlimited personal or commercial projects, including games, without attribution. The raw sound files may not be resold, repackaged, sublicensed, or shared, and authorship of them may not be claimed.',
  },
];

export default function CreditsScreen({ onBack }: Props) {
  return (
    <div className="credits-screen">
      <h1 className="credits-title">Credits</h1>
      <p className="tagline">Spacedoku is built on these wonderful asset packs.</p>

      {PACKS.map((pack) => (
        <article className="credit-card" key={pack.name}>
          <div className="credit-head">
            <h2 className="credit-name">{pack.name}</h2>
            <span className="credit-license">{pack.license}</span>
          </div>
          <p className="credit-author">
            by{' '}
            <a
              className="credit-link"
              href={pack.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audio.play('click')}
            >
              {pack.author}
            </a>
          </p>
          <p className="credit-used">Used for: {pack.usedFor}</p>
          <p className="credit-terms">{pack.terms}</p>
        </article>
      ))}

      <p className="credits-note">
        Fonts: Orbitron and Exo 2, both under the SIL Open Font License, bundled locally.
      </p>

      <button className="btn btn-close" onClick={onBack}>
        Back to menu
      </button>
    </div>
  );
}
