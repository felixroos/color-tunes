import React from 'react';
import * as Distance from 'tonal-distance';
import * as Note from 'tonal-note';
import * as TonalArray from 'tonal-array';
import * as Interval from 'tonal-interval';
import Chords from './components/Chords';
import { getProps, newTonicState, parallelSymbols } from './components/Chroma';
import { circleIndex, CircleSet } from './components/CircleSet';
import { stepColor } from './components/Colorizer';
import Material from './components/Material';
import Permutator from './components/Permutator';
import Pianist from './components/Pianist';
import PianoKeyboard from './components/PianoKeyboard';
import Scales from './components/Scales';
import Score from './components/Score';
import { groupNames, randomChord, randomItem, randomScale } from './components/Symbols';
import './Explorer.css';

export default class Explorer extends React.Component {
    chromatics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
    defaultGroup = 'Advanced';
    pianist = new Pianist({ intelligentVoicings: false });

    constructor() {
        super();
        const isChord = Math.random() > 0.5;
        const group = this.defaultGroup;
        this.state = {
            circle: 'fourths',
            //tonic: randomItem(this.chromatics),
            tonic: 'C',
            octave: 3,
            scale: 'major',
            //scale: !isChord ? randomScale(group) : null,
            chord: isChord ? randomChord(group) : null,
            history: [],
            extended: true,
            flip: false,
            ordered: true,
            fixedTonic: false,
            fixedOctave: false,
            tonicLast: false,
            tonicInBass: false,
            arpeggiate: true,
            invert: 0,
            order: undefined,
            showSteps: true,
            autoplay: false,
            items: [],
            highlightedNotes: [],
            group
        };
    }

    pressedPianoKey(key) {
        const tokens = Note.tokenize(Note.fromMidi(key));
        this.setState({ tonic: tokens[0] + tokens[1] });
        this.autoplay();
    }

    highlight(highlightedNotes) {
        this.setState({ highlightedNotes })
    }

    unhighlight(notes) {
        const highlightedNotes = this.state.highlightedNotes
            .filter(note => notes.includes(note));
        this.setState({ highlightedNotes })
    }

    positionIndex(order, i, position) {
        order[order.indexOf(i)] = order[position];
        order[position] = i;
        return order;
    }

    randomized(notes) {
        let props = getProps(Object.assign(this.state, { order: null }));
        let order = [].concat(notes).map((n, i) => props.notes.indexOf(n));
        this.setState({ order });
        this.autoplay();
    }

    invert(notes) {
        this.setState({ invert: (this.state.invert + 1) % notes.length });
        this.autoplay();
    }

    newTonic(note) {
        this.setState(newTonicState(note, this.state));
        this.autoplay();
    }

    getStep(chroma, tonic, step = 1) {
        const currentIndex = Note.chroma(tonic);
        const rotated = TonalArray.rotate(currentIndex, chroma.split(''));
        const nextIndices = rotated.reduce((matches, v, i) => {
            if (v === '1') {
                return matches.concat(i);
            }
            return matches;
        }, []).map(i => (i + currentIndex) % 12);
        return this.chromatics[nextIndices[step]];
    }

    fifthDown() {
        if (!this.state.fixedChroma) {
            this.setState(newTonicState(Distance.trFifths(this.state.tonic, -1), this.state));
        } else {
            this.setState(newTonicState(this.getStep(this.state.fixedChroma, this.state.tonic, 3), this.state));
        }
        this.autoplay();
    }

    /** starts from tonic and sets the next note in the given chroma as new tonic */
    nextRoot(chroma, tonic = this.state.tonic) {
        const nextRoot = this.getStep(chroma, tonic, 1);
        this.setState(newTonicState(nextRoot, this.state));
        this.autoplay();
    }

    // TODO: fuse with nextSibling

