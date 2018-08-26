import React from 'react';
import * as Note from 'tonal-note';
import { CircleSet } from './components/CircleSet';
import PianoKeyboard from './components/PianoKeyboard';
import './Band.css';

import { piano } from 'jazzband/demo/samples/piano';
import { drumset } from 'jazzband/demo/samples/drumset';
import * as jazz from 'jazzband';
import { funk } from 'jazzband/lib/grooves/funk.js';
import { disco } from 'jazzband/lib/grooves/disco.js';
import { swing } from 'jazzband/lib/grooves/swing.js';

export default class Band extends React.Component {

  grooves = { swing, funk, disco };

  constructor() {
    super();
    this.state = {
      circle: 'fourths', // fifths, chromatics
      arpeggiate: true,
      overlap: false,
      autoplay: true,
      position: null,
      activeNotes: [],
      tempo: 130,
    };
    const context = new AudioContext();
    this.context = context;
    this.keyboard = new jazz.Sampler({
      samples: piano, midiOffset: 24, gain: 1, context,
      onTrigger: ({ on, off, active }) => this.updateActiveNotes(active)
    });
    this.drums = new jazz.Sampler({ samples: drumset, context, gain: 0.7, duration: 6000 });

    this.drummer = new jazz.Drummer(this.drums);
    this.pianist = new jazz.Pianist(this.keyboard);
    this.bassist = new jazz.Bassist(this.keyboard);
    this.band = new jazz.Trio({
      context, piano: this.keyboard, bass: this.keyboard, drums: this.drums,
      onMeasure: (measure, tick) => {
        this.props.onChangePosition(measure.index);
      }
    });
  }


  updateActiveNotes(events) {
    this.setState({ activeNotes: events.map(e => e.note) });
  }

  changeTempo(delta) {
    const newTempo = this.state.tempo + delta;
    if (this.band && this.band.pulse) {
      this.band.pulse.changeTempo(newTempo);
    }
    this.setState({ tempo: newTempo });
  }

  play() {
    this.band.comp(this.props.sheet, { metronome: true, bpm: this.state.tempo, groove: this.grooves.swing });
    console.log('tempo', this.band.pulse.props.bpm);
    this.setState({ tempo: this.band.pulse.props.bpm });
  }

  stop() {
    this.band.pulse.stop();
    this.props.onChangePosition(-1);
  }

  randomInstruments() {
    const allowed = ['sine', 'triangle', 'square', 'sawtooth'];
    if (!this.band) {
      return;
    }
    this.band.pianist.instrument = jazz.util.randomSynth(this.band.mix, allowed);
    this.band.pianist.instrument.onTrigger = ({ on, off, active }) => this.updateActiveNotes(active);
    this.band.bassist.instrument = jazz.util.randomSynth(this.band.mix, allowed);
  }

  render() {
    let keys, circle, label, score = '';

    // console.log('active notes', this.state.activeNotes);
    // props.order = this.state.activeNotes.map(note => Note.chroma(note)) || props.order;
    const chroma = new Array(12).fill(0).map((z, index) =>
      !!this.state.activeNotes.find(n => Note.chroma(n) === index) ? 1 : 0
    ).join('');

    circle = (chroma && <CircleSet
      size="200"
      chroma={chroma}
    /* order={props.order}
    ordered={true}
    origin={props.tonic}
    labels={props.labels} */
    />);

    keys = (<PianoKeyboard
      width="100%"
      /* setChroma={props.chroma} */
      setTonic={Note.chroma('C')}
      /* notes={props.notes} */
      scorenotes={this.state.activeNotes || []}
      highlightedNotes={this.state.activeNotes || []}
    />);

    /* score = <Score
      notes={this.state.activeNotes}
    />; */

    return (
      <div className="band">
        {keys}
        <button onClick={() => this.play()}>play</button>
        <button onClick={() => this.stop()}>stop</button>
        <button onClick={() => this.changeTempo(-10)}>slower</button>
        <strong>{this.state.tempo}</strong>
        <button onClick={() => this.changeTempo(10)}>faster</button>
        <button onClick={() => this.randomInstruments()}>Random Instruments</button>
        {label}
        {/* circle */}
        {score}
      </div >
    );
  }
}
