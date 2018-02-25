import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import { transpose } from 'tonal';
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as PcSet from 'tonal-pcset';
import * as Scale from 'tonal-scale';
import PianoKeyboard from './components/PianoKeyboard';
import Score from './components/Score';
import CircleSet from './components/CircleSet';
/* import * as Interval from 'tonal-interval'; */
/* import * as Distance from "tonal-distance" */

import './Explorer.css';

const center = pc =>
    pc ? (pc[0] === "A" || pc[0] === "B" ? pc + 3 : pc + 4) : null;

export default class Explorer extends React.Component {
    chromatics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

    constructor() {
        super();
        this.state = {
            circle: 'fourths',
            tonic: 'C',
            chord: 'o',
            history: [],
            extended: true
        };
    }

    pressedPianoKey(key) {
        const tokens = Note.tokenize(Note.fromMidi(key));
        this.setState({ tonic: tokens[0] + tokens[1] })
    }

    removeOctaves(notes) {
        return notes.map(note => Note.tokenize(note)).map(tokens => tokens[0] + tokens[1]);
    }


    /* noteClass(note, state, notes) {
        if (state.tonic === note) {
            return 'active';
        }
        if (notes.indexOf(note) !== -1) {
            return 'sub';
        }
    } */
    /* const tonics = this.chromatics
        .map((tonic, index) =>
            (<li key={index} className={noteClass(tonic, this.state, notes)} onClick={() => this.setState({ tonic })}>{tonic}</li>)
        ) */

    chordChroma(tonic, symbol) {
        const notes = this.removeOctaves(Chord.notes(tonic + symbol));
        return PcSet.chroma(notes);
    }

    scaleChroma(tonic, scale) {
        const notes = this.removeOctaves(Scale.notes(tonic, scale));
        return PcSet.chroma(notes);
    }

    chromaParallels(chroma) {
        return {
            scales: Scale.names().map(type => {
                return {
                    symbol: type,
                    roots: this.chromatics.filter(root => {
                        return this.scaleChroma(root, type) === chroma
                    })
                }
            }).filter(p => p.roots.length),
            chords: Chord.names().map(type => {
                return {
                    symbol: type,
                    roots: this.chromatics.filter(root => {
                        return this.chordChroma(root, type) === chroma
                    })
                }
            }).filter(p => p.roots.length)
        };
    }

    supersets(type, isScale) {
        const isSuperset = PcSet.isSupersetOf((isScale ? Scale : Chord).intervals(type));
        return {
            scales: isScale ? Scale.supersets(type) :
                Scale.names().filter(scale =>
                    isSuperset(Scale.intervals(scale))),
            chords: !isScale ? Chord.supersets(type) :
                Chord.names().filter(chord =>
                    isSuperset(Chord.intervals(chord))),
        };
    }

    subsets(type, isScale) {
        const isSubset = PcSet.isSubsetOf((isScale ? Scale : Chord).intervals(type));
        return {
            scales: isScale ? Scale.subsets(type) :
                Scale.names().filter(scale =>
                    isSubset(Scale.intervals(scale))),
            chords: !isScale ? Chord.subsets(type) :
                Chord.names().filter(chord =>
                    isSubset(Chord.intervals(chord))),
        };
    }

    chordClasses(chord, parallels, supersets, subsets, notactive) {
        if (this.state.chord === chord && !notactive) {
            return 'active';
        }
        const brothers = parallels.chords.filter(parallel => parallel.symbol === chord);
        if (brothers.length) {
            return 'parallel';
        }
        if (supersets.chords.indexOf(chord) !== -1) {
            return 'super';
        }
        if (subsets.chords.indexOf(chord) !== -1) {
            return 'sub';
        }
    }

    scaleClasses(scale, parallels, supersets, subsets, notactive) {
        if (this.state.scale === scale && !notactive) {
            return 'active';
        }
        const brothers = parallels.scales.filter(parallel => parallel.symbol === scale);
        if (brothers.length) {
            return 'parallel';
        }
        if (supersets.scales.indexOf(scale) !== -1) {
            return 'super';
        }
        if (subsets.scales.indexOf(scale) !== -1) {
            return 'sub';
        }
    }