    nextStep(props, distance = 1) {
        let parallel = [];
        if (props.chord) {
            parallel = parallelSymbols('chord', 'sub', props);
        } else {
            parallel = parallelSymbols('scale', 'roots', props);
        }
        const intervals = parallel.map((p, i) => ({ i, root: p.root, distance: (Interval.semitones(Distance.interval(props.tonic, p.root)) + 12) % 12 }))
            .filter(d => d.distance >= distance)
            .sort((a, b) => a.distance < b.distance ? -1 : 1);
        if (!intervals.length) {
            return;
        }
        const next = parallel[intervals[0].i];
        if (!next) {
            return;
        }
        this.setState(Object.assign({ [props.chord ? 'chord' : 'scale']: next.symbol }, newTonicState(next.root, this.state)));
        this.autoplay();
    }

    nextSibling(props, distance = 1) {
        let parallel = [];
        if (props.chord) {
            parallel = parallelSymbols('chord', 'sub', props);
        } else {
            parallel = parallelSymbols('scale', 'roots', props);
        }
        const intervals = parallel.map((p, i) => ({ i, root: p.root, distance: (Distance.fifths(p.root, props.tonic) + 12) % 12 }))
            .filter(d => d.distance >= distance)
            .sort((a, b) => a.distance < b.distance ? -1 : 1);
        if (!intervals.length) {
            return;
        }
        const next = parallel[intervals[0].i];
        if (!next) {
            return;
        }
        this.setState(Object.assign({ [props.chord ? 'chord' : 'scale']: next.symbol }, newTonicState(next.root, this.state)));
        this.autoplay();
    }

    randomTonic(maxFifthDistance) {
        let newTonic;
        if (!maxFifthDistance) {
            newTonic = randomItem(this.chromatics);
        } else {
            const fifthDistance = (Math.random() > 0.5 ? -1 : 1) * Math.ceil(Math.random() * maxFifthDistance);
            newTonic = Distance.trFifths(this.state.tonic, fifthDistance);
        }
        this.setState(newTonicState(newTonic, this.state));
        this.autoplay();
    }

    randomChordOrScale(keepTonic = false, type) {
        const isChord = type === 'chord' ? true : (type === 'scale' ? false : Math.random() > 0.5);
        const group = this.state.group || this.defaultGroup;
        const newTonic = keepTonic ? this.state.tonic : randomItem(this.chromatics);

        this.setState(Object.assign({
            scale: !isChord ? randomScale(group) : null,
            chord: isChord ? randomChord(group) : null,
            /* order: null, invert: 0, */ oldState: this.state
        }, newTonicState(newTonic, this.state)));
        this.autoplay();
    };

    useData(data) {
        this.setState(Object.assign(data, newTonicState(data.tonic, this.state)));
        this.autoplay();
    }
    /** Calls play if autoplay is set to true */
    autoplay() {
        if (this.state.autoplay) {
            setTimeout(() => {
                const props = getProps(this.state);
                this.pianist.playNotes(props.scorenotes);
            },200)
        }
    }

    render() {
        let piano, circle, label, score = '';
        const props = getProps(this.state);
        label = <h2>{props.label}</h2>;

        const tonicIndex = circleIndex(Note.chroma(props.tonic), true);
        const color = stepColor(tonicIndex, false);
        const bgColor = stepColor(tonicIndex, false, 80);
        const highlight = stepColor(tonicIndex, false, 30);
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
            border: 1px solid ${highlight};
        }

