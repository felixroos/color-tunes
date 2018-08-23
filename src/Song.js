import React from 'react';
import { RealParser } from 'jazzband/lib/RealParser';
import Sheet from './Sheet';
import Band from './Band';
import './song.css';
export default class Song extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

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
    this.parsed = new RealParser(this.song.music.raw); // TODO: outsource parsing...
    return (
      <div className="song">
        <h1>{this.song.title}</h1>
        <SongInfo song={this.song} />
        {/* <Sheet measures={this.song.music.measures} position={this.state.position} onClickChord={(chord) => this.selectChord(chord)} /> */}
        <Sheet sheet={this.parsed.sheet} highlight={this.state.position} onClickChord={(chord) => this.selectChord(chord)} />
        <Band sheet={this.parsed.sheet} onChangePosition={(position) => this.setState({ position })} />
        {/*style={song.style}  */}
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
