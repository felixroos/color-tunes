import React from 'react';

function readableChord(chord) {
  return chord.replace('^', '△').replace('h', 'ø');
}

export default class Chord extends React.Component {
  render() {
    const colors = this.props.harmony.colors.slice(0, 5).map((color, index) => {
      const style = {
        backgroundColor: `#${color}`,
        opacity: 0.2,
      };
      return (<div className="color-bar" style={style} key={index} />);
    });
    return (
      <div
        className="chord"
        onClick={() => this.props.onClick(this.props.chord)}
      >
        {colors}
        <span className="chord-name">{readableChord(this.props.chord)}</span>
      </div>
    );
  }
}
