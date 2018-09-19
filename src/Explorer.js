import React from 'react';
import * as Distance from 'tonal-distance';
import * as Note from 'tonal-note';
import * as TonalArray from 'tonal-array';
import * as Interval from 'tonal-interval';
import Chords from './components/Chords';
import { getProps, newTonicState, parallelSymbols } from './components/Chroma';
import { circleIndex, CircleSet } from './components/CircleSet';
import { stepColor } from './components/Colorizer';
import { pitchColor, pitchIndex } from './components/Colorizer';
import Material from './components/Material';
import Permutator from './components/Permutator';
import * as jazz from 'jazzband';
import PianoKeyboard from './components/PianoKeyboard';
import Scales from './components/Scales';
import Score from './components/Score';
import { groupNames, randomChord, randomItem, randomScale } from './components/Symbols';
import './Explorer.css';
import { piano } from 'jazzband/demo/samples/piano';
import { randomSynth, randomElement } from 'jazzband/lib/util';
import ColorTest from './tests/ColorTest';
import { colorConfig } from './config';

console.log('jazz', jazz);


export default class Explorer extends React.Component {
    chromatics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
    defaultGroup = 'Advanced';
    context = new AudioContext();
    keyboard = new jazz.Sampler({
        samples: piano, midiOffset: 24, gain: 1, context: this.context,
        onTrigger: ({ on, off, active }) => {
            this.setState({ highlightedNotes: active.map(e => e.note) });
        }
    });
    pulse = new jazz.Pulse({ context: this.context });
    drone = new jazz.Synthesizer({ context: this.context, type: 'triangle' });
    // drone = randomSynth(this.context.destination, ['sine', 'triangle', 'sawtooth'])
    pianist = new jazz.Pianist(this.keyboard, { intelligentVoicings: false });

    constructor() {
        super();
        const isChord = Math.random() > 0.5;
        const group = this.defaultGroup;
        this.state = {
            circle: 'fourths',
            tonic: randomItem(this.chromatics),
            //tonic: 'C',
            octave: 3,
            //scale: 'major',
            scale: !isChord ? randomScale(group) : null,
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
            arpeggioInterval: .7,
            intelligentVoicings: false,
            invert: 0,
            order: undefined,
            showSteps: true,
            autoplay: true,
            items: [],
            highlightedNotes: [],
            fade: .3,
            group
        };
        this.pulse.start();
    }

    pressedPianoKey(key) {
        const note = Note.fromMidi(key);
        this.setState({ highlightedNotes: [note] });
        this.pianist.instrument.playNotes([note], { duration: 1000, pulse: this.pulse });
    }

    /* highlight(highlightedNotes) {
        console.log('highlight..');
        this.setState({ highlightedNotes })
    }

    unhighlight(notes) {
        const highlightedNotes = this.state.highlightedNotes
            .filter(note => notes.includes(note));
        this.setState({ highlightedNotes })
    } */

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

    harmonicSibling(props) {
        let parallel;
        if (props.chord) {
            parallel = parallelSymbols('chord', 'sub', props);
        } else {
            parallel = parallelSymbols('scale', 'roots', props);
        }
        const next = randomElement(parallel);
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
        setTimeout(() => {
            const props = getProps(this.state);
            if (this.state.droneVoices && !this.state.fixedChroma) {
                this.playDrone(props.scorenotes);
            }
            if (this.state.autoplay) {
                this.playPiano(props.scorenotes);
            }
        }, 50);
    }

    playPiano(notes, duration = this.state.arpeggioInterval * 1000, tonic = this.state.tonic) {
        if (!this.state.arpeggiate) {
            duration = 3000;
        }
        this.pianist.playNotes(notes, { duration, tonic, pulse: this.pulse, interval: this.state.arpeggiate ? this.state.arpeggioInterval : 0 })
    }

    toggleDrone(notes) {
        if (this.state.droneVoices) {
            this.stopDrone();
            this.setState({ droneVoices: null });
        } else {
            this.playDrone(notes);
        }
    }

    toggleIntelligentVoicings() {
        this.pianist.props.intelligentVoicings = !this.pianist.props.intelligentVoicings;
        this.setState({ intelligentVoicings: this.pianist.props.intelligentVoicings });
    }

    playDrone(notes) {
        this.stopDrone(notes);
        const droneVoices = this.drone.playNotes(notes, { endless: true, decay: 0, attack: this.state.fade, deadline: 0, sustain: 1, gain: .1 });
        this.setState({ droneVoices })
    }

    stopDrone(keep) {
        if (!this.state.droneVoices) {
            return false;
        }
        const stop = this.state.droneVoices;//.filter(n => !keep.find(k => Note.midi(k) === n.key));
        this.drone.stopVoices(stop, { release: this.state.fade });
        return true;
    }

