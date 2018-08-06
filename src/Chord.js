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

    const activeClass = this.props.highlight ? ' is-active' : '';
    return (
      <div
        className={'chord' + activeClass}
        onClick={() => this.props.onClick(this.props.chord)}
      >
        {colors}
        <span className={'chord-name' + activeClass}>{readableChord(this.props.chord)}</span>
      </div>
    );
  }
}
