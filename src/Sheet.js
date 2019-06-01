import React from 'react';
import './sheet.css';
import Chord from './Chord';
import { sheetConfig } from './config';

const cellStyle = {
  flex: `0 0 ${100 / sheetConfig.columns}%`,
  maxWidth: `${100 / sheetConfig.columns}%`
}

class Measure extends React.Component {
  render() {
    const chords = this.props.chords.map((chord, index) => (
      /* highlight={this.props.highlight === index} */
      <Chord
        highlight={this.props.active}
        chord={this.props.idle ? !index ? sheetConfig.repeatedBar : ' ' : chord}
        root={this.props.roots ? this.props.roots[index] : null}
        key={index}
        onClick={() => this.props.onClickChord(chord)}
        harmony={this.props.harmony ? this.props.harmony[index] : null}
      />
    ));
    const signs = this.props.signs || [];
    // TODO: add section + house
    let before = '', after = '', time = '', section = '', house = '', /* comments = '',  */coda = '';
    if (signs.includes('{')) {
      before += ':';
    }
    if (signs.includes('}')) {
      after += ':';
    }
    if (this.props.time) {
      time = this.props.time.split('');
      time = (<span className="time">
        {time[0]}
        <br />
        {time[1]}
      </span>
      );
    }
    if (this.props.section) {
      section = (<span className="section">
        {this.props.section}
      </span>)
    }
    if (this.props.house) {
      house = (<div className="house">
        {this.props.house}
      </div>)
    }
    if (this.props.comments) {
      /* comments = (<div className="comments">
        {this.props.comments.join(' ')}
      </div>) */
    }
    if (this.props.coda) {
      coda = (<div className="section coda">
        coda
      </div>);
    }
    const blockStart = ((this.props.index || 0) % sheetConfig.columns === 0);
    //${this.props.house /* && !this.props.index */ ? ' house' : ''}
    return <div style={cellStyle}
      className={'cell' + (blockStart ? ' block-start' : '') + (this.props.idle ? ' idle' : '')}>
      <div className="cell-header">
        {section}
        {house}
        {coda}
      </div>
      <div className="cell-body">
        {
          (blockStart || time) &&
          <div className="space">
            {time}
          </div>
        }
        <div className={`measure${this.props.active ? ' is-active' : ''}`}>
          <div className="signs">
            {before}
          </div>
          {chords.length ? chords : <div className="chord-name">%</div>}
          <div className="signs">
            {after}
          </div>
        </div>
      </div>
      {/* !this.props.hideFooter ? <div className="cell-footer">
        {comments}
      </div> : '' */}
    </div>
  }
}

export default class Sheet extends React.Component {

  countSpacers(cells) {
    return cells.reduce((spacers, cell) => spacers + (cell.spacer ? 1 : 0), 0);
  }

  addSpacers(sheet) {
    return sheet.reduce((cells, m, index) => {
      let offset = 0;
      const spacers = this.countSpacers(cells);
      const indexWithSpacers = index + spacers;

      if (m.house > 1) {
        const first = sheet.slice(0, index).reverse().find(m => m.house === 1); // house 1 in sheet
        const cellIndex = cells.indexOf(cells.find(c => c.index === first.index)); // index of house 1 in cells
        const spacersTillFirst = this.countSpacers(cells.slice(0, cellIndex)); // spacers till house 1
        if (first) {
          offset = (first.index + spacersTillFirst) % sheetConfig.columns;
        }
      } else if (m.section && indexWithSpacers % sheetConfig.columns !== 0) {
        offset = sheetConfig.columns - (indexWithSpacers % sheetConfig.columns);
      }
      if (offset > 0) {
        cells = cells.concat(new Array(offset).fill({
          spacer: true
        }));
      }
      return cells.concat([m]);
    }, []);
  }

  fixRepeatedBars(sheet) {
    return sheet.map(m => {
      m.chords = m.chords.map(c => c === 'r' ? '%' : c);
      if (!m.chords.length) {
        m.chords = ['%']
      }
      return m
    })
  }

  render() {
    let sheet = this.props.sheet;
    if (!sheet) {
      return '';
    }
    let cells = sheet.map((m, index) => Object.assign(m, { index }));
    cells = this.fixRepeatedBars(cells);
    cells = this.addSpacers(cells);
    /* cells = cells.map(cell => {
      if (cell.chords) {
        cell.chords = [].concat(cell.chords.map(chord => transposeChord(chord, this.props.transpose)));
      }
      return Object.assign({}, cell);
    }); */

    const chords = cells
      .map((cell, index) => {
        if (cell.spacer) {
          return (<div style={cellStyle} className="cell spacer" key={index}></div>);
        }
        return (
          <Measure
            idle={cell.idle}
            section={cell.section}
            house={cell.house}
            coda={cell.coda}
            comments={cell.comments}
            time={cell.time}
            onClickChord={(chord) => this.props.onClickChord(chord)}
            key={index} index={index}
            chords={cell.transposed || cell.chords}
            active={cell.index === this.props.highlight}
            signs={cell.signs}
            roots={this.props.roots[cell.index]} />
        )
      });
    return <div className="sheet">
      {chords}
    </div>
  }
}
