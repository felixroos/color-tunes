
import { Soundbank } from './Soundbank';
import * as metronomeUp from './samples/metronome';

export class Metronome {
    soundbank: Soundbank;
    constructor(props = {}) {
        this.soundbank = new Soundbank({ preload: [metronomeUp] });
        this.soundbank.preload.then((loaded) => {
            console.log('metronome ready');
        })
    }
    bar(tick) {
        tick.pulse.tickArray([1, 1, 1, 1].slice(0, Math.floor(tick.cycle)), (t) => {
            this.soundbank.playSources([metronomeUp], t.deadline);
        }, tick.length);
    }
}