import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as Scale from 'tonal-scale';
import * as PcSet from 'tonal-pcset';
import chordTranslator from 'chord-translator';

export function getTonalChord(chord) {
  return chord
    .replace('-', 'm')
    .replace('^', 'maj')
    .replace('d', 'dim')
    .replace('h7', 'm7b5');
}

export function playKey(index) {
  /* var audio = new Audio(sounds[index - 16]); */
  /* audio.play(); */
  console.warn('Audio is currently not available');
}

export function playNotes(notes) {
  console.log(notes.map(note => note.toString()));
  notes.forEach(note => {
    playKey(note.key());
  });
}
const chordScales = name => {
  const isSuperset = PcSet.isSupersetOf(Chord.intervals(name));
  return Scale.names().filter(name => isSuperset(Scale.intervals(name)));
};

const history = [];

export function getChromas(root, scales) {
  return scales.map(scale => PcSet.chroma(Scale.notes(root, scale)));
}

export function matchChordScales(...chords) {
  const scales = chords
    .map(chord => getTonalChord(chord))
    .map(chord => chordScales(chord));

  const chromas = chords
    .map(chord => getTonalChord(chord))
    .map(chord => [
      ...new Set(getChromas(Chord.tokenize(chord)[0], chordScales(chord)))
    ]);
  const combined = chromas.reduce((a, current) => a.concat(current, []));
  const shared = [
    ...new Set(
      combined.filter(chroma => {
        return combined.filter(c => c === chroma).length > 1; // check if there is at least one overlap
      })
    )
  ]
    .sort()
    .filter(chroma => chroma.indexOf(0) !== -1); // omit chromatic scale:
  const colors = shared.map(chroma =>
    new Array(3)
      .fill(0)
      .map((digit, index) =>
        (parseInt(chroma.slice(index * 4, index * 4 + 4), 2) * 17).toString(16)
      )
      .join('')
  );

  const material = shared.map(chroma =>
    Note.names(' b').filter((note, index) => chroma[index] === '1')
  );
  return { chords, scales, chromas, shared, colors, material };
}

export function playChord(chord) {
  /* const notes = chordTranslator(chord); */
  const notes = Chord.notes(getTonalChord(chord));
  console.log('play', chord, notes);
  notes.forEach(note => {
    playKey(Note.chroma(note) + 36);
  });
  history.unshift(chord);
  /* playNotes(getChord(chord).notes()); */
}

export function getTimePerMeasure(bpm, beatsPerMeasure) {
  return 60 / bpm * beatsPerMeasure * 1000;
}

export function playChords(chords, interval = 500, index = 0) {
  chords.forEach((chord, index) => {
    setTimeout(() => {
      if (typeof chord === 'string') {
        playChord(chord);
      } else if (Array.isArray(chord)) {
        playNotes(chord);
      }
    }, interval * index);
  });
}
export function playMeasure(chords, bpm, beatsPerMeasure = 4) {
  playChords(chords, getTimePerMeasure(bpm, beatsPerMeasure) / chords.length);
}
export function playTune(measures, bpm = 160, beatsPerMeasure = 4, index = 0) {
  const interval = getTimePerMeasure(bpm, beatsPerMeasure);
  measures.forEach((measure, index) => {
    setTimeout(() => {
      playMeasure(measure, bpm, beatsPerMeasure);
    }, index * interval);
  });
}

export default class Player extends React.Component {

  playTune() {
    playTune(this.props.measures);
  }
  render() {
    return (
      <ul>
        <li>
          <a onClick={() => this.playTune()}>
            Play
          </a>
        </li>
      </ul>
    );
  }
}
