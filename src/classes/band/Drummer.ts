
import { Soundbank } from './Soundbank.js';
import * as kick from '../assets/drummer/kick.wav';
import * as snare from '../assets/drummer/snare.wav';
import * as hihat from '../assets/drummer/hihat.wav';
import * as ride from '../assets/drummer/ride.wav';
import { randomElement } from './util.js';

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

    /* bars(n,bpm) {
        this.styles[this.style].forEach(track => {
            const pattern = new Array(n).fill(0)
                .reduce((p, n) => p.concat(track.pattern(tick).slice(0, Math.floor(tick.cycle))), []);

            tick.pulse.tickArray(pattern, (t) => {
                this.soundbank.playSources(track.sounds, t.deadline);
            }, tick.length * n);
        });
    } */
}