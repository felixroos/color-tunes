import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import * as Note from 'tonal-note';
import './Explorer.css';
import Chords from './components/Chords';
import { getProps } from './components/Chroma';
import CircleSet from './components/CircleSet';
import Material from './components/Material';
import PianoKeyboard from './components/PianoKeyboard';
import Scales from './components/Scales';
import Score from './components/Score';
import { groupNames, randomChord, randomItem, randomScale } from './components/Symbols';

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
            ordered: true,
            items: [],
            group
        };
    }

    pressedPianoKey(key) {
        const tokens = Note.tokenize(Note.fromMidi(key));
        this.setState({ tonic: tokens[0] + tokens[1] })
    }

    addShape(item) {
        /* this.setState({ items: this.state.items.concat([item]) }) */
        this.setState({ items: [item] });
    }

    removeShape(item) {
        /* this.setState({
            items: this.state.items
                .filter(i => i.root !== item.root && i.symbol !== item.symbol)
        }) */
        this.setState({ items: [] });
    }

    render() {
        let piano, circle, label, score = '';
        const props = getProps(this.state);
        label = <h2>{props.label}</h2>;
        const skeletons = this.state.items.map(item => getProps(item).chroma);

        circle = (<CircleSet
            size="350"
            chroma={props.chroma}
            notes={props.notes}
            ordered={this.state.ordered}
            skeletons={skeletons}
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

        const circles = ['fourths', 'fifths', 'chromatics'].map((circle, index) => {
            return <li key={index} className={this.state.circle === circle ? 'active' : ''} onClick={() => this.setState({ circle })}>{circle}</li>
        });

        const groups = groupNames().map((group, index) => {
            return <li key={index} className={this.state.group === group ? 'active' : ''} onClick={() => this.setState({ group })}>{group}</li>
        });

        const material = <Material key="material" props={props} onClick={(data) => this.setState(data)}
            onMouseEnter={(item) => this.addShape(item)}
            onMouseLeave={(item) => this.removeShape(item)}
        />

        const chordsAndScales = (
            <div key="chordsAndScales">
                <h2>Chords & Scales</h2>
                <Chords group={this.state.group} props={props}
                    onClick={(state) => this.setState(state)}
                    onMouseEnter={(item) => this.addShape(item)}
                    onMouseLeave={(item) => this.removeShape(item)} />
                <Scales group={this.state.group} props={props}
                    onClick={(state) => this.setState(state)}
                    onMouseEnter={(item) => this.addShape(item)}
                    onMouseLeave={(item) => this.removeShape(item)} />
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
                    <h5>Views</h5>
                    <ul>
                        <li className={this.state.flip ? 'active' : ''} onClick={() => this.setState({ flip: !this.state.flip })}>Flip</li>
                        <li className={this.state.ordered ? 'active' : ''} onClick={() => this.setState({ ordered: !this.state.ordered })}>Ordered</li>
                        <li className={!this.state.hidePiano ? 'active' : ''} onClick={() => this.setState({ hidePiano: !this.state.hidePiano })}>Piano</li>
                        <li className={!this.state.hideScore ? 'active' : ''} onClick={() => this.setState({ hideScore: !this.state.hideScore })}>Score</li>
                        <li className={!this.state.hideCircle ? 'active' : ''} onClick={() => this.setState({ hideCircle: !this.state.hideCircle })}>Circle</li>
                    </ul>
                    <h5>Filter</h5>
                    <ul className="scroll">
                        {groups}
                    </ul>
                    <h5>Circle</h5>
                    <ul className="scroll">
                        {circles}
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
