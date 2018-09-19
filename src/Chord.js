import React from 'react';
import { getTonalChord } from './chordScales';
import { pitchColor } from './components/Colorizer';
import { colorConfig, sheetConfig } from './config';

function readableChord(chord) {
  if (!chord) {
    return 'N.C.';
  }
  chord = getTonalChord(chord);
  return chord
    .replace('-7M', '-△7')
    .replace('M', '△')
    .replace('m', '-')
    .replace('o', 'ø')
    .replace('x', '%')
    .replace('r', '%')
}

export default class Chord extends React.Component {


  render() {
    const style = {
      backgroundColor: pitchColor(this.props.root,
        this.props.highlight ? colorConfig.saturationActive : colorConfig.saturationDefault,
        this.props.highlight ? colorConfig.brightnessActive : colorConfig.brightnessDefault),
    };

    const activeClass = this.props.highlight ? ' is-active' : '';

    return (
      <div
        className={'chord' + activeClass}
        style={style}
        onClick={() => this.props.onClick(this.props.chord)}
      >
        <span className={'chord-name' + activeClass}>{readableChord(this.props.chord)}</span>
      </div>
    );
  }
}
