import React from 'react';
import Sheet from './Sheet';
import ColorTest from './tests/ColorTest';
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
  render() {
    const song = this.props.data;
    if (!song) {
      return 'Select a song';
    }
    return (
      <div className="song">
        <SongInfo song={song} measures={song.measures} />
        <Sheet sheet={song.sheet} highlight={this.state.position} onClickChord={(chord) => this.selectChord(chord)} />
        <Band sheet={song.sheet} onChangePosition={(position) => this.setState({ position })} />
        {/* <ColorTest></ColorTest> */}
      </div >
    );
  }
}
export function SongInfo(props) {
  return (
    <div className="song-info">
    <h1>{props.song.title}</h1>
      <div className="sub">
      <div>({props.song.style})</div>
      <div>{props.song.composer}</div>
      {/* <li>Comp Style: {props.song.compStyle}</li> */}
      {/* <li>BPM: {props.song.bpm}</li> */}
      {/* <li>Repeats: {props.song.repeats}</li> */}
      {/* <li>Time: {props.song.repeats}</li> */}
      <div>Form: {props.measures.length} Bars</div>
      <div>Key: {props.song.key}</div>
    </div></div>
  );
}
