import React from 'react';
import * as Chord from 'tonal-chord';
import { symbolClasses } from './Chroma';
import { chordNames, symbolName } from './Symbols';


export default class Chords extends React.Component {
    render() {
        const props = this.props.props;
        const chords = chordNames(this.props.group)
            .sort((a, b) => {
                return Chord.notes(props.tonic + a).length < Chord.notes(props.tonic + b).length ? -1 : 1;
            });
        return chords.reduce((groups, chord, index) => {
            const n = Chord.notes(props.tonic + chord).length;
            if (!groups[n]) {
                groups[n] = [];
            }
            groups[n].push(chord);
            groups[n] = groups[n].sort((a, b) => a.length < b.length ? -1 : 1);
            return groups;
        }, []).map(group =>
            group.map((chord, index) => (
                (<li key={index} className={symbolClasses('chord', chord, props)}
                    onClick={() => this.props.onClick({ scale: null, chord, order: null })}>
                    {symbolName('chord', chord)}
                </li>)
            )))
            .slice(1).map((group, index) => (
                <div key={index}>
                    <ul key={index} className="scroll">
                        {group}
                    </ul>
                </div>));
    }
}
