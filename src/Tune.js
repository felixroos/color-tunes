import React from 'react';
import Sheet from './Sheet';
import ColorTest from './tests/ColorTest';
import { parentModes, transposeSong } from './chordScales';


import Band from './Band';
import './song.css';
import { Note } from 'tonal';
export default class Tune extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideFooter: true,
    };
  }
  selectChord(chord) {
    this.setState({ chord });
  }

  guessRoots(sheet) {
    // returns all related ionian roots that include the given chord, travels back if x
    function findRoots(chord, index, chords) {
      // console.log('findRoots', index, chord);
      if (chord !== 'x') {
        return parentModes(chord, 'ionian');
      } else if (index !== 0) {
        return findRoots(chords[index - 1], index - 1, chords);
      } else {
        console.warn('first chord cannot be a repeating chord (% / x)');
        return [];
      }
    }
    // flatten sheet from measure[chord[]] to chord[{index,chord}]
    const flat = sheet.reduce((chords, measure, index) =>
      chords.concat(measure.chords.map(chord => ({ chord, index }))), [])
    // assign all possible related ionian roots to each chord slot
    const flatRoots = flat.map((slot, index, slots) =>
      Object.assign(slot, {
        roots: findRoots(slot.chord, index, slots.map(slot => slot.chord))
      }));
    // count most roots
    const flatStats = flatRoots.reduce((current, chord) => {
      chord.roots.forEach(root => current[root] ? current[root]++ : current[root] = 1);
      return current;
    }, {});
    // sort stats descending
    const sortedStats = Object.keys(flatStats).sort((a, b) => flatStats[a] > flatStats[b] ? -1 : 1);
    // assign best guess to each chord based on most used
    const guess = flatRoots.map(slot => {
      return Object.assign(slot,
        {
          guess: sortedStats.find(key => slot.roots.includes(key))
        });
    });
    // transform guesses back to nested form (measure[chordRoots[]])
    return guess.reduce((measures, slot) => {
      measures[slot.index] = measures[slot.index] || [];
      measures[slot.index] = measures[slot.index].concat([slot.guess]);
      return measures;
    }, []);
  }

  transpose(song, root) {
    transposeSong(song, root);
    if (this.props.onTransposeInstrument) {
      this.props.onTransposeInstrument(root);
    }
    this.setState({ root });
  }

  render() {
    const song = this.state.song || this.props.data;
    const roots = this.guessRoots(song.sheet);

    if (!song) {
      return 'Select a song';
    }
    return (
      <div className="song">
        <SongSettings
          song={song}
          measures={song.measures}
          onTranspose={(root) => this.transpose(song, root)}
          transposeInstrument={this.props.transposeInstrument}
        />
        <Sheet roots={roots} sheet={song.sheet} highlight={this.state.position} onClickChord={(chord) => this.selectChord(chord)}
          hideFooter={this.state.hideFooter} />
        {/* <ColorTest></ColorTest> */}
        <Band sheet={song.sheet} onChangePosition={(position) => this.setState({ position })} />
      </div >
    );
  }
}
export function SongSettings(props) {
  const root = props.song.key.replace('-', '')
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
        <div>Key: {root}
          {/* <NoteSelect value={root} onChange={(note) => props.onTranspose(note)}></NoteSelect> */}
        </div>
        <div>Instrument: <NoteSelect
          value={props.transposeInstrument} onChange={(note) => props.onTranspose(note)}></NoteSelect>
        </div>
      </div></div>
  );
}

export function NoteSelect(props) {
  return <select onChange={(e) => props.onChange(e.target.value)} defaultValue={props.value}>
    {Note.names(' b')
      .map(note => (<option key={note} value={note}>
        {note}
      </option>))}
  </select>;
}