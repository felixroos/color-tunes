import React from 'react';
import Song from './Song';
import standards from './assets/standards.json';

export default class Songs extends React.Component {
  constructor() {
    super();
    this.state = {
      song: this.randomSong()
    };
  }
  randomSong() {
    return standards[
      Math.floor(Math.random(standards.length) * standards.length)
    ];
  }
  select(song) {
    this.setState({ song });
  }

  filterTunes(tunes) {
    if (this.state.length) {
      return tunes.filter((tune) => tune.music.measures.length === parseInt(this.state.length));
    }
    return tunes;
  }

  render() {
    const songs = this.filterTunes(standards)
      .map((song, index) => (
        <li key={index}>
          <a onClick={() => this.select(song)}>
            {song.title}
          </a>
        </li>
      ));
    return (
      <div className="songs">
        <button onClick={() => this.setState({ song: this.randomSong() })}>
          Zufall
        </button>
        <Song data={this.state.song} />
        <label>Measures<br />
          <input type="number" ref="lengthFilter" />
        </label>
        <br />
        <button onClick={() => this.setState({ length: this.refs.lengthFilter.value })}>
          Filter
        </button>
        <ul>{songs}</ul>
      </div >
    );
  }
}
