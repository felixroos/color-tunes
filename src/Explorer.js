import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import * as Note from 'tonal-note';
import './Explorer.css';
import Chords from './components/Chords';
import { getProps } from './components/Chroma';
import { CircleSet, circleIndex } from './components/CircleSet';
import { stepColor } from './components/Colorizer';
import Material from './components/Material';
import PianoKeyboard from './components/PianoKeyboard';
import Scales from './components/Scales';
import Score from './components/Score';
import { groupNames, randomChord, randomItem, randomScale } from './components/Symbols';
import { sounds } from './assets/sounds/sounds.js';

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
            rotate: 0,
            order: undefined,
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

    shuffle(notes) {
        this.setState({
            order: notes.map((n, i) => i).sort(() => 1 - 2 * Math.random())
        })
    }

    newTonic(note) {
        const simple = Note.simplify(note);
        const newTonic = this.state.tonic !== simple ? simple : Note.enharmonic(simple);
        this.setState({ tonic: newTonic });
    }

    randomChordOrScale(keepTonic = false, type) {
        const isChord = type === 'chord' ? true : (type === 'scale' ? false : Math.random() > 0.5);
        const group = this.state.group || 'Advanced';
        this.setState({
            tonic: keepTonic ? this.state.tonic : randomItem(this.chromatics),
            scale: !isChord ? randomScale(group) : null,
            chord: isChord ? randomChord(group) : null,
            order: null, rotate: 0
        });
        if (isChord) {
            setTimeout(() => {
                this.listen();
            })
        }
    };

    listen() {
        getProps(this.state).notes.forEach(note => {
            const index = Note.chroma(note) + 36;
            var audio = new Audio(sounds[index - 16]);
            audio.play();
            /* console.warn('Audio is currently not available'); */
        });
    }

    render() {
        let piano, circle, label, score = '';
        const props = getProps(this.state);
        label = <h2>{props.label}</h2>;
        // const skeletons = this.state.items.map(item => getProps(item).chroma);
        // skeletons={skeletons}
        const order = props.notes.map(note => Note.props(note).chroma);

        circle = (<CircleSet
            size="350"
            chroma={props.chroma}
            order={order}
            ordered={this.state.ordered}
            onClick={(note) => this.newTonic(note)}
            origin={props.tonic}
            labels={props.labels}
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

        const tonicIndex = circleIndex(Note.chroma(props.tonic), true);

        const color = stepColor(tonicIndex, false);
        const bgColor = stepColor(tonicIndex, false, 80);
        const style = `
        li.active {
            background: ${color};
        }
        
        li.sub {
            background: ${bgColor};
        }
        
        li.super {
            background: #eee;
        }
        
        li.parallel {
            border: 1px solid ${color};
        }
        `;
        // TODO: preview chord/scale on hover in circle (under current)
        return (
            <div className="explorer" >
                <style>
                    {style}
                </style>
                <div className="symbols">
                    {label}
                    {!this.state.hidePiano ? piano : ''}
                    {!this.state.hideScore ? score : ''}

                    {!this.state.hideCircle ? circle : ''}

                    <ul className="action-buttons">
                        <li>
                            <a onClick={() => this.setState({ rotate: (this.state.rotate + 1) % props.notes.length })}>ROTATE</a>
                        </li>
                        <li>
                            <a onClick={() => this.shuffle(props.notes)}>SHUFFLE</a>
                        </li>
                        <li>
                            <a onClick={() => this.setState({ order: null, rotate: 0 })}>CLEAR</a>
                        </li>
                        <li>
                            <a onClick={() => this.randomChordOrScale(true, 'chord')}>% CHORD</a>
                        </li>
                        <li>
                            <a onClick={() => this.randomChordOrScale(true, 'scale')}>% SCALE</a>
                        </li>
                        <li>
                            <a onClick={() => this.listen(props.notes)}>LISTEN</a>
                        </li>
                    </ul>
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
