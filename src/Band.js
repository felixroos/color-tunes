import React from 'react';
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import { getTonalChord } from './chordScales';
import { CircleSet } from './components/CircleSet';
import { getProps } from './components/Chroma';
import PianoKeyboard from './components/PianoKeyboard';
import Pianist from './classes/Pianist';
import { Pulse } from './classes/Pulse';
import './Band.css';
import { Metronome } from './classes/Metronome';
import { Drummer } from './classes/Drummer';

export default class Band extends React.Component {
  styles = {
    'Medium Swing': {},
    'Slow Swing': {},
    'Medium Up Swing': {},
    'Up Tempo Swing': {},
    'Bossa Nova': {},
    'Latin': {},
    'Waltz': {},
    'Even 8ths': {},
    'Afro': {},
    'Ballad': {},
    'Rock Pop': {},
    'Funk': {},
  };
  defaultStyle = 'Medium Swing';
  pulse = new Pulse({ bpm: 130 });
  metronome = new Metronome();
  drummer = new Drummer();
  pianist = new Pianist({
    onTrigger: (activeNotes) => {
      this.setState({ activeNotes });
    },
    /* onStop: (notes) => {
      console.log('stop', notes);
    } */
  });


  constructor() {
    super();
    this.state = {
      chord: null,
      circle: 'fourths', // fifths, chromatics
      arpeggiate: true,
      overlap: false,
      autoplay: true,
      position: null,
      activeNotes: null
    };
  }

  setPosition(position, play) {
    const chord = this.props.measures[position[0]][position[1]];
    this.setState({ position, chord });
    if (this.props.onChangePosition) {
      this.props.onChangePosition(position);
    }
    if (play) {
      this.pianist.playChord(chord);
    }
  }

  applyStyle(styleName) {
    const style = this.styles[styleName] || this.styles[this.defaultStyle];
    this.pulse.props = Object.assign(style);
  }

  playTune(measures = this.props.measures, position = this.state.position || [0, 0]) {
    // this.applyStyle(this.props.style);
    this.pulse.tickArray(measures, (tick) => {
      this.setPosition(tick.path); // visuals only
      // this.pianist.playChord(this.props.measures[tick.path[0]][tick.path[1]], tick.deadline);
    });

    // bars
    this.pulse.tickArray(measures.map(m => 1), (tick) => {
      this.drummer.bar(tick);
      this.pianist.bar(tick, measures);
      // this.metronome.bar(tick);
    });

    this.pulse.start();
  }

  getNextPosition(position = this.state.position, measures = this.props.measures) {
    let barIndex = position[0];
    let chordIndex = position[1] + 1;
    if (chordIndex > measures[barIndex].length - 1) {
      chordIndex = 0;
      barIndex = (barIndex + 1) % measures.length;
    }
    return [barIndex, chordIndex];
  }

  playNextChord(measures = this.props.measures, bpm = 220, beatsPerMeasure = 4, forms = 2) {
    const position = !this.state.position ? [0, 0] : this.getNextPosition();
    this.setPosition(position, true);
  }

  highlight(highlightedNotes) {
    this.setState({ highlightedNotes })
  }

  unhighlight(notes) {
    const highlightedNotes = this.state.highlightedNotes
      .filter(note => notes.includes(note));
    this.setState({ highlightedNotes })
  }

  render() {
    let piano, circle, label; //, score = '';
    const chord = this.props.chord || this.state.chord;
    if (chord) {
      const chordTokens = Chord.tokenize(getTonalChord(chord));
      const props = getProps({ tonic: chordTokens[0], chord: chordTokens[1], order: true });
      if (!props) {
        console.warn('invalid chord..');
        return null;
      }
      if (this.state.activeNotes) {
        props.order = this.state.activeNotes.map(note => Note.chroma(note)) || props.order;
      }
      circle = (<CircleSet
        size="200"
        chroma={props.chroma}
        order={props.order}
        ordered={true}
        origin={props.tonic}
        labels={props.labels}
      />);

      piano = (<PianoKeyboard
        width="100%"
        setChroma={props.chroma}
        setTonic={Note.chroma(props.tonic)}
        notes={props.notes}
        scorenotes={this.state.activeNotes || []}
        highlightedNotes={this.state.highlightedNotes}
      />);

    }

    return (

      <div className="player">
        <ul>
          <li>
            <a onClick={() => this.playTune()}>play {this.pulse.props.bpm}</a>
          </li>
          <li>
            <a onClick={() => this.pulse.stop()}>stop</a>
          </li>
          <li>
            <a onClick={() => this.playNextChord()}>next chord</a>
          </li>
        </ul>
        {piano}
        {label}
        {circle}
        {/* score */}
      </div >
    );
  }
}
