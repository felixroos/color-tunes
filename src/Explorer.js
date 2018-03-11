import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as Scale from 'tonal-scale';
import PianoKeyboard from './components/PianoKeyboard';
import Score from './components/Score';
import CircleSet from './components/CircleSet';
import {
    symbolName,
    scaleNames,
    chordNames,
    chordName,
    groupNames,
    randomChord,
    randomScale,
    randomItem
} from './components/Symbols';
import {
    parallelSymbols,
    getProps
} from './components/Chroma'
import './Explorer.css';

export default class Explorer extends React.Component {
    chromatics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

    constructor() {
        super();
        const isChord = Math.random() > 0.5;
        const group = 'Advanced';
        this.state = {
            circle: 'fourths',
            tonic: randomItem(this.chromatics),
            scale: !isChord ? randomScale(group) : null,
            chord: isChord ? randomChord(group) : null,
            history: [],
            extended: true,
            flip: false,
            group
        };
    }

    pressedPianoKey(key) {
        const tokens = Note.tokenize(Note.fromMidi(key));
        this.setState({ tonic: tokens[0] + tokens[1] })
    }

    symbolClasses(type, symbol, props, differentRoot) {
        if (this.state[type] && this.state[type] === symbol && !differentRoot) {
            return 'active';
        }
        const brothers = props.parallels[type + 's']
            .filter(item => item.roots.length)
            .filter(parallel => parallel.symbol === symbol);
        if (brothers.length) {
            return 'parallel'; // TODO: also check classes below and dont stop here
        }
        if (!differentRoot && props.supersets[type + 's'].indexOf(symbol) !== -1) {
            return 'super';
        }
        if (!differentRoot && props.subsets[type + 's'].indexOf(symbol) !== -1) {
            return 'sub';
        }

    }

    symbolList(type, items, props) {
        return items.map((item, index) =>
            <li key={index}
                className={this.symbolClasses(type, item.symbol, props, this.state.tonic !== item.root)}
                onClick={() => this.setState({
                    [type]: item.symbol,
                    [type === 'scale' ? 'chord' : 'scale']: null,
                    tonic: item.root
                })}
                onMouseEnter={() => console.log('mouseenter', item.symbol)}>
                {item.root}{type === 'scale' ? ' ' : ''}{symbolName(type, item.symbol)}
            </li>);
    }

