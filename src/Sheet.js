import React from 'react';
import './sheet.css';
import Chord from './Chord';
import { matchChordScales } from './chordScales';

class Measure extends React.Component {
  render() {
    const chords = this.props.measure.map((chord, index) => (
      <Chord
        chord={chord}
        key={index}
        onClick={() => this.props.onClickChord(chord)}
        harmony={this.props.harmony[index]}
      />
    ));
    return <div className="measure">{chords}</div>;
  }
}

export default class Sheet extends React.Component {
  render() {
    const measures = this.props.measures;
    const harmony = measures.map((measure, index) => {
      return measure.map((chord, position) => {
        const brothers = [chord];
        if (index || position) {
          // chord before
          if (position > 0) {
            brothers.unshift(measure[position - 1]);
          } else {
            brothers.unshift(
              measures[index - 1][measures[index - 1].length - 1]
            );
          }
        } else {
          brothers.unshift(
            measures[measures.length - 1][
            measures[measures.length - 1].length - 1
            ]
          );
        }
        if (position < measure.length - 1) {
          //chord after
          brothers.push(measure[position + 1]);
        } else if (index < measures.length - 1) {
          brothers.push(measures[index + 1][0]);
        } else {
          brothers.push(measures[0][0]);
        }
        return matchChordScales(...brothers);
      });
    });
    const bars = measures.map((measure, index) => {
      return <Measure measure={measure} harmony={harmony[index]} key={index} onClickChord={(chord) => this.props.onClickChord(chord)} />;
    });
    return <div className="sheet">{bars}</div>;
  }
}
