import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import * as Note from 'tonal-note';
import * as Distance from 'tonal-distance';
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
import * as WAAClock from 'waaclock';
import { Interval } from 'tonal';

export default class Explorer extends React.Component {
    chromatics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

    constructor() {
        super();
        const isChord = Math.random() > 0.5;
        const group = 'Advanced';
        this.state = {
            circle: 'fourths',
            tonic: randomItem(this.chromatics),
            octave: 3,
            scale: !isChord ? randomScale(group) : null,
            chord: isChord ? randomChord(group) : null,
            history: [],
            extended: true,
            flip: false,
            ordered: true,
            fixedTonic: false,
            fixedOctave: false,
            rotate: 0,
            order: undefined,
            autoplay: true,
            items: [],
            group
        };
    }

    pressedPianoKey(key) {
        const tokens = Note.tokenize(Note.fromMidi(key));
        this.setState({ tonic: tokens[0] + tokens[1], octave: parseInt(tokens[2]) });
        this.autoplay();
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
        });
        this.autoplay();
    }

    rotate(notes) {
        this.setState({ rotate: (this.state.rotate + 1) % notes.length });
        this.autoplay();
    }


    smallestInterval(origin, target) {
        const interval = Distance.interval(origin, target);
        let up = Interval.semitones(interval) % 12; // BUG: Interval.semitones('0A') is NaN instead of 0
        let down = Interval.semitones(Interval.invert(interval)) % 12;
        return up > down ? '-' + Interval.fromSemitones(Math.abs(down)) : Interval.fromSemitones(Math.abs(up));
    }

    newTonicState(tonic, fixedOctave = this.state.fixedOctave) {
        const smallestInterval = this.smallestInterval(this.state.tonic, tonic);
        let newTonic = Note.simplify(Distance.transpose(this.state.tonic + this.state.octave, smallestInterval));

        if (Note.props(newTonic).pc === this.state.tonic) {
            newTonic = Note.enharmonic(newTonic);
        }
        const octave = !fixedOctave ? Note.props(newTonic).oct : this.state.octave;
        const pc = Note.props(newTonic).pc;
        // console.log(`${this.state.tonic}${this.state.octave} > ${tonic} = ${smallestInterval} > ${tonic}${octave}`);
        return { tonic: pc, octave: octave || this.state.octave };
    }

    newTonic(note) {
        this.setState(this.newTonicState(note));
        this.autoplay();
    }

    randomChordOrScale(keepTonic = false, type) {
        const isChord = type === 'chord' ? true : (type === 'scale' ? false : Math.random() > 0.5);
        const group = this.state.group || 'Advanced';
        const newTonic = keepTonic ? this.state.tonic : randomItem(this.chromatics);

        this.setState(Object.assign({
            scale: !isChord ? randomScale(group) : null,
            chord: isChord ? randomChord(group) : null,
            order: null, rotate: 0
        }, this.newTonicState(newTonic)));

        this.autoplay(isChord);
    };

    loadSound(src, context) {
        const source = context.createBufferSource();
        return fetch(src)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                return new Promise((resolve, reject) => {
                    context.decodeAudioData(buffer, (decodedData) => {
                        source.buffer = decodedData;
                        source.connect(context.destination);
                        resolve(source);
                    });
                })
            });
    }

    loadSounds(sources, context) {
        sources.forEach((source, i) => {
            if (!source) {
                console.warn(`note at index ${i} cannot be played!`);
            }
        })
        return Promise.all(sources.filter(source => !!source).map(source => this.loadSound(source, context)));
    }

    playNotes(scorenotes, interval = 0, offset = 36) {
        const context = new AudioContext();
        const clock = new WAAClock(context);
        clock.start();
        this.loadSounds(scorenotes.map(note => sounds[Note.props(note).midi - offset]), context)
            .then(sounds => {
                sounds.forEach((sound, i) => {
                    if (interval === 0) {
                        sound.start(0);
                    } else {
                        clock.setTimeout(function (event) {
                            sound.start(0);
                        }, interval * i);
                    }
                })
            });
    }



    listen(harmonic = false) {
        const bpm = 320;
        this.playNotes(getProps(this.state).scorenotes, harmonic ? 0 : 60 / bpm);
    }

    autoplay(harmonic = false) {
        if (this.state.autoplay) {
            setTimeout(() => this.listen(harmonic));
        }
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
            notes={props.notes}
            scorenotes={props.scorenotes}
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
                            <a onClick={() => this.rotate(props.notes)}>ROTATE</a>
                        </li>
                        <li>
                            <a onClick={() => this.shuffle(props.notes)}>SHUFFLE</a>
                        </li>
                        <li>
                            <a onClick={() => this.setState({ order: null, rotate: 0 })}>CLEAR</a>
                        </li>
                        <li>
                            <a onClick={() => this.randomChordOrScale(this.state.fixedTonic, 'chord')}>% CHORD</a>
                        </li>
                        <li>
                            <a onClick={() => this.randomChordOrScale(this.state.fixedTonic, 'scale')}>% SCALE</a>
                        </li>
                        <li>
                            <a onClick={() => this.listen()}>LISTEN</a>
                        </li>
                    </ul>
                    {views}
                    <h2>Settings</h2>
                    <h5>Views</h5>
                    <ul>
                        <li className={this.state.flip ? 'active' : ''} onClick={() => this.setState({ flip: !this.state.flip })}>Flip</li>
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
                        <li className={this.state.ordered ? 'active' : ''} onClick={() => this.setState({ ordered: !this.state.ordered })}>show order</li>
                    </ul>
                    <h5>Player</h5>
                    <ul className="scroll">
                        <li className={this.state.autoplay ? 'active' : ''} onClick={() => this.setState({ autoplay: !this.state.autoplay })}>Autoplay</li>
                        <li className={this.state.fixedTonic ? 'active' : ''} onClick={() => this.setState({ fixedTonic: !this.state.fixedTonic })}>fixedTonic</li>
                        <li className={this.state.fixedOctave ? 'active' : ''} onClick={() => this.setState({ fixedOctave: !this.state.fixedOctave })}>fixedOctave</li>
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
