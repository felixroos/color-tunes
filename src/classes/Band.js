import Pianist from './Pianist';
import { Pulse } from './Pulse';
import { Metronome } from './Metronome';
import { Drummer } from './Drummer';

export default class Band {

    constructor() {
        this.props = {
            chord: null,
            circle: 'fourths', // fifths, chromatics
            arpeggiate: true,
            overlap: false,
            autoplay: true,
            position: null,
            activeNotes: null
        };

        this.styles = {
            'Medium Swing': {},
            'Slow Swing': {},
            'Medium Up Swing': {},
            'Up Tempo Swing': {},
            'Bossa Nova': {},
            'Latin': {},
            'Waltz': {},
            'Even 8ths': {},
            'Afro': {},
            'Ballad': {},
            'Rock Pop': {},
            'Funk': {},
        };
        this.defaultStyle = 'Medium Swing';
        this.pulse = new Pulse({ bpm: 130 });
        this.metronome = new Metronome();
        this.drummer = new Drummer();
        this.pianist = new Pianist({ itelligentVoicings: false });
    }

    playChordAtPosition(position) {
        const chord = this.props.measures[position[0]][position[1]];
        this.pianist.playChord(chord);
    }

    applyStyle(styleName) {
        const style = this.styles[styleName] || this.styles[this.defaultStyle];
        this.pulse.props = Object.assign(style);
    }

    playTune(measures = this.props.measures, times = 1, position = this.props.position || [0, 0]) {
        if (times > 1) {
            measures = new Array(times).fill(1).reduce((song) => {
                return song.concat(measures);
            }, []);
        }
        this.pulse.tickArray(measures.map(m => 1), (tick) => {
            this.drummer.bar(tick);
            this.pianist.bar(tick, measures);
        });
        this.pulse.start();
    }

    getNextPosition(position = this.props.position, measures = this.props.measures) {
        let barIndex = position[0];
        let chordIndex = position[1] + 1;
        if (chordIndex > measures[barIndex].length - 1) {
            chordIndex = 0;
            barIndex = (barIndex + 1) % measures.length;
        }
        return [barIndex, chordIndex];
    }

    playNextChord(measures = this.props.measures, bpm = 220, beatsPerMeasure = 4, forms = 2) {
        const position = !this.props.position ? [0, 0] : this.getNextPosition();
        this.playChordAtPosition(position);
    }
}
