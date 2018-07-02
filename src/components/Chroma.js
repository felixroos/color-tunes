
import { transpose } from 'tonal';
import * as TonalArray from 'tonal-array';
import * as Chord from 'tonal-chord';
import * as Distance from 'tonal-distance';
import * as Interval from 'tonal-interval';
import * as Note from 'tonal-note';
import * as PcSet from 'tonal-pcset';
import * as Scale from 'tonal-scale';
import { chordNames, scaleNames, symbolName } from './Symbols';


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
export function sortByFifthDistanceToTonic(tonic) {
    return (a, b) => Distance.fifths(tonic, a.root) < Distance.fifths(tonic, b.root) ? -1 : 1;
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
        //.sort(sortByFifthDistanceToTonic(props.tonic));
    }, []);
}

export function transposePitch(pc, scorenotes, semitones) {
    return scorenotes.map(note => {
        if (Note.pc(note) === pc) {
            return transpose(note, Interval.fromSemitones(semitones));
        }
        return note;
    });
}

export function getSmallestInterval(pc1, pc2) {
    const interval = Distance.interval(pc1, pc2);
    let up = Math.abs(Interval.semitones(interval)) % 12; // BUG: Interval.semitones('0A') is NaN instead of 0
    let down = Math.abs(Interval.semitones(Interval.invert(interval))) % 12;
    return up > down ? '-' + Interval.fromSemitones(down) : Interval.fromSemitones(up);
}

export function getEnvelope(scorenotes) {
    // lowest and highest note
    return scorenotes.map(note => Note.midi(note))
        .sort().map(midi => scorenotes.find(n => Note.midi(n) === midi))
        .filter((note, i) => (i === 0 || i === scorenotes.length - 1));
}

export function envelopeDistance(a, b) {
    return [Note.midi(a[0]) - Note.midi(b[0]), Note.midi(a[1]) - Note.midi(b[1])];
}

export function envelopeCut(scorenotes, envelope = ['C2', 'C5']) {
    // lowest and highest note
    const minMax = getEnvelope(scorenotes);
    // transposes all notes octave up / down when outside maxEnvelope
    if (Note.midi(minMax[0]) <= Note.midi(envelope[0])) {
        return scorenotes.map(note => transpose(note, Interval.fromSemitones(12)));
    } if (Note.midi(minMax[1]) > Note.midi(envelope[1])) {
        return scorenotes.map(note => transpose(note, Interval.fromSemitones(-12)));
    }
    return scorenotes;
}

export function newTonicState(tonic, state) {
    /* 
        if (state.tonicInBass) {
            anchorNote = Distance.transpose(anchorNote, Interval.fromSemitones(-12));
        } */

    const smallestInterval = getSmallestInterval(state.tonic, tonic);

    let invert = state.invert;
    /* if (Math.abs(Interval.semitones(smallestInterval)) >= 3) {
         invert += 2;
     } */

    let newTonic = Note.simplify(Distance.transpose((state.tonic + state.octave), smallestInterval));
    if (Note.props(newTonic).pc === state.tonic) {
        newTonic = Note.enharmonic(newTonic);
    }
    const pc = Note.props(newTonic).pc;
    return { tonic: pc, invert, octave: Note.props(newTonic).oct };
}

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

    const fullTonic = state.tonic + state.octave;

    tonic = state.tonic;
    if (state.scale) {
        notes = removeOctaves(Scale.notes(tonic, state.scale));
        chroma = state.fixedChroma || PcSet.chroma(notes);
        intervals = Scale.intervals(state.scale);
        scorenotes = intervals.map(transpose(fullTonic));
        label = tonic + ' ' + symbolName('scale', state.scale);
        subsets = getSubsets(state.scale, true, state.group);
        supersets = getSupersets(state.scale, true, state.group);
    } else if (state.chord) {
        const chord = tonic + state.chord;
        // TODO: bug resport: 4 and 5 chords (possibly more) do not omit the octave after the notes
        notes = removeOctaves(Chord.notes(chord));
        const intervals = Chord.intervals(chord).map(i => i.replace('13', '6'));
        scorenotes = intervals.map(transpose(fullTonic));
        if (state.tonicInBass) {
            scorenotes = transposePitch(tonic, scorenotes, -12);
        }
        chroma = state.fixedChroma || chordChroma(state.tonic, state.chord);
        label = tonic + symbolName('chord', state.chord);
        subsets = getSubsets(state.chord, false, state.group);
        supersets = getSupersets(state.chord, false, state.group);
    }

    if (state.invert) {
        state.invert = state.invert % notes.length;
        scorenotes = scorenotes.map((note, index) => index < state.invert ? transpose(note, Interval.fromSemitones(12)) : note);
        scorenotes = TonalArray.rotate(state.invert, scorenotes);
    }

    scorenotes = envelopeCut(scorenotes);
    state.octave = Note.props(scorenotes.find(n => Note.pc(n) === tonic)).oct;
    if (state.invert) {
        state.octave -= 1;
    }

    if (state.order) {
        notes = state.order.map(i => notes[i]);
        scorenotes = state.order.map(i => scorenotes[i]);
    }

    const labels = getChromaticLabels(notes);

    const parallels = chromaParallels(chroma, state.group);
    return {
        chord: state.chord, scale: state.scale, tonic, notes, chroma, intervals, scorenotes, label, subsets, supersets, parallels, labels
    };
}

export function getChromaticLabels(notes) {
    return chromatics.map(note => {
        return notes.find(n => Note.chroma(n) === Note.chroma(note)) || note;
    });
}

export function symbolClasses(type, symbol, props, differentRoot) {
    differentRoot = differentRoot ? Note.midi(props.tonic + '2') !== Note.midi(differentRoot + '2') : null;
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