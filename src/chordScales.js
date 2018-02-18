import * as Chord from 'tonal-chord';
import * as Note from 'tonal-note';
import * as Scale from 'tonal-scale';
import * as PcSet from 'tonal-pcset';

export function getTonalChord(chord) {
    return chord
        .replace('-', 'm')
        .replace('^', 'maj')
        /* .replace('d', 'dim') */
        .replace('h7', 'm7b5');
}

export const chordScales = name => {
    const isSuperset = PcSet.isSupersetOf(Chord.intervals(name));
    return Scale.names().filter(name => isSuperset(Scale.intervals(name)));
};

export const scaleChords = name => {
    const isSubset = PcSet.isSubsetOf(Scale.intervals(name));
    return Chord.names().filter(name => isSubset(Chord.intervals(name)));
};

export function getChromas(root, scales) {
  return scales.map(scale => PcSet.chroma(Scale.notes(root, scale)));
}

export function matchChordScales(...chords) {
    const scales = chords
        .map(chord => getTonalChord(chord))
        .map(chord => chordScales(chord));

    const chromas = chords
        .map(chord => getTonalChord(chord))
        .map(chord => [
            ...new Set(getChromas(Chord.tokenize(chord)[0], chordScales(chord)))
        ]);
    const combined = chromas.reduce((a, current) => a.concat(current, []));
    const shared = [
        ...new Set(
            combined.filter(chroma => {
                return combined.filter(c => c === chroma).length > 1; // check if there is at least one overlap
            })
        )
    ]
        .sort()
        .filter(chroma => chroma.indexOf(0) !== -1); // omit chromatic scale:
    const colors = shared.map(chroma =>
        new Array(3)
            .fill(0)
            .map((digit, index) =>
                (parseInt(chroma.slice(index * 4, index * 4 + 4), 2) * 17).toString(16)
            )
            .join('')
    );

    const material = shared.map(chroma =>
        Note.names(' b').filter((note, index) => chroma[index] === '1')
    );
    return { chords, scales, chromas, shared, colors, material };
}