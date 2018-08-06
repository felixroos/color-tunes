
import { Soundbank } from './Soundbank';
import metronomeUp from '../assets/MetronomeUp.wav';

export class Metronome {
    constructor(props = {}) {
        this.soundbank = new Soundbank({ preload: [metronomeUp], context: props.context });
        this.ready = this.soundbank.preload;
    }
    bar(tick) {
        tick.pulse.tickArray([1, 1, 1, 1].slice(0, Math.floor(tick.cycle)), (t) => {
            this.soundbank.playSources([metronomeUp], t.deadline);
        }, tick.length);

        /* tick.pulse.tickArray([1, 1, 1, 1].slice(0, Math.floor(beats)), (t) => {
            this.soundbank.playSources([metronomeUp], t.event.deadline);
        }, tick.length); */
    }
}