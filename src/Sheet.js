import React from 'react';
import './sheet.css';
import Chord from './Chord';
import { getMeasure } from 'jazzband/lib/Song';

const font = {
  '{': '',
  '}': '',
  'Q': '',
  'x': '',
  'r': ''
}

class Measure extends React.Component {
  render() {
    const chords = this.props.measure.map((chord, index) => (
      <Chord
        highlight={this.props.highlight === index}
        chord={chord}
        key={index}
        onClick={() => this.props.onClickChord(chord)}
        harmony={this.props.harmony ? this.props.harmony[index] : null}
      />
    ));
    const signs = this.props.signs || [];
    // TODO: add time + section + house
    let before = '', after = '';
    if (signs.includes('{')) {
      before += font['{'];
    }
    if (signs.includes('}')) {
      after += font['}'];
    }
    //${this.props.house /* && !this.props.index */ ? ' house' : ''}
    return <div className={`measure${this.props.active ? ' is-active' : ''}`}>
      <div className="signs">
        {before}
        {signs.filter(s => !['{', '}'].includes(s)).join(' ')}
      </div>
      {chords}
      <div className="signs">
        {after}
      </div>
    </div>;
  }
}

export default class Sheet extends React.Component {
  render() {
    let sheet = this.props.sheet;
    if (sheet) {
      sheet = sheet
        .map(m => getMeasure(m));
      const chords = sheet
        .map((measure, index) => (
          <Measure
            onClickChord={(chord) => this.props.onClickChord(chord)}
            key={index} measure={measure.chords}
            active={index === this.props.highlight}
            signs={measure.signs} />
        ));
      return <div className="sheet">
        <div className="section">
          {chords}
        </div>
      </div>
    }/* 
    const sections = this.props.sections;
    if (sections) {
      return <div className="sheet">
        {
          sections
            .map((section, s) =>
              (<div key={s} className="section">
                {
                  section.bars
                    .map((bar, b) =>
                      (<Measure key={[s, b]} measure={bar} />)
                    ).concat(
                      section.endings
                        .map((ending, h) =>
                          ending.map((bar, i) => (<Measure key={[s, h, i]} house={h + 1} index={i} measure={bar} />))
                        )
                    )
                }
              </div>)
            )
        }
      </div>
    } */
    /* const measures = this.props.measures;
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
    const position = this.props.position || [-1, -1];
    const bars = measures.map((measure, index) => {
      return <Measure
        highlight={position[0] === index ? position[1] : false}
        measure={measure}
        harmony={harmony[index]}
        key={index}
        onClickChord={(chord) => this.props.onClickChord(chord)} />;
    });
    return <div className="sheet">{bars}</div>; */
  }
}
