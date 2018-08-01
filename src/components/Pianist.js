import * as Distance from 'tonal-distance';
import * as Note from 'tonal-note';
import { sounds } from '../assets/sounds/sounds.js';
import { Soundbank } from '../classes/Soundbank.js';
import { Interval } from '../../node_modules/tonal';

export default class Pianist {
    ctx;
    midiOffset = 36;
    playedNotes = [];

    constructor(props = { bpm: 200 }) {
        this.props = props;
        this.soundbank = new Soundbank({
            onTrigger: (indices) => {
                if (this.props.onTrigger) {
                    const notes = this.getLastVoicing();
                    this.props.onTrigger(notes);
                }
            }, onStop: (indices) => {
                if (this.props.onStop) {
                    this.props.onStop(indices);
                }
            }
        });
    }

    smallestDistance(semitones) {
        if (Math.abs(semitones) <= 6) {
            return semitones;
        }
        return semitones > 6 ? semitones - 12 : semitones + 12;
    }

    getLastVoicing() {
        return this.playedNotes.length ? this.playedNotes[this.playedNotes.length - 1] : null;
    }

    getMidi(note) {
        return Note.props(note).midi - this.midiOffset;
    }

    getVoicing(scorenotes, before) {
        if (!before) {
            return scorenotes;
        }
        /* const nearest = scorenotes
            .map(note => Distance.semitones(before[0], note))
            .map(d => this.smallestDistance(d))
            .map(distance => Note.simplify(Distance.transpose(before[0], Interval.fromSemitones(distance))))
            .sort((a, b) => this.getMidi(a) < this.getMidi(b) ? -1 : 1); */

        const nearest = scorenotes
            .map(note => before
                .map(n => Distance.semitones(n, note))
                .map(d => this.smallestDistance(d))
            ).map(distances => {
                const smallest = [].concat(distances).sort((a, b) => Math.abs(a) < Math.abs(b) ? -1 : 1)[0];
                const root = before[distances.indexOf(smallest)];
                return Note.simplify(Distance.transpose(root, Interval.fromSemitones(smallest)));
            });
        // TODO: find way to compact the chord..
        /* console.log(scorenotes, '=>', nearest); */
        return nearest;
    }

    // plays the given notes at the given interval
    playNotes(scorenotes, deadline = 0, interval = 0) {
        console.log('playnotes', scorenotes);
        if (this.props.intelligentVoicings) {
            console.log('voice...');
            const before = this.getLastVoicing();
            scorenotes = this.getVoicing(scorenotes, before);
        }
        this.playedNotes.push(scorenotes);

        const sources = scorenotes.map(note => sounds[this.getMidi(note)]);
        this.soundbank.playSources(sources, deadline, interval);
    }

    /** plays the current setting */
    play(harmonic = this.props.harmonic) {
        const bpm = this.props.bpm || 200;
        // this.playNotes(this.props.notes || [], 0, (harmonic ? 0 : 60 / bpm));
        this.playNotes(this.getLastVoicing(), 0, (harmonic ? 0 : 60 / bpm));
    }

    /** Calls play if autoplay is set to true */
    autoplay() {
        if (this.props.autoplay) {
            this.play();
        }
    }
}
