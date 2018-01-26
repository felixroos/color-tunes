import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import { transpose } from 'tonal';
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as PcSet from 'tonal-pcset';
import PianoKeyboard from './components/PianoKeyboard';
import Score from './components/Score';
import { getTonalChord } from './chordScales';

const center = pc =>
  pc ? (pc[0] === "A" || pc[0] === "B" ? pc + 3 : pc + 4) : null;

export default class Player extends React.Component {
  constructor() {
    super();
    this.state = {
      chord: null,
      history: []
    };
  }

  playChord(chord) {
    const notes = Chord.notes(getTonalChord(chord));
    notes.forEach(note => {
      /* const index = Note.chroma(note) + 36; */
      /* var audio = new Audio(sounds[index - 16]); */
      /* audio.play(); */
      console.warn('Audio is currently not available');
    });
    this.setState({ history: this.state.history.concat([chord]) });
  }

  getTimePerMeasure(bpm, beatsPerMeasure) {
    return 60 / bpm * beatsPerMeasure * 1000;
  }

  playTune(measures = this.props.measures, bpm = 90, beatsPerMeasure = 4) {
    const interval = this.getTimePerMeasure(bpm, beatsPerMeasure);
    measures.forEach((chords, index) => {
      setTimeout(() => {
        const interval = this.getTimePerMeasure(bpm, beatsPerMeasure) / chords.length;
        chords.forEach((chord, index) => {
          this.playChord(chord);
          setTimeout(() => {
            this.setState({ chord });
          }, interval * index);
        });

      }, index * interval);
    });
  }

  render() {
    let piano, score = '';
    const chord = this.props.chord || this.state.chord;
    if (chord) {
      const notes = Chord.notes(getTonalChord(chord));
      const intervals = Chord.intervals(getTonalChord(chord));
      const tokens = Chord.tokenize(getTonalChord(chord));
      const tonic = Note.pc(tokens[0]);
      const scorenotes = intervals.map(transpose(center(tonic)));

      const chroma = PcSet.chroma(notes);
      piano = (<PianoKeyboard
        width="100%"
        setTonic={Note.chroma(tokens[0])}
        setChroma={chroma}
        minOct={1}
        maxOct={7}
        notes={notes}
      />);
      // keyTonic={tokens[0]}  
      score = <Score notes={scorenotes} />
    }

    return (
      <div className="player">
        {piano}
        {score}
        <ul>
          <li>
            <a onClick={() => this.playTune()}>
              Play
          </a>
          </li>
        </ul>
      </div>
    );
  }
}
