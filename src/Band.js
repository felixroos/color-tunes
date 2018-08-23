import React from 'react';
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import { getTonalChord } from './chordScales';
import { CircleSet } from './components/CircleSet';
import { getProps } from './components/Chroma';
import PianoKeyboard from './components/PianoKeyboard';
import './Band.css';

import { piano } from 'jazzband/demo/samples/piano';
import { drumset } from 'jazzband/demo/samples/drumset';
import * as jazz from 'jazzband';

export default class Band extends React.Component {

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
    console.log('band');
    const context = new AudioContext();
    this.context = context;
    this.keyboard = new jazz.Sampler({ samples: piano, midiOffset: 24, gain: 1, context });
    this.drums = new jazz.Sampler({ samples: drumset, context, gain: 0.7, duration: 6000 });

    this.drummer = new jazz.Drummer(this.drums);
    this.pianist = new jazz.Pianist(this.keyboard, {
      onTrigger: (activeNotes) => {
        console.log('trigger..');
        this.setState({ activeNotes });
      }
    });
    this.bassist = new jazz.Bassist(this.keyboard);
    this.band = new jazz.Trio({ context, piano: this.keyboard, bass: this.keyboard, drums: this.drums },
      (measure, tick) => {
        this.props.onChangePosition(measure.index);
      });
  }

  /*  setPosition(position, play) {
     const chord = this.props.measures[position[0]][position[1]];
     this.setState({ position, chord });
     if (this.props.onChangePosition) {
       this.props.onChangePosition(position);
     }
     if (play) {
       this.pianist.playChord(chord);
     }
   } */

  /* highlight(highlightedNotes) {
    this.setState({ highlightedNotes })
  }
  
  unhighlight(notes) {
    const highlightedNotes = this.state.highlightedNotes
      .filter(note => notes.includes(note));
    this.setState({ highlightedNotes })
  } */

  render() {
    let keys, circle, label; //, score = '';
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

      keys = (<PianoKeyboard
        width="100%"
        setChroma={props.chroma}
        setTonic={Note.chroma(props.tonic)}
        notes={props.notes}
        scorenotes={this.state.activeNotes || []}
        highlightedNotes={this.state.highlightedNotes}
      />);

    }

    return (

      <div className="band">
        <button onClick={() => this.band.comp(this.props.sheet, { metronome: true })}>play</button>
        {keys}
        {label}
        {circle}
        {/* score */}
      </div >
    );
  }
}
