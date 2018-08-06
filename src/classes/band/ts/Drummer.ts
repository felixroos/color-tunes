
import { Soundbank } from './Soundbank';
import { kick, snare, hihat, ride } from './samples/drumset/drumset'
import { randomElement } from './util';

export class Drummer {

    styles = {
        'Funk': [
            {
                sounds: [kick],
                pattern: (t) => [1, 0, [0, 1], 1]
            },
            {
                sounds: [snare],
                pattern: (t) => [0, 1, 0, 1]
            },
            {
                sounds: [hihat],
                pattern: (t) => [[0, 1], [0, 1], [0, 1], [0, 1]]
            }
        ],
        'Medium Swing': [
            {
                sounds: [ride],
                pattern: (t) => randomElement([
                    [1, [1, 0, 1], 1, [1, 0, 1]],
                    [1, [0, 0, 1], 1, [0, 0, 1],],
                    [1, 1, [1, 0, 1], 1],
                    [1, 1, 1, [1, 0, 1]],
                ], [3, 2, 1, 2])
            },
            {
                sounds: [hihat],
                pattern: (t) => [0, 1, 0, 1]
            }
        ]
    };
    style = 'Medium Swing';
    soundbank: Soundbank;
    constructor(props = {}) {
        this.soundbank = new Soundbank({ preload: [kick, snare, hihat, ride] });
        this.soundbank.preload.then((loaded) => {
            console.log('drummer ready');
        })
    }
    bar(tick) {
        this.styles[this.style].forEach(track => {
            const pattern = track.pattern(tick).slice(0, Math.floor(tick.cycle));
            tick.pulse.tickArray(pattern, (t) => {
                this.soundbank.playSources(track.sounds, t.deadline);
            }, tick.length);
        });
    }
}