import React from 'react';
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import { getTonalChord } from './chordScales.js';
import { CircleSet } from './components/CircleSet.js';
import { getProps } from './components/Chroma.js';
import PianoKeyboard from './components/PianoKeyboard.js';
import Pianist from './components/Pianist.js';
import { Metronome } from './classes/Metronome.js';

export default class Player extends React.Component {
  metronome = new Metronome(200);
  pianist = new Pianist();

  constructor() {
    super();
    this.state = {
      chord: null,
      circle: 'fourths', // fifths, chromatics
      arpeggiate: true,
      overlap: false,
      autoplay: true,
      position: null
    };
  }

  playPosition(position, deadline = 0, measures = this.state.measures) {
    const chord = measures[position[0]][position[1]];
    const chordTokens = Chord.tokenize(getTonalChord(chord));
    const props = getProps({ tonic: chordTokens[0], chord: chordTokens[1], order: true });
    if (props) {
      this.pianist.playNotes(props.scorenotes, deadline, 0);
    }
    this.setState({ position, chord });
    if (this.props.onChangePosition) {
      this.props.onChangePosition(position);
    }
  }

  playTune(measures = this.props.measures, position = this.state.position || [0, 0]) {
    this.metronome.start();
    this.metronome.tickArray(measures, (tick) => {
      this.playPosition(tick.item.path, tick.event.deadline, measures);
    }, 2);
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
    if (this.props.onChangePosition) {
      this.props.onChangePosition(position);
    }

    this.playPosition(position, 0, measures);
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
        console.log('no props...');
        return null;
      }
      circle = (<CircleSet
        size="250"
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
        scorenotes={props.scorenotes}
        highlightedNotes={this.state.highlightedNotes}
      />);

    }

    return (
      <div className="player">
        <ul>
          <li>
            <a onClick={() => this.playTune()}>play</a>
          </li>
          <li>
            <a onClick={() => this.metronome.stop()}>stop</a>
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
