import React from 'react';
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
    const song = this.props.data;
    if (!song) {
      return 'Select a song';
    }
    return (
      <div className="song">
        <h1>{song.title}</h1>
        <SongInfo song={song} measures={song.measures} />
        <Sheet sheet={song.sheet} highlight={this.state.position} onClickChord={(chord) => this.selectChord(chord)} />
        <Band sheet={song.sheet} onChangePosition={(position) => this.setState({ position })} />
      </div >
    );
  }
}
export function SongInfo(props) {
  return (
    <ul className="info">
      <li>({props.song.style})</li>
      <li>{props.song.composer}</li>
      {/* <li>Comp Style: {props.song.compStyle}</li> */}
      {/* <li>BPM: {props.song.bpm}</li> */}
      {/* <li>Repeats: {props.song.repeats}</li> */}
      {/* <li>Time: {props.song.repeats}</li> */}
      <li>Form: {props.measures.length} Bars</li>
      <li>Key: {props.song.key}</li>
    </ul>
  );
}
