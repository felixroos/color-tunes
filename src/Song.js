import React from 'react';
import Sheet from './Sheet';
import Player from './Player';
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
    return (
      <div className="song">
        <h1>{song.title}</h1>
        <SongInfo song={song} />
        <Sheet measures={song.music.measures} onClickChord={(chord) => this.selectChord(chord)} />
        <Player measures={song.music.measures} chord={this.state.chord} />
      </div>
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