        li.highlight {
            background: ${highlight} !important;
        }
        `;



        circle = (<CircleSet
            size="250"
            chroma={props.chroma}
            order={props.order}
            ordered={this.state.ordered}
            onClick={(note) => this.newTonic(note)}
            origin={props.tonic}
            labels={props.labels}
            flip={this.state.circle === 'fifths'}
            chromatic={this.state.circle === 'chromatics'}
        />);
        score = <Score
            notes={props.scorenotes}
            highlightedNotes={this.state.highlightedNotes}
            highlightColor={color} />;
        piano = (<PianoKeyboard
            width="100%"
            highlightedNotes={this.state.highlightedNotes}
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

        const material = <Material key="material" props={props} onClick={(data) => this.useData(data)} />

        const chordsAndScales = (
            <div key="chordsAndScales">
                <h2>Chords & Scales</h2>
                <Chords group={this.state.group} props={props}
                    onClick={(state) => this.useData(state)} />
                <Scales group={this.state.group} props={props}
                    onClick={(state) => this.useData(state)} />
            </div>);

        let views = [material, chordsAndScales];
        if (this.state.flip) {
            views = views.reverse();
        }


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

                    <h5>Permutator</h5>
                    <Permutator
                        invert={this.state.invert}
                        tonic={props.tonic}
                        fixedChroma={this.state.fixedChroma}
                        notes={props.scorenotes}
                        options={props.options}
                        showSteps={this.state.showSteps}
                        highlightedNotes={this.state.highlightedNotes}
                        onRandom={(random) => this.randomized(random)}
                    />

                    <ul className="scroll">
                        {/* <li>
                            <a onClick={() => this.setState(this.state.oldState)}>back</a>
                        </li> */}
                        <li className={this.state.showSteps ? 'active' : ''} onClick={() => { this.setState({ showSteps: !this.state.showSteps }); }}>steps</li>
                        <li className={!this.state.showSteps ? 'active' : ''} onClick={() => { this.setState({ showSteps: !this.state.showSteps }); }}>intervals</li>

                        <li onClick={() => this.invert(props.notes)} className={this.state.invert > 0 ? 'active' : ''}>
                            inversion {this.state.invert || ''}
                        </li>
                        {/* <li onClick={() => this.shuffle(props.notes)} className={this.state.order ? 'active' : ''}>
                            shuffle {this.state.order ? this.state.order.length : ''}
                        </li> */}
                        <li onClick={() => this.setState({ order: null, invert: 0 })} className={this.state.order || this.state.invert > 0 ? 'parallel' : ''}>
                            clear
                        </li>
                    </ul>
                    <h5>Composer</h5>
                    <ul className="scroll">
                        <li onClick={() => this.setState({ fixedChroma: this.state.fixedChroma ? null : props.chroma, fixedLabel: props.label })} className={this.state.fixedChroma ? 'active' : ''}>
                            {!this.state.fixedChroma ? 'focus' : 'blur'} {this.state.fixedChroma ? this.state.fixedLabel : ''}{/* props.label */}
                        </li>
                        <li onClick={() => this.nextSibling(props)} className={this.state.fixedChroma ? 'active' : ''}>+harmonic sibling</li>
                        <li onClick={() => this.nextStep(props)} className={this.state.fixedChroma ? 'active' : ''}>+sibling</li>
                        <li onClick={() => this.nextRoot(this.state.fixedChroma || props.chroma)} className={this.state.fixedChroma ? 'parallel' : ''}>+step</li>
                        <li onClick={() => this.fifthDown()} className={this.state.fixedChroma ? 'parallel' : ''}>-fifth</li>
                        <li onClick={() => this.randomChordOrScale(this.state.fixedTonic, 'chord')}>% chord</li>
                        <li onClick={() => this.randomChordOrScale(this.state.fixedTonic, 'scale')}>% scale</li>
                        <li onClick={() => this.randomTonic(2)}>% tonic</li>
                        {/* <li className={this.state.fixedTonic ? 'active' : ''} onClick={() => this.setState({ fixedTonic: !this.state.fixedTonic })}>fixedTonic</li> */}
                    </ul>
                    <h5>Pianist</h5>
                    <ul className="scroll">
                        <li onClick={() => this.pianist.playNotes(props.scorenotes)}>play</li>
                        <li className={this.state.autoplay ? 'active' : ''} onClick={() => this.setState({ autoplay: !this.state.autoplay })}>autoplay</li>
                        <li className={this.state.fixedOctave ? 'active' : ''} onClick={() => this.setState({ fixedOctave: !this.state.fixedOctave })}>fixedOctave</li>
                        <li className={this.state.tonicInBass ? 'active' : ''} onClick={() => this.setState({ tonicInBass: !this.state.tonicInBass })}>tonicInBass</li>
                        <li className={this.state.arpeggiate ? 'active' : ''} onClick={() => this.setState({ arpeggiate: !this.state.arpeggiate })}>arpeggiate</li>
                        <li className={this.state.overlap ? 'active' : ''} onClick={() => this.setState({ overlap: !this.state.overlap })}>overlap</li>
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