    render() {
        let piano, circle, label, score = '';
        const props = getProps(this.state);
        label = <h1>{props.label}</h1>;

        /* const tonicIndex = circleIndex(Note.chroma(props.tonic), true); */
        const bgColor = pitchColor(props.tonic, colorConfig.saturationDefault, colorConfig.brightnessDefault);
        const color = pitchColor(props.tonic, colorConfig.saturationActive, colorConfig.brightnessActive);
        const highlight = pitchColor(props.tonic, colorConfig.saturationActive, colorConfig.brightnessActive);
        /* const color = stepColor(tonicIndex, false);
        const bgColor = stepColor(tonicIndex, false, 80);
        const highlight = stepColor(tonicIndex, false, 30); */
        const style = `
        li {
            background:white
        }
        
        li.active {
            background: ${color};
        }
        
        li.sub {
            background: ${bgColor};
        }
        
        li.super {
            border: 2px dotted ${highlight};
        }
        
        li.parallel {
            border: 2px solid ${highlight};
        }

        li.highlight {
            background: ${highlight} !important;
        }
        `;



        circle = (<CircleSet
            size="250"
            width="100%"
            chroma={props.chroma}
            order={props.order}
            ordered={this.state.ordered}
            onClick={(note) => this.newTonic(note)}
            origin={props.tonic}
            labels={props.labels}
            flip={this.state.circle === 'fifths'}
            chromatic={this.state.circle === 'chromatics'}
            highlightedNotes={this.state.highlightedNotes}
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
            <div className="explorer">
                <style>
                    {style}
                </style>
                <div className="symbols">
                    <div className="explorer-content">
                        {label}
                        {!this.state.hideScore ? score : ''}
                        {!this.state.hidePiano ? piano : ''}


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
                            onClickStep={(step, note, index) => this.playPiano([note])}
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
                                {!this.state.fixedChroma ? 'focus' : 'blur'} {this.state.fixedChroma ? this.state.fixedLabel : props.label}
                            </li>
                            <li onClick={() => this.nextSibling(props)} className={this.state.fixedChroma ? 'active' : ''}>+harmonic sibling</li>
                            <li onClick={() => this.nextStep(props)} className={this.state.fixedChroma ? 'active' : ''}>+sibling</li>
                            <li onClick={() => this.harmonicSibling(props)} className={this.state.fixedChroma ? 'active' : ''}>% harmonic sibling</li>
                        </ul>
                        <ul className="scroll">
                            <li onClick={() => this.nextRoot(this.state.fixedChroma || props.chroma)} className={this.state.fixedChroma ? 'parallel' : ''}>+step</li>
                            <li onClick={() => this.fifthDown()} className={this.state.fixedChroma ? 'parallel' : ''}>-fifth</li>
                            <li onClick={() => this.randomTonic(2)}>% tonic</li>
                            <li onClick={() => this.randomChordOrScale(this.state.fixedTonic, 'chord')}>% chord</li>
                            <li onClick={() => this.randomChordOrScale(this.state.fixedTonic, 'scale')}>% scale</li>
                            {/* <li className={this.state.fixedTonic ? 'active' : ''} onClick={() => this.setState({ fixedTonic: !this.state.fixedTonic })}>fixedTonic</li> */}
                        </ul>
                        <h5>Drone / Piano</h5>
                        <ul className="scroll">
                            <li onClick={() => this.playPiano(props.scorenotes)}>play piano</li>
                            <li className={this.state.arpeggiate ? 'active' : ''} onClick={() => this.setState({ arpeggiate: !this.state.arpeggiate })}>arpeggiate piano</li>
                            <li className={this.state.autoplay ? 'active' : ''} onClick={() => this.setState({ autoplay: !this.state.autoplay })}>autoplay</li>
                            <li className={this.state.droneVoices ? 'active' : ''} onClick={() => this.toggleDrone(props.scorenotes)}>play drone</li>
                            <li className={this.state.intelligentVoicings ? 'active' : ''} onClick={() => this.toggleIntelligentVoicings()}>intelligent voicings</li>
                            {/* <li className={this.state.fixedOctave ? 'active' : ''} onClick={() => this.setState({ fixedOctave: !this.state.fixedOctave })}>fixedOctave</li> */}
                            {/* <li className={this.state.tonicInBass ? 'active' : ''} onClick={() => this.setState({ tonicInBass: !this.state.tonicInBass })}>tonicInBass</li> */}
                            {/* <li className={this.state.overlap ? 'active' : ''} onClick={() => this.setState({ overlap: !this.state.overlap })}>overlap</li> */}
                        </ul>
                        {/* <ColorTest></ColorTest> */}
                    </div>
                    <div className="aside">
                        <div className="circle">
                            {!this.state.hideCircle ? circle : ''}
                        </div>
                        <div className="scroll-content">
                            <ul className="scroll">
                                {groups}
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

                            <h5>Circle</h5>
                            <ul className="scroll">
                                {circles}
                                <li className={this.state.ordered ? 'active' : ''} onClick={() => this.setState({ ordered: !this.state.ordered })}>show order</li>
                            </ul>
                            <h2>Help</h2>
                            This tool visualizes the connection between musical chords and scales. The colors have the following meanings:
                        <ul>
                                <li className="active">currently selected</li>
                                <li className="parallel">equal notes</li>
                                <li className="sub">abstraction</li>
                                <li className="super">extension</li>
                            </ul>
                            <p><strong>abstraction</strong> = less notes</p>
                            <p><strong>extension</strong> = more notes</p>
                            You can change the current root by clicking the desired note in the circle.<br />
                            In the Material view, all listed chords and scales are abstractions or extensions but only the ones with the current selected root are highlighted.<br />
                            You can filter the displayed chords and scales to focus on specific groups of symbols.<br />
                            <strong>Pro Tip: </strong> You scroll/swipe the listings horizontally!
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}
