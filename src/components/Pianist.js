import React from 'react';
import * as Note from 'tonal-note';
import * as WAAClock from 'waaclock';
import { sounds } from '../assets/sounds/sounds.js';

/* const center = pc =>
  pc ? (pc[0] === "A" || pc[0] === "B" ? pc + 3 : pc + 4) : null; */

export default class Pianist extends React.Component {
    buffers = {};
    ctx;
    midiOffset = 36;
    constructor() {
        super();
        this.state = {
            notes: []
        };
    }

    componentDidMount() {
        if (this.props.onMounted) {
            this.props.onMounted(this)
        }
    }

    // returns buffer from buffer cache or loads buffer data from source
    getBuffer(src, context) {
        if (this.buffers[src] && this.buffers[src].context === context) {
            return Promise.resolve(this.buffers[src].buffer);
        }
        return fetch(src)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                return new Promise((resolve, reject) => {
                    context.decodeAudioData(buffer, (decodedData) => {
                        this.buffers[src] = { buffer: decodedData, context };
                        resolve(decodedData);
                    });
                })
            });
    }

    // loads a sound file into the context
    loadSource(src, context) {
        const source = context.createBufferSource();
        return this.getBuffer(src, context).then(decodedData => {
            source.buffer = decodedData;
            source.connect(context.destination);
            return source;
        });
    }
    // loads multiple sources into the context
    loadSources(sources, context) {
        sources.forEach((source, i) => {
            if (!source) {
                console.warn(`note at index ${i} cannot be played!`);
            }
        })
        return Promise.all(sources.filter(source => !!source).map(source => this.loadSource(source, context)));
    }

    // plays the given notes at the given interval
    playNotes(scorenotes, interval = 0,
        context = new AudioContext(),
        clock = new WAAClock(this.ctx, { toleranceEarly: 0.1, toleranceLate: 0.1 })
    ) {
        if (!this.props.overlap) {
            clock.stop();
        }
        clock.start();
        this.loadSources(scorenotes.map(note => sounds[Note.props(note).midi - this.midiOffset]), context)
            .then(sounds => {
                sounds.forEach((sound, i) => {
                    if (interval === 0) {
                        sound.start(0);
                    } else {
                        clock.setTimeout((event) => {
                            sound.start(event.deadline);
                        }, interval * i);
                    }
                })
            });
    }

    /** plays the current setting */
    play(harmonic = this.props.harmonic) {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        if (!this.clock) {
            this.clock = new WAAClock(this.ctx, { toleranceEarly: 0.1, toleranceLate: 0.1 });
        }
        const bpm = this.props.bpm || 200;
        this.playNotes(this.props.notes || [], (harmonic ? 0 : 60 / bpm), this.ctx, this.clock);
    }

    /** Calls play if autoplay is set to true */
    autoplay() {
        if (this.props.autoplay) {
            this.play();
        }
    }

    render() {
       // this.autoplay(); // autoplay on each change
        return (
            <div className="player">
                <a onClick={() => this.play()}>play</a>
            </div>
        );
    }
}