    render() {
        let piano, circle, label, score = '';
        let tonic, chroma, scorenotes, notes = [];
        let parallels = [], subsets, supersets;

        if (!this.state.tonic) {
            return;
        }
        tonic = this.state.tonic;
        if (this.state.scale) {
            notes = this.removeOctaves(Scale.notes(tonic, this.state.scale));
            chroma = PcSet.chroma(notes);
            const intervals = Scale.intervals(this.state.scale);
            scorenotes = intervals.map(transpose(center(tonic)));
            label = <h2>{tonic} {this.state.scale}</h2>;
            parallels = this.chromaParallels(chroma);
            subsets = this.subsets(this.state.scale, true)
            supersets = this.supersets(this.state.scale, true)

        }
        if (this.state.chord) {
            const chord = tonic + this.state.chord;
            // TODO: bug resport: 4 and 5 chords (possibly more) do not omit the octave after the notes
            notes = this.removeOctaves(Chord.notes(chord));
            const intervals = Chord.intervals(chord);
            scorenotes = intervals.map(transpose(center(tonic)));
            chroma = this.chordChroma(this.state.tonic, this.state.chord);
            parallels = this.chromaParallels(chroma);
            label = <h2>{chord}</h2>;
            subsets = this.subsets(this.state.chord, false)
            supersets = this.supersets(this.state.chord, false)
        }

        /* console.log('intervals', intervals); */

        // TODO: use fitting note labels (sharp/flat)
        /* let labels = Scale.intervals('chromatic')
            .map(transpose(center(tonic)))
            .map(note => Note.tokenize(note))
            .map(tokens => tokens[0] + tokens[1]);
    
        const semitones = Distance.semitones('C', labels[0]);
        labels = labels.slice(-1 * semitones).concat(labels.slice(0, 12 - semitones));
        console.log('labels', labels); */

        // notes={labels}
        circle = (<CircleSet
            size="300"
            chroma={chroma}
            onClick={(note) => this.setState({ tonic: note })}
            tonic={tonic}
            labels={this.chromatics}
            flip={this.state.circle === 'fifths'}
            chromatic={this.state.circle === 'chromatics'}
        />);
        score = <Score notes={scorenotes} />;
        // setTonic={Note.chroma(tokens[0])}
        piano = (<PianoKeyboard
            width="100%"
            setChroma={chroma}
            setTonic={Note.chroma(tonic)}
            onClick={(key) => this.pressedPianoKey(key)}
            minOct={1}
            maxOct={7}
            notes={notes}
        />);

        const chords = Chord.names()
            .sort((a, b) => {
                return Chord.notes(tonic + a).length < Chord.notes(tonic + b).length ? -1 : 1;
            });
        const chordGroups = chords.reduce((groups, chord, index) => {
            const n = Chord.notes(tonic + chord).length;
            if (!groups[n]) {
                groups[n] = [];
            }
            groups[n].push(chord);
            groups[n] = groups[n].sort((a, b) => a.length < b.length ? -1 : 1);
            return groups;
        }, []).map(group =>
            group.map((chord, index) => (
                (<li key={index} className={this.chordClasses(chord, parallels, supersets, subsets)} onClick={() => this.setState({ scale: null, chord })}>{chord}</li>)
            )))
            .slice(1).map((group, index) => (
                <div key={index}>
                    {/* <strong>{index + 1} Notes</strong> */}
                    <ul key={index}>
                        {group}
                    </ul>
                </div>));

        const scales = Scale.names()
            .sort((a, b) => {
                return Scale.notes(tonic, a).length < Chord.notes(tonic, b).length ? -1 : 1;
            });

        const scaleGroups = scales.reduce((groups, scale, index) => {
            const n = Scale.notes(tonic, scale).length;
            if (!groups[n]) {
                groups[n] = [];
            }
            groups[n].push(scale);
            groups[n] = groups[n].sort((a, b) => a.length < b.length ? -1 : 1);
            return groups;
        }, []).map(group =>
            group.map((scale, index) => (
                (<li key={index} className={this.scaleClasses(scale, parallels, supersets, subsets)} onClick={() => this.setState({ chord: null, scale })}>{scale}</li>)
            )))
            .slice(1).map((group, index) => (
                <div key={index}>
                    {/* <strong>{index + 1} Notes</strong> */}
                    <ul key={index}>
                        {group}
                    </ul>
                </div>));


        const circles = ['fourths', 'fifths', 'chromatics'].map((circle, index) => {
            return <li key={index} className={this.state.circle === circle ? 'active' : ''} onClick={() => this.setState({ circle })}>{circle}</li>
        });

        const similarChords = parallels.chords.reduce((chords, chord, index) => {
            return chords.concat(chord.roots.map(root => ({ root, symbol: chord.symbol })));
        }, []).map((chord, index) => <li key={index} className={this.chordClasses(chord.symbol, parallels, supersets, subsets, this.state.tonic !== chord.root)} onClick={() => this.setState({ scale: null, chord: chord.symbol, tonic: chord.root })}>{chord.root}{chord.symbol}</li>);

        const similarScales = parallels.scales.reduce((scales, scale, index) => {
            return scales.concat(scale.roots.map(root => ({ root, symbol: scale.symbol })));
        }, []).map((scale, index) => <li key={index} className={this.scaleClasses(scale.symbol, parallels, supersets, subsets, this.state.tonic !== scale.root)} onClick={() => this.setState({ scale: scale.symbol, chord: null, tonic: scale.root })}>{scale.root} {scale.symbol}</li>);
        const similar = similarChords.concat(similarScales).length > 1 ? (
            <div>
                <h2>Equal Notes</h2>
                <ul>
                    {similarChords}
                    {similarScales}
                </ul>
            </div>) : '';

        // TODO: preview chord/scale on hover in circle (under current)
        return (
            <div className="explorer" >
                {label}
                {piano}
                {score}
                {circle}


                <h2>Chords</h2>
                {chordGroups}
                <h2>Scales</h2>
                {scaleGroups}
                {similar}

                < h4 > Circle of</h4 >
                <ul>
                    {circles}
                </ul>
            </div >
        );
    }
}
