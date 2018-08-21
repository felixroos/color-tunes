import React from 'react';
import { RealParser } from 'jazzband/lib/RealParser';
import Sheet from './Sheet';
import { piano } from 'jazzband/demo/samples/piano';
import { drumset } from 'jazzband/demo/samples/drumset';
/* import Band from './Band'; */
import './song.css';
import { Trio, Sampler } from 'jazzband';
export default class Song extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    const context = new AudioContext();
    const keyboard = new Sampler({ samples: piano, midiOffset: 24, gain: 1, context });
    const drums = new Sampler({ samples: drumset, context, gain: 0.7, duration: 6000 });

    this.band = new Trio({ context, piano: keyboard, bass: keyboard, drums });

  }
  selectChord(chord) {
    this.setState({ chord });
  }
  changedPosition(position) {
    console.log('position', position, this.sheet);
    //(position) => this.sheet.setState({ position })
  }
  render() {
    this.song = this.props.data;
    this.parser = new RealParser(this.song.music.raw);
    console.log('parser', this.parser);
    // song.music.measures = [['Bb^7'],['G7#5'],['C-7'], ['F7','F#o7'],['G-7'],['F-7']];
    return (
      <div className="song">
        <h1>{this.song.title}</h1>
        <SongInfo song={this.song} />
        <Sheet measures={this.song.music.measures} position={this.state.position} onClickChord={(chord) => this.selectChord(chord)} />
        <button onClick={() => this.band.comp(this.parser.bars, { metronome: true })}>play</button>
        {/* <Band measures={song.music.measures} style={song.style} onChangePosition={(position) => this.setState({ position })} /> */}
      </div >
    );
  }
}
export function SongInfo(props) {
  return (
    <ul className="info">
      <li>Composer: {props.song.composer}</li>
      <li>Style: {props.song.style}</li>
      {/* <li>Comp Style: {props.song.compStyle}</li> */}
      {/* <li>BPM: {props.song.bpm}</li> */}
      {/* <li>Repeats: {props.song.repeats}</li> */}
      {/* <li>Time: {props.song.repeats}</li> */}
      <li>Form: {props.song.music.measures.length} Bars</li>
      <li>Key: {props.song.key}</li>
    </ul>
  );
}
