import React from 'react';
/* import { sounds } from './assets/sounds/sounds.js'; */
import { transpose } from 'tonal';
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as PcSet from 'tonal-pcset';
import * as Distance from 'tonal-distance';
import * as Scale from 'tonal-scale';
import PianoKeyboard from './components/PianoKeyboard';
import Score from './components/Score';
import CircleSet from './components/CircleSet';
import { chords, scales, scaleNames, scaleName, chordNames, chordName, groupNames } from './components/Symbols';

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
            scale: 'major',
            history: [],
            extended: true,
            group: 'Advanced'
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

    isChromaParent(chroma, child) {
        return chroma !== child && chroma.split('').map((value, index) => {
            return child[index] === '0' || child[index] === value;
        }).reduce((match, current) => match && current, true);
    }


    isChromaChild(chroma, parent) {
        return chroma !== parent && chroma.split('').map((value, index) => {
            return value === '0' || parent[index] === value;
        }).reduce((match, current) => match && current, true);
    }

    sortByChordLength() {
        return (a, b) => Chord.notes('C' + a).length < Chord.notes('C' + b).length ? -1 : 1;
    }

    sortByScaleLength() {
        return (a, b) => Scale.notes('C', a).length < Scale.notes('C', b).length ? -1 : 1;
    }

    filterChordLength(length) {
        return () => true; // TODO 
        //return (item) => Chord.notes('C' + item.symbol).length === length;
    }
    filterScaleLength(length) {
        return () => true; // TODO 
        // return (item) => Scale.notes('C', item.symbol).length === length;
    }

    sortByDistanceToTonic(tonic) {
        return (a, b) => Distance.semitones(tonic, a.root) < Distance.semitones(tonic, b.root) ? -1 : 1;
    }

    chromaLength(chroma) {
        return chroma.replace('0', '').length;
    }

    chromaParallels(chroma) {
        /* console.log('p', this.isChromaParent('111', '101'));
        console.log('f', this.isChromaChild('111', '101'));
        console.log('c', this.isChromaChild('101', '111'));
        console.log('f', this.isChromaParent('101', '111')); */

        return {
            scales: scaleNames(this.state.group).map(type => {
                return {
                    symbol: type,
                    roots: this.chromatics.filter(root => {
                        return this.scaleChroma(root, type) === chroma
                    }),
                    sub: this.chromatics.filter(root => {
                        return this.isChromaChild(this.scaleChroma(root, type), chroma)
                    }),
                    super: this.chromatics.filter(root => {
                        return this.isChromaChild(chroma, this.scaleChroma(root, type))
                    }),
                }
            }).filter(p => p.roots.length || p.sub.length || p.super.length)
                /* .filter(this.filterScaleLength(7))
                .sort(this.sortByScaleLength()) */,
            chords: chordNames(this.state.group).map(type => {
                return {
                    symbol: type,
                    roots: this.chromatics.filter(root => {
                        return this.chordChroma(root, type) === chroma
                    }),
                    sub: this.chromatics.filter(root => {
                        return this.isChromaChild(this.chordChroma(root, type), chroma)
                    }),
                    super: this.chromatics.filter(root => {
                        return this.isChromaChild(chroma, this.scaleChroma(root, type))
                    }),
                }
            }).filter(p => p.roots.length || p.sub.length || p.super.length)
            /* .filter(this.filterChordLength(4))
            .sort(this.sortByChordLength()) */
        };
    }

    supersets(type, isScale) {
        const isSuperset = PcSet.isSupersetOf((isScale ? Scale : Chord).intervals(type));
        return {
            scales: isScale ? Scale.supersets(type) :
                scaleNames(this.state.group).filter(scale =>
                    isSuperset(Scale.intervals(scale))),
            chords: !isScale ? Chord.supersets(type) :
                chordNames(this.state.group).filter(chord =>
                    isSuperset(Chord.intervals(chord))),
        };
    }

    subsets(type, isScale) {
        const isSubset = PcSet.isSubsetOf((isScale ? Scale : Chord).intervals(type));
        return {
            scales: isScale ? Scale.subsets(type) :
                scaleNames(this.state.group).filter(scale =>
                    isSubset(Scale.intervals(scale))),
            chords: !isScale ? Chord.subsets(type) :
                chordNames(this.state.group).filter(chord =>
                    isSubset(Chord.intervals(chord))),
        };
    }

    symbolClasses(type, symbol, parallels, supersets, subsets, differentRoot) {
        if (this.state[type] === symbol && !differentRoot) {
            return 'active';
        }
        const brothers = parallels[type + 's']
            .filter(item => item.roots.length)
            .filter(parallel => parallel.symbol === symbol);
        if (brothers.length) {
            return 'parallel'; // TODO: also check classes below and dont stop here
        }
        if (!differentRoot && supersets[type + 's'].indexOf(symbol) !== -1) {
            return 'super';
        }
        if (!differentRoot && subsets[type + 's'].indexOf(symbol) !== -1) {
            return 'sub';
        }

    }

    chordClasses(chord, parallels, supersets, subsets, differentRoot) {
        return this.symbolClasses('chord', chord, parallels, supersets, subsets, differentRoot);
    }

    scaleClasses(scale, parallels, supersets, subsets, differentRoot) {
        return this.symbolClasses('scale', scale, parallels, supersets, subsets, differentRoot);
    }

    render() {
        let piano, circle, label, score = '';
        let tonic, chroma, scorenotes, notes = [];
        let subsets, supersets;

        if (!this.state.tonic) {
            return;
        }
        tonic = this.state.tonic;
        if (this.state.scale) {
            notes = this.removeOctaves(Scale.notes(tonic, this.state.scale));
            chroma = PcSet.chroma(notes);
            const intervals = Scale.intervals(this.state.scale);
            scorenotes = intervals.map(transpose(center(tonic)));
            label = <h2>{tonic} {scaleName(this.state.scale)}</h2>;
            subsets = this.subsets(this.state.scale, true);
            supersets = this.supersets(this.state.scale, true);

        }
        if (this.state.chord) {
            const chord = tonic + this.state.chord;
            // TODO: bug resport: 4 and 5 chords (possibly more) do not omit the octave after the notes
            notes = this.removeOctaves(Chord.notes(chord));
            const intervals = Chord.intervals(chord);
            scorenotes = intervals.map(transpose(center(tonic)));
            chroma = this.chordChroma(this.state.tonic, this.state.chord);
            label = <h2>{tonic}{chordName(this.state.chord)}</h2>;
            subsets = this.subsets(this.state.chord, false);
            supersets = this.supersets(this.state.chord, false);
        }
        const parallels = this.chromaParallels(chroma);

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
            size="400"
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
            maxOct={5}
            notes={notes}
        />);

        const chords = chordNames(this.state.group)
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
                (<li key={index} className={this.chordClasses(chord, parallels, supersets, subsets)} onClick={() => this.setState({ scale: null, chord })}>{chordName(chord)} </li>)
            )))
            .slice(1).map((group, index) => (
                <div key={index}>
                    <ul key={index} className="scroll">
                        {group}
                    </ul>
                </div>));
        /* {<h5>{index + 1} Notes</h5>} */

        const scales = scaleNames(this.state.group)
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
                (<li key={index} className={this.scaleClasses(scale, parallels, supersets, subsets)} onClick={() => this.setState({ chord: null, scale })}>{scaleName(scale)} </li>)
            )))
            .slice(1).map((group, index) => (
                <div key={index}>
                    <ul key={index} className="scroll">
                        {group}
                    </ul>
                </div>));
        /* {<h5>{index + 1} Notes</h5>} */


        const circles = ['fourths', 'fifths', 'chromatics'].map((circle, index) => {
            return <li key={index} className={this.state.circle === circle ? 'active' : ''} onClick={() => this.setState({ circle })}>{circle}</li>
        });

        const groups = groupNames().map((group, index) => {
            return <li key={index} className={this.state.group === group ? 'active' : ''} onClick={() => this.setState({ group })}>{group}</li>
        });

        const similarChords = parallels.chords.reduce((chords, chord, index) => {
            return chords.concat(chord.roots.map(root => ({ root, symbol: chord.symbol }))).sort(this.sortByDistanceToTonic(tonic));
        }, []).map((chord, index) => <li key={index} className={this.chordClasses(chord.symbol, parallels, supersets, subsets, this.state.tonic !== chord.root)} onClick={() => this.setState({ scale: null, chord: chord.symbol, tonic: chord.root })}>{chord.root}{chord.symbol}</li>);

        const similarScales = parallels.scales.reduce((scales, scale, index) => {
            return scales.concat(scale.roots.map(root => ({ root, symbol: scale.symbol }))).sort(this.sortByDistanceToTonic(tonic));
        }, []).map((scale, index) => <li key={index} className={this.scaleClasses(scale.symbol, parallels, supersets, subsets, this.state.tonic !== scale.root)} onClick={() => this.setState({ scale: scale.symbol, chord: null, tonic: scale.root })}>{scale.root} {scale.symbol}</li>);

        const subChords = parallels.chords.reduce((chords, chord, index) => {
            return chords.concat(chord.sub.map(root => ({ root, symbol: chord.symbol }))).sort(this.sortByDistanceToTonic(tonic));
        }, []).map((chord, index) => <li key={index} className={this.chordClasses(chord.symbol, parallels, supersets, subsets, this.state.tonic !== chord.root)} onClick={() => this.setState({ scale: null, chord: chord.symbol, tonic: chord.root })}>{chord.root}{chord.symbol}</li>);

        const subScales = parallels.scales.reduce((scales, scale, index) => {
            return scales.concat(scale.sub.map(root => ({ root, symbol: scale.symbol }))).sort(this.sortByDistanceToTonic(tonic));
        }, []).map((scale, index) => <li key={index} className={this.scaleClasses(scale.symbol, parallels, supersets, subsets, this.state.tonic !== scale.root)} onClick={() => this.setState({ scale: scale.symbol, chord: null, tonic: scale.root })}>{scale.root} {scale.symbol}</li>);

        const superChords = parallels.chords.reduce((chords, chord, index) => {
            return chords.concat(chord.super.map(root => ({ root, symbol: chord.symbol }))).sort(this.sortByDistanceToTonic(tonic));
        }, []).map((chord, index) => <li key={index} className={this.chordClasses(chord.symbol, parallels, supersets, subsets, this.state.tonic !== chord.root)} onClick={() => this.setState({ scale: null, chord: chord.symbol, tonic: chord.root })}>{chord.root}{chord.symbol}</li>);

        const superScales = parallels.scales.reduce((scales, scale, index) => {
            return scales.concat(scale.super.map(root => ({ root, symbol: scale.symbol }))).sort(this.sortByDistanceToTonic(tonic));
        }, []).map((scale, index) => <li key={index} className={this.scaleClasses(scale.symbol, parallels, supersets, subsets, this.state.tonic !== scale.root)} onClick={() => this.setState({ scale: scale.symbol, chord: null, tonic: scale.root })}>{scale.root} {scale.symbol}</li>);
        console.log('superscales', superScales);


        const similar = similarChords.concat(similarScales).length > 0 ? (
            <div>
                <h2>Material</h2>
                <ul className="scroll">
                    {subChords}
                    {subScales}
                </ul>
                <ul className="scroll">
                    {similarChords}
                    {similarScales}
                </ul>
                <ul className="scroll">
                    {superChords}
                    {superScales}
                </ul>
            </div>) : '';

        // TODO: preview chord/scale on hover in circle (under current)
        return (
            <div className="explorer" >
                <div className="symbols">
                    {label}
                    {piano}
                    {score}
                    {circle}
                    {similar}
                    <h2>Chords</h2>
                    {chordGroups}
                    <h2>Scales</h2>
                    {scaleGroups}
                    <h2>Settings</h2>
                    <h5>Filter</h5>
                    <ul>
                        {groups}
                    </ul>
                    <h5>Circle of</h5>
                    <ul>
                        {circles}
                    </ul>
                </div>
            </div >
        );
    }
}
