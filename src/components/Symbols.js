import * as Chord from 'tonal-chord';
import * as Scale from 'tonal-scale';

export const chords = [
    {
        symbol: 'm',
        long: 'Moll',
        short: '-',
        groups: ['Basic']
    },
    {
        symbol: 'M',
        long: 'Dur',
        short: '^',
        groups: ['Basic']
    },
    {
        symbol: 'o',
        groups: ['Basic'],
        long: 'Vermindert',
        /* short: 'o' */
    },
    // 5 4 64 m#5 Mb6 Mb5 M#5 7no5 Msus4 Msus2
    {
        symbol: '7',
        groups: ['Basic', 'Diatonic'],
        long: 'Dominantsept'
    },
    {
        symbol: 'M6',
        groups: ['Advanced'],
        long: 'Dur 6',
        short: '6'
    },
    {
        symbol: 'o7',
        groups: ['Advanced'],
        long: 'Vermindert 7',
    },
    {
        symbol: 'm7',
        groups: ['Basic', 'Diatonic'],
        long: 'Moll 7',
        short: '-7'
    },
    {
        symbol: 'oM7',
        groups: ['Expert'],
        long: 'Vermindert major 7',
        short: 'o^7'
    },
    {
        symbol: 'm7b5',
        groups: ['Basic', 'Diatonic'],
        long: 'Halbvermindert',
    },
    {
        symbol: '7#5',
        groups: ['Advanced'],
        long: 'Dominantsept #5'
    },
    {
        symbol: 'Maj7',
        groups: ['Basic', 'Diatonic'],
        long: 'Major 7',
        short: '^7'
    },
    {
        symbol: '7sus4',
        groups: ['Advanced'],
    },
    {
        symbol: '9',
        groups: ['Basic'],
    },
    {
        symbol: 'M9',
        groups: ['Basic'],
        short: '^9'
    }
    /*
7b13 M7b5 m7#5 9no5 M7#5 M7b6 7b5 mMaj7 Madd9 mb6b9 mb6M7 madd4 sus24 madd9 Maddb9 +add#9 M7sus4 7#5sus4 M#5add9 M7#5sus4
11 m9 m6 9#5 7b9 7#9 M69 9b5 m69 mM9 7b6 m9b5 m9#5 7#11 M7b9 9b13 o7M7 M9b5 11b9 M9#5 7add6 M6#11 M7#11 7#5#9 13no5 9sus4 7#5b9 M9sus4 7sus4b9 m7add11 mMaj7b6 M9#5sus4
13 m11 M13 9#11 13#9 13b5 13b9 m11b5 7b9#9 mM9b6 M9#11 9#5#11 7#9b13 7b9b13 13sus4 m11A 5 7#9#11 7b9#11 M69#11 7#11b13 M7#9#11 M7add13 7#5b9#11 7sus4b9b13
m13 13#11 M13#11 13b9#11 9#11b13 13#9#11 7b9b13#11 7#9#11b13
    */
];

export const scales = [
    {
        symbol: 'major pentatonic',
        groups: ['Basic'],
    },
    {
        symbol: 'minor pentatonic',
        groups: ['Basic'],
    },
    {
        symbol: 'minor blues',
        groups: ['Basic'],
    },
    {
        symbol: 'major',
        groups: ['Basic', 'Diatonic'],
    },
    {
        symbol: 'dorian',
        groups: ['Basic', 'Diatonic'],
    },
    {
        symbol: 'lydian',
        groups: ['Basic', 'Diatonic'],
    },
    {
        symbol: 'aeolian',
        groups: ['Basic', 'Diatonic'],
    },
    {
        symbol: 'mixolydian',
        groups: ['Basic', 'Diatonic'],
    },
    {
        symbol: 'phrygian',
        groups: ['Basic', 'Diatonic'],
    },
    {
        symbol: 'locrian',
        groups: ['Basic', 'Diatonic'],
    }
    /*iwato pelog in-sen ritusen egyptian scriabin hirajoshi kumoijoshi malkos raga vietnamese 1 vietnamese 2  ionian pentatonic lydian pentatonic locrian pentatonic flat six pentatonic minor six pentatonic minor #7M pentatonic lydian #5P pentatonic whole tone pentatonic mixolydian pentatonic flat three pentatonic super locrian pentatonic major flat two pentatonic lydian dominant pentatonic neopolitan major pentatonic
    piongio augmented whole tone mystery #1 prometheus major blues minor hexatonic six tone symmetric prometheus neopolitan
     persian   spanish altered oriental flamenco balinese  dorian #4 todi raga enigmatic lydian #9 neopolitan locrian #2  lydian minor melodic minor locrian major harmonic minor romanian minor harmonic major hungarian major hungarian minor lydian dominant lydian augmented ionian augmented neopolitan minor neopolitan major lydian diminished leading whole tone augmented heptatonic double harmonic major double harmonic lydian melodic minor fifth mode melodic minor second mode
    bebop kafi raga diminished purvi raga ichikosucho bebop minor minor bebop bebop major bebop locrian bebop dominant spanish heptatonic minor six diminished
    composite blues
    chromatic*/
];

export const levels = ['Basic', 'Advanced', 'Expert'];

export function groupFilter(group) {
    return (item) => {
        const level = Math.max(item.groups.filter(group => levels.indexOf(group) !== -1)
            .map(group => levels.indexOf(group)));

        const groups = Array.from(new Set(levels.slice(level).concat(item.groups)));
        return groups.indexOf(group) !== -1;
    };
}

export function scaleNames(group = 'Basic') {
    if (!group || group === 'All') {
        return Scale.names();
    }
    return scales.filter(groupFilter(group))
        .map(scale => scale.symbol);
}
export function chordNames(group = 'Basic') {
    if (!group || group === 'All') {
        return Chord.names();
    }
    return chords.filter(groupFilter(group))
        .map(scale => scale.symbol);
}

export function groupNames() {
    return Array.from(new Set(scales.concat(chords)
        .map(item => item.groups)
        .reduce((groups, current) => groups.concat(current), ['All'])));
}

export function symbolName(symbol, pool, long) {
    const match = pool.find(item => item.symbol === symbol);
    if (!match) {
        return symbol;
    }
    return symbol;
    /* return (long ? match.long : match.short) || symbol; */
}

export function scaleName(symbol, long = false) {
    return symbolName(symbol, scales, long);
}

export function chordName(symbol, long = false) {
    return symbolName(symbol, chords, long);
}

console.log('group names', groupNames());
