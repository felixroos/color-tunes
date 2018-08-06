import Pianist from '../dist/Pianist';
import { Pulse } from '../dist/Pulse';
import { Metronome } from '../dist/Metronome';
import { Drummer } from '../dist/Drummer';

export default class Band {
    styles = {
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
    defaultStyle = 'Medium Swing';
    pulse = new Pulse({ bpm: 130 });
    metronome = new Metronome();
    drummer = new Drummer();
    pianist = new Pianist();


    constructor() {
        this.state = {
            chord: null,
            circle: 'fourths', // fifths, chromatics
            arpeggiate: true,
            overlap: false,
            autoplay: true,
            position: null,
            activeNotes: null
        };
    }

    playChordAtPosition(position) {
        const chord = this.props.measures[position[0]][position[1]];
        this.pianist.playChord(chord);
    }

    applyStyle(styleName) {
        const style = this.styles[styleName] || this.styles[this.defaultStyle];
        this.pulse.props = Object.assign(style);
    }

    playTune(measures = this.props.measures, position = this.state.position || [0, 0]) {
        this.pulse.tickArray(measures.map(m => 1), (tick) => {
            this.drummer.bar(tick);
            this.pianist.bar(tick, measures);
            // this.metronome.bar(tick);
        });
        this.pulse.start();
    }

    getNextPosition(position = this.state.position, measures = this.props.measures) {
        let barIndex = position[0];
        let chordIndex = position[1] + 1;
        if (chordIndex > measures[barIndex].length - 1) {
            chordIndex = 0;
            barIndex = (barIndex + 1) % measures.length;
        }
        return [barIndex, chordIndex];
    }

    playNextChord(measures = this.props.measures, bpm = 220, beatsPerMeasure = 4, forms = 2) {
        const position = !this.state.position ? [0, 0] : this.getNextPosition();
        this.playChordAtPosition(position);
    }
}
