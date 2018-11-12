import React from 'react';
import * as Note from 'tonal-note';
import PianoKeyboard from './components/PianoKeyboard';
import './Band.css';

import { piano } from 'jazzband/demo/samples/piano';
import { drumset } from 'jazzband/demo/samples/drumset';
import * as jazz from 'jazzband';
import { funk } from 'jazzband/lib/grooves/funk';
import { disco } from 'jazzband/lib/grooves/disco';
import { swing } from 'jazzband/lib/grooves/swing';
import { bossa } from 'jazzband/lib/grooves/bossa';
import { defaultMethod, improvisationMethods } from 'jazzband/lib/improvisation/methods';

export default class Band extends React.Component {

  grooves = { bossa, swing, funk, disco };

  constructor() {
    super();
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
      solo: true,
      context, piano: this.keyboard, bass: this.keyboard, drums: this.drums,
      onMeasure: (measure, tick) => {
        this.props.onChangePosition(measure.index);
      }
    });
    this.naturalInstruments();
    this.state = {
      circle: 'fourths', // fifths, chromatics
      arpeggiate: true,
      overlap: false,
      autoplay: true,
      position: null,
      activeNotes: [],
      tempo: 130,
      groove: this.grooves.bossa,
      activeMusicians: this.band.musicians,
      improvisationMethod: defaultMethod
    };
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
    console.log('groove', this.state.groove);
    console.log('musicians', this.state.activeMusicians);
    this.band.comp(this.props.sheet, {
      metronome: true,
      bpm: this.state.tempo,
      groove: this.state.groove,
      musicians: this.state.activeMusicians,
      improvisationMethod: this.state.improvisationMethod
    });
    console.log('tempo', this.band.pulse.props.bpm);
    this.setState({ tempo: this.band.pulse.props.bpm });
  }

  stop() {
    this.band.pulse.stop();
    this.props.onChangePosition(-1);
  }

  naturalInstruments() {
    this.band.pianist.instrument = this.keyboard;
    this.band.bassist.instrument = this.keyboard;
    this.band.soloist.instrument = this.keyboard;
    this.band.pianist.gain = .6;
    this.band.bassist.gain = .6;
    this.band.soloist.gain = 1;

    /* this.band.soloist.instrument.onTrigger = ({ on, off, active }) => this.updateActiveNotes(active);
    this.band.pianist.instrument.onTrigger = ({ on, off, active }) => this.updateActiveNotes(active);
    this.band.bassist.instrument.onTrigger = ({ on, off, active }) => this.updateActiveNotes(active); */
  }

  randomInstruments() {
    /* const allowed = ['sine', 'triangle', 'square', 'sawtooth']; */
    this.band.pianist.instrument = jazz.util.randomSynth(this.band.mix, ['square'/* , 'sawtooth' */]);
    this.band.bassist.instrument = jazz.util.randomSynth(this.band.mix, [/* 'square',  */'triangle', /* 'sine' */]);
    this.band.soloist.instrument = jazz.util.randomSynth(this.band.mix, ['triangle'/* , 'square', 'sawtooth' */]);

    this.band.pianist.gain = 1;
    this.band.bassist.gain = 1;
    this.band.soloist.gain = .6;

    //this.band.pianist.instrument = new jazz.MidiOut({ mix: this.band.mix });
    //this.band.bassist.instrument = new jazz.MidiOut({ mix: this.band.mix });

    /* this.band.soloist.instrument.onTrigger = ({ on, off, active }) => this.updateActiveNotes(active);
    this.band.pianist.instrument.onTrigger = ({ on, off, active }) => this.updateActiveNotes(active);
    this.band.bassist.instrument.onTrigger = ({ on, off, active }) => this.updateActiveNotes(active); */
  }

  isActive(musician) {
    return this.state.activeMusicians.includes(musician);
  }

  render() {
    let keys, /* circle,  */label, score = '';

    // console.log('active notes', this.state.activeNotes);
    // props.order = this.state.activeNotes.map(note => Note.chroma(note)) || props.order;

    /* const chroma = new Array(12).fill(0).map((z, index) =>
      !!this.state.activeNotes.find(n => Note.chroma(n) === index) ? 1 : 0
    ).join(''); */

    /* circle = (chroma && <CircleSet
      size="200"
      chroma={chroma} */
    /* order={props.order}
    ordered={true}
    origin={props.tonic}
    labels={props.labels} */
    /* />); */

    keys = (<PianoKeyboard
      width="100%"
      /* setChroma={props.chroma} */
      setTonic={Note.chroma('C')}
      /* notes={props.notes} */
      scorenotes={this.state.activeNotes || []}
      highlightedNotes={this.state.activeNotes || []}
    />);

    const grooveSelect = (<select onChange={(e) => {
      const groove = this.grooves[e.target.value];
      this.setState({ groove, tempo: groove.tempo || this.state.tempo })
    }}>{Object.keys(this.grooves).map(key => (
      <option value={key}
        key={key}>
        {this.grooves[key].name || key}
      </option>))}
    </select>);

    const improvisationSelect = (
      <select onChange={(e) => {
        const improvisationMethod = improvisationMethods[e.target.value];
        this.setState({ improvisationMethod });
        this.band.soloist.useMethod(improvisationMethod);
      }}>{Object.keys(improvisationMethods).map(key => (
        <option value={key}
          key={key}>
          {improvisationMethods[key].get('name') || key}
        </option>))}
      </select>);

    const musicianCheckboxes = (
      this.band.musicians.map((musician, index) =>
        (<label key={index}>
          <input type="checkbox"
            checked={this.isActive(musician)}
            onChange={(e) => {
              if (e.target.checked && !this.isActive(musician)) {
                this.setState({
                  activeMusicians: this.state.activeMusicians.concat([musician])
                });
              } else if (!e.target.checked && this.isActive(musician)) {
                this.setState({
                  activeMusicians: this.state.activeMusicians.filter(m => m !== musician)
                });
              }
            }}></input>{musician.name}</label>))
    );

    /* score = <Score
      notes={this.state.activeNotes}
    />; */

    return (
      <div className="band">
        <button onClick={() => this.play()}>play</button>
        <button onClick={() => this.stop()}>stop</button>
        <button onClick={() => this.changeTempo(-10)}>slower</button>
        <strong>{this.state.tempo}</strong>
        <button onClick={() => this.changeTempo(10)}>faster</button>
        {grooveSelect}
        {improvisationSelect}
        <button onClick={() => this.randomInstruments()}>
          Synth Band <span role="img" aria-label="robot">🤖</span>
        </button>
        <button onClick={() => this.naturalInstruments()}>
          Piano Band <span role="img" aria-label="keys">🎹</span>
        </button>
        <br />
        {musicianCheckboxes}
        {label}
        {/* circle */}
        {keys}
        {score}
      </div >
    );
  }
}
