import React from 'react';
import Tune from './Tune';
import standards from './assets/standards.json';
import { RealParser } from 'jazzband/lib/RealParser';
import { transposeSong } from './chordScales';

export default class Tunes extends React.Component {
  constructor() {
    super();
    this.state = {
      transposeInstrument: 'Bb',
    };
  }

  componentWillMount() {
    if (!this.state.song) {
      this.select(this.randomSong());
    }
  }
  randomSong() {
    return standards[
      Math.floor(Math.random(standards.length) * standards.length)
    ];
  }

  select(song) { //ireal song
    const parsed = new RealParser(song.music.raw);
    const sheet = parsed.sheet;
    console.log('tokens', parsed.tokens);
    console.log('sheet', sheet);
    song = Object.assign(song, { sheet, measures: parsed.measures });
    transposeSong(song, this.state.transposeInstrument);
    this.setState({ song });
  }

  filterTunes(tunes) {
    if (this.state.title) {
      return tunes.filter((tune) => tune.title.toLowerCase().includes(this.state.title.toLowerCase()));
    }
    if (this.state.formLength) {
      return tunes.filter((tune) => new RealParser(tune.music.raw).measures.length === this.state.formLength);
    }
    return tunes;
  }

  render() {
    const tunes = this.filterTunes(standards)
    const songs = tunes
      .map((song, index) => (
        <li key={index}>
          <a onClick={() => this.select(song)}>
            {song.title}
          </a>
        </li>
      ));

    return (
      <div className="songs">
        <div className="song-list">
          <input onKeyUp={() => this.setState({ title: this.refs.titleFilter.value })} type="text" ref="titleFilter" />
          <ul>{songs}</ul>
        </div>
        <div className="song-view">
          <button className="random-song" onClick={() => this.select(this.randomSong())}>Random Song</button>
          <Tune data={this.state.song} transposeInstrument={this.state.transposeInstrument} onTransposeInstrument={(transposeInstrument) => this.setState({ transposeInstrument })} />
        </div>
      </div >
    );
  }
}
