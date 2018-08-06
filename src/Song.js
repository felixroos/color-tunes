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
    // song.music.measures = [['Bb^7'],['G7#5'],['C-7'], ['F7','F#o7'],['G-7'],['F-7']];
    return (
      <div className="song">
        <h1>{song.title}</h1>
        <SongInfo song={song} />
        <Sheet measures={song.music.measures} position={this.state.position} onClickChord={(chord) => this.selectChord(chord)} />
        <Band measures={song.music.measures} style={song.style} onChangePosition={(position) => this.setState({ position })} />
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
