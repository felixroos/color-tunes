import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
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
    this.setState({ history: this.state.history.concat([chord]), chord });
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
      />);

      // keyTonic={tokens[0]}  
      score = <Score notes={scorenotes} />
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

    const tonics = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G']
      .map((tonic, index) =>
        (<li key={index} onClick={() => this.setState({ tonic })}>{tonic}</li>)
      )
    /* const scales = Scale.names() */
    const scales = ['lydian', 'major', 'mixolydian', 'dorian', 'aeolian', 'phrygian', 'locrian']
      .map((scale, index) =>
        (<li key={index} onClick={() => this.setState({ scale })}>{scale}</li>)
      )

    return (
      <div className="player">
        {piano}
        {label}
        {circle}
        {score}
        <ul>
          {tonics}
          {scales}
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
