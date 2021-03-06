import React from 'react';
import standards from './assets/standards.json';
import Song from './Song';

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
  render() {
    const songs = standards.map((song, index) => (
      <li key={index}>
        <a onClick={() => this.select(song)} href="#">
          {song.title}
        </a>
      </li>
    ));
    return (
      <div>
        <button onClick={() => this.setState({ song: this.randomSong() })}>
          Zufall
        </button>
        <Song data={this.state.song} />
        <ul>{songs}</ul>
      </div>
    );
  }
}
