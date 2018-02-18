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
import { chordScales, scaleChords } from './chordScales';
/* import * as Interval from 'tonal-interval'; */
/* import * as Distance from "tonal-distance" */

import './Explorer.css';

const center = pc =>
    pc ? (pc[0] === "A" || pc[0] === "B" ? pc + 3 : pc + 4) : null;

export default class Explorer extends React.Component {
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

    render() {
        let piano, circle, label, score = '';
        let tonic, chroma, scorenotes, notes = [];
        let chordscales = [], scalechords = [];
        const chromatics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

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
            scalechords = scaleChords(this.state.scale);
        }
        if (this.state.chord) {
            /* const chord = getTonalChord(tonic + this.state.chord); */
            const chord = tonic + this.state.chord;
            // TODO: bug resport: 4 and 5 chords (possibly more) do not omit the octave after the notes
            notes = this.removeOctaves(Chord.notes(chord));
            const intervals = Chord.intervals(chord);
            scorenotes = intervals.map(transpose(center(tonic)));
            chroma = PcSet.chroma(notes);
            label = <h2>{chord}</h2>;
            chordscales = chordScales(chord);
        }

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
            labels={chromatics}
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

        function noteClass(note, state, notes) {
            if (state.tonic === note) {
                return 'active';
            }
            if (notes.indexOf(note) !== -1) {
                return 'sub';
            }
        }
        const tonics = chromatics
            .map((tonic, index) =>
                (<li key={index} className={noteClass(tonic, this.state, notes)} onClick={() => this.setState({ tonic })}>{tonic}</li>)
            )
        function chordClass(chord, current) {
            if (current === chord) {
                return 'active';
            }
            if (Chord.supersets(current).indexOf(chord) !== -1) {
                return 'super';
            }
            if (Chord.subsets(current).indexOf(chord) !== -1 || scalechords.indexOf(chord) !== -1) {
                return 'sub';
            }
        }

        function scaleClass(scale, current) {
            //
            if (current === scale) {
                return 'active';
            }
            if (Scale.supersets(current).indexOf(scale) !== -1 || chordscales.indexOf(scale) !== -1) {
                return 'super';
            }
            if (Scale.subsets(current).indexOf(scale) !== -1) {
                return 'sub';
            }
        }

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
                (<li key={index} className={chordClass(chord, this.state.chord)} onClick={() => this.setState({ scale: null, chord })}>{chord}</li>)
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
                (<li key={index} className={scaleClass(scale, this.state.scale)} onClick={() => this.setState({ chord: null, scale })}>{scale}</li>)
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

        return (
            <div className="explorer">

                {label}
                {piano}
                {score}
                {circle}
                <h2>Roots</h2>
                <ul>
                    {tonics}
                </ul>
                <h2>Chords</h2>
                {chordGroups}
                <h2>Scales</h2>
                {scaleGroups}
                <h4>Circle of</h4>
                <ul>
                    {circles}
                </ul>
            </div>
        );
    }
}