    render() {
        let piano, circle, label, score = '';
        const props = getProps(this.state);
        label = <h2>{props.label}</h2>;
        circle = (<CircleSet
            size="350"
            chroma={props.chroma}
            onClick={(note) => this.setState({ tonic: note })}
            tonic={props.tonic}
            labels={this.chromatics}
            flip={this.state.circle === 'fifths'}
            chromatic={this.state.circle === 'chromatics'}
        />);
        score = <Score notes={props.scorenotes} />;
        piano = (<PianoKeyboard
            width="100%"
            setChroma={props.chroma}
            setTonic={Note.chroma(props.tonic)}
            onClick={(key) => this.pressedPianoKey(key)}
            minOct={1}
            maxOct={5}
            notes={props.notes}
        />);
        const chords = chordNames(this.state.group)
            .sort((a, b) => {
                return Chord.notes(props.tonic + a).length < Chord.notes(props.tonic + b).length ? -1 : 1;
            });
        const chordGroups = chords.reduce((groups, chord, index) => {
            const n = Chord.notes(props.tonic + chord).length;
            if (!groups[n]) {
                groups[n] = [];
            }
            groups[n].push(chord);
            groups[n] = groups[n].sort((a, b) => a.length < b.length ? -1 : 1);
            return groups;
        }, []).map(group =>
            group.map((chord, index) => (
                (<li key={index} className={this.symbolClasses('chord', chord, props)} onClick={() => this.setState({ scale: null, chord })}>{chordName(chord)} </li>)
            )))
            .slice(1).map((group, index) => (
                <div key={index}>
                    <ul key={index} className="scroll">
                        {group}
                    </ul>
                </div>));

        const scales = scaleNames(this.state.group)
            .sort((a, b) => {
                return Scale.notes(props.tonic, a).length < Chord.notes(props.tonic, b).length ? -1 : 1;
            });
        const scaleGroups = scales.reduce((groups, scale, index) => {
            const n = Scale.notes(props.tonic, scale).length;
            if (!groups[n]) {
                groups[n] = [];
            }
            groups[n].push(scale);
            groups[n] = groups[n].sort((a, b) => a.length < b.length ? -1 : 1);
            return groups;
        }, []).map(group =>
            group.map((scale, index) => (
                (<li key={index} className={this.symbolClasses('scale', scale, props)} onClick={() => this.setState({ chord: null, scale })}>{symbolName('scale', scale)} </li>)
            )))
            .slice(1).map((group, index) => (
                <div key={index}>
                    <ul key={index} className="scroll">
                        {group}
                    </ul>
                </div>));
        const circles = ['fourths', 'fifths', 'chromatics'].map((circle, index) => {
            return <li key={index} className={this.state.circle === circle ? 'active' : ''} onClick={() => this.setState({ circle })}>{circle}</li>
        });

        const groups = groupNames().map((group, index) => {
            return <li key={index} className={this.state.group === group ? 'active' : ''} onClick={() => this.setState({ group })}>{group}</li>
        });
        const similarChords = parallelSymbols('chord', 'roots', props);
        const similarScales = parallelSymbols('scale', 'roots', props);
        const subChords = parallelSymbols('chord', 'sub', props);
        const subScales = parallelSymbols('scale', 'sub', props);
        const superChords = parallelSymbols('chord', 'super', props);
        const superScales = parallelSymbols('scale', 'super', props);
        const material = (
            <div key="material">
                <h2>Material</h2>
                {subChords.length ? <ul className="scroll">
                    {this.symbolList('chord', subChords, props)}
                </ul> : ''}
                {subScales.length ? <ul className="scroll">
                    {this.symbolList('scale', subScales, props)}
                </ul> : ''}
                {(similarChords.concat(similarScales)).length ? <ul className="scroll">
                    {this.symbolList('chord', similarChords, props)}
                    {this.symbolList('scale', similarScales, props)}
                </ul> : ''}
                {superChords.length ? <ul className="scroll">
                    {this.symbolList('chord', superChords, props)}
                </ul> : ''}
                {superScales.length ? <ul className="scroll">
                    {this.symbolList('scale', superScales, props)}
                </ul> : ''}
            </div>);
        const chordsAndScales = (
            <div key="chordsAndScales">
                <h2>Chords & Scales</h2>
                {chordGroups}
                {scaleGroups}
            </div>);
        let views = [material, chordsAndScales];
        if (this.state.flip) {
            views = views.reverse();
        }
        // TODO: preview chord/scale on hover in circle (under current)
        return (
            <div className="explorer" >
                <div className="symbols">
                    {label}
                    {!this.state.hidePiano ? piano : ''}
                    {!this.state.hideScore ? score : ''}
                    {!this.state.hideCircle ? circle : ''}
                    {views}
                    <h2>Settings</h2>
                    <h5>Filter</h5>
                    <ul className="scroll">
                        {groups}
                    </ul>
                    <h5>Circle</h5>
                    <ul className="scroll">
                        {circles}
                    </ul>
                    <h5>Views</h5>
                    <ul>
                        <li className={this.state.flip ? 'active' : ''} onClick={() => this.setState({ flip: !this.state.flip })}>Flip</li>
                        <li className={!this.state.hidePiano ? 'active' : ''} onClick={() => this.setState({ hidePiano: !this.state.hidePiano })}>Piano</li>
                        <li className={!this.state.hideScore ? 'active' : ''} onClick={() => this.setState({ hideScore: !this.state.hideScore })}>Score</li>
                        <li className={!this.state.hideCircle ? 'active' : ''} onClick={() => this.setState({ hideCircle: !this.state.hideCircle })}>Circle</li>
                    </ul>
                    <h2>Help</h2>
                    This tool visualizes the connection between musical chords and scales. The colors have the following meanings:
                    <ul>
                        <li className="active">currently selected</li>
                        <li className="parallel">has equal structure (same shape/intervals)</li>
                        <li className="sub">abstraction of the current selection (less notes)</li>
                        <li className="super">extension of the current selection (more notes)</li>
                    </ul>
                    You can change the current root by pressing a piano key or clicking the note in the circle.<br />
                    In the Material view, all listed chords and scales are abstractions or extensions but only the ones with the current selected root are highlighted.<br />
                    You can filter the displayed chords and scales to focus on specific connections.<br />
                    <strong>Pro Tip: </strong> You scroll/swipe the listings horizontally!
                </div>
            </div >
        );
    }
}
