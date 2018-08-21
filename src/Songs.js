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
    if (this.state.title) {
      return tunes.filter((tune) => tune.title.toLowerCase().includes(this.state.title.toLowerCase()));
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
        <div className="song-list">
          <input onKeyUp={() => this.setState({ title: this.refs.titleFilter.value })} type="text" ref="titleFilter" />
          <ul>{songs}</ul>
        </div>
        <div className="song-view">
          <button className="random-song" onClick={() => this.setState({ song: this.randomSong() })}>Zufall</button>
          <Song data={this.state.song} />
        </div>
      </div >
    );
  }
}
