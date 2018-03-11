import React from 'react';
import { sounds } from './assets/sounds/sounds.js';
import { transpose } from 'tonal';
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as PcSet from 'tonal-pcset';
import * as Scale from 'tonal-scale';
import PianoKeyboard from './components/PianoKeyboard';
import Score from './components/Score';
import CircleSet from './components/CircleSet';
import { getTonalChord } from './chordScales';

const center = pc =>
  pc ? (pc[0] === "A" || pc[0] === "B" ? pc + 3 : pc + 4) : null;

export default class Player extends React.Component {
  constructor() {
    super();
    this.state = {
      chord: null,
      scale: 'major',
      history: [],
      circle: 'fourths' // fifths, chromatics
    };
  }

  playChord(chord) {
    const notes = Chord.notes(getTonalChord(chord));
    notes.forEach(note => {
      const index = Note.chroma(note) + 36;
      var audio = new Audio(sounds[index - 16]);
      audio.play();
      /* console.warn('Audio is currently not available'); */
    });
    this.setState({ history: this.state.history.concat([chord]), chord });
  }

  getTimePerMeasure(bpm, beatsPerMeasure) {
    return 60 / bpm * beatsPerMeasure * 1000;
  }

  playTune(measures = this.props.measures, bpm = 220, beatsPerMeasure = 4, forms = 2) {
    const measureInterval = this.getTimePerMeasure(bpm, beatsPerMeasure);
    for (let i = 0; i < forms; ++i) {
      const formDelay = measureInterval * i * measures.length;
      measures.forEach((chords, m) => {
        setTimeout(() => {
          const chordInterval = measureInterval / chords.length;
          console.log('chords interval', chordInterval);
          chords.forEach((chord, c) => {
            setTimeout(() => {
              this.playChord(chord);
              this.setState({ chord });
            }, chordInterval * c);
          });
        }, m * measureInterval + formDelay);
      });
    }
  }

  render() {
    let piano, circle, label, score = '';
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
      circle = (<CircleSet
        chroma={chroma}
        tonic={tonic}
        size="350"
        flip={this.state.circle === 'fifths'}
        chromatic={this.state.circle === 'chromatics'}
      />);
    }
    if (this.state.tonic && this.state.scale) {
      const tonic = this.state.tonic;
      const notes = Scale.notes(tonic, this.state.scale);
      const chroma = PcSet.chroma(notes);
      const intervals = Scale.intervals(this.state.scale);
      const scorenotes = intervals.map(transpose(center(tonic)));
      label = <h3>{tonic} {this.state.scale}</h3>;
      circle = (<CircleSet
        size="300"
        chroma={chroma}
        tonic={tonic}
      />);
      score = <Score notes={scorenotes} />;
      // setTonic={Note.chroma(tokens[0])}
      piano = (<PianoKeyboard
        width="100%"
        setChroma={chroma}
        minOct={1}
        maxOct={7}
        notes={notes}
      />);
    }

    return (
      <div className="player">
        {piano}
        {label}
        {circle}
        {/* score */}
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
