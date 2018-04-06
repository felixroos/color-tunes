
import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as PcSet from 'tonal-pcset';
import * as Distance from 'tonal-distance';
import * as Scale from 'tonal-scale';
import { transpose } from 'tonal';

import { symbolName, scaleNames, chordNames } from './Symbols';

const chromatics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export function removeOctaves(notes) {
    return notes.map(note => Note.tokenize(note)).map(tokens => tokens[0] + tokens[1]);
}

export function chordChroma(tonic, symbol) {
    const notes = removeOctaves(Chord.notes(tonic + symbol));
    return PcSet.chroma(notes);
}

export function scaleChroma(tonic, scale) {
    const notes = removeOctaves(Scale.notes(tonic, scale));
    return PcSet.chroma(notes);
}

export function isChromaParent(chroma, child) {
    return chroma !== child && chroma.split('').map((value, index) => {
        return child[index] === '0' || child[index] === value;
    }).reduce((match, current) => match && current, true);
}


export function isChromaChild(chroma, parent) {
    return chroma !== parent && chroma.split('').map((value, index) => {
        return value === '0' || parent[index] === value;
    }).reduce((match, current) => match && current, true);
}

export function sortByChordLength() {
    return (a, b) => Chord.notes('C' + a).length < Chord.notes('C' + b).length ? -1 : 1;
}

export function sortByScaleLength() {
    return (a, b) => Scale.notes('C', a).length < Scale.notes('C', b).length ? -1 : 1;
}

export function filterChordLength(length) {
    return () => true; // TODO 
    //return (item) => Chord.notes('C' + item.symbol).length === length;
}
export function filterScaleLength(length) {
    return () => true; // TODO 
    // return (item) => Scale.notes('C', item.symbol).length === length;
}

export function sortByDistanceToTonic(tonic) {
    return (a, b) => Distance.semitones(tonic, a.root) < Distance.semitones(tonic, b.root) ? -1 : 1;
}

export function chromaLength(chroma) {
    return chroma.replace('0', '').length;
}

export function chromaParallels(chroma, group) {
    return {
        scales: scaleNames(group).map(type => {
            return {
                symbol: type,
                roots: chromatics.filter(root => {
                    return scaleChroma(root, type) === chroma
                }),
                sub: chromatics.filter(root => {
                    return isChromaChild(scaleChroma(root, type), chroma)
                }),
                super: chromatics.filter(root => {
                    return isChromaChild(chroma, scaleChroma(root, type))
                }),
            }
        }).filter(p => p.roots.length || p.sub.length || p.super.length)
                /* .filter(filterScaleLength(7))
                .sort(sortByScaleLength()) */,
        chords: chordNames(group).map(type => {
            return {
                symbol: type,
                roots: chromatics.filter(root => {
                    return chordChroma(root, type) === chroma
                }),
                sub: chromatics.filter(root => {
                    return isChromaChild(chordChroma(root, type), chroma)
                }),
                super: chromatics.filter(root => {
                    return isChromaChild(chroma, chordChroma(root, type))
                }),
            }
        }).filter(p => p.roots.length || p.sub.length || p.super.length)
        /* .filter(filterChordLength(4))
        .sort(sortByChordLength()) */
    };
}

export function getSupersets(type, isScale, group) {
    const isSuperset = PcSet.isSupersetOf((isScale ? Scale : Chord).intervals(type));
    return {
        scales: isScale ? Scale.supersets(type) :
            scaleNames(group).filter(scale =>
                isSuperset(Scale.intervals(scale))),
        chords: !isScale ? Chord.supersets(type) :
            chordNames(group).filter(chord =>
                isSuperset(Chord.intervals(chord))),
    };
}

export function getSubsets(type, isScale, group) {
    const isSubset = PcSet.isSubsetOf((isScale ? Scale : Chord).intervals(type));
    return {
        scales: isScale ? Scale.subsets(type) :
            scaleNames(group).filter(scale =>
                isSubset(Scale.intervals(scale))),
        chords: !isScale ? Chord.subsets(type) :
            chordNames(group).filter(chord =>
                isSubset(Chord.intervals(chord))),
    };
}

export function parallelSymbols(type, parallel, props) {
    return props.parallels[type + 's'].reduce((items, item, index) => {
        return items.concat(item[parallel].map(root => ({ root, symbol: item.symbol })))
            .sort(sortByDistanceToTonic(props.tonic));
    }, []);
}


export const center = pc =>
    pc ? (pc[0] === "A" || pc[0] === "B" ? pc + 3 : pc + 4) : null;

export function getProps(state) {
    let label;
    let tonic, chroma, scorenotes, notes = [], intervals;
    let subsets, supersets;
    if (!state.tonic) {
        return;
    }
    if (!state.scale && !state.chord) {
        return;
    }
    tonic = state.tonic;
    if (state.scale) {
        notes = removeOctaves(Scale.notes(tonic, state.scale));
        chroma = PcSet.chroma(notes);
        intervals = Scale.intervals(state.scale);
        scorenotes = intervals.map(transpose(center(tonic)));
        label = tonic + ' ' + symbolName('scale', state.scale);
        subsets = getSubsets(state.scale, true, state.group);
        supersets = getSupersets(state.scale, true, state.group);
    } else if (state.chord) {
        const chord = tonic + state.chord;
        // TODO: bug resport: 4 and 5 chords (possibly more) do not omit the octave after the notes
        notes = removeOctaves(Chord.notes(chord));
        const intervals = Chord.intervals(chord);
        scorenotes = intervals.map(transpose(center(tonic)));
        chroma = chordChroma(state.tonic, state.chord);
        label = tonic + symbolName('chord', state.chord);
        subsets = getSubsets(state.chord, false, state.group);
        supersets = getSupersets(state.chord, false, state.group);
    }
    const parallels = chromaParallels(chroma, state.group);
    return {
        chord: state.chord, scale: state.scale, tonic, notes, chroma, intervals, scorenotes, label, subsets, supersets, parallels
    };
}

export function symbolClasses(type, symbol, props, differentRoot) {
    if (props[type] === symbol && !differentRoot) {
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