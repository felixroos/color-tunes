import React from 'react';
import * as Note from 'tonal-note';
import { sounds } from '../assets/sounds/sounds.js';
import { Soundbank } from '../classes/Soundbank.js';

// TODO: remove react stuff => DOM = async

export default class Pianist/*  extends React.Component */ {
    ctx;
    midiOffset = 36;
    constructor(props = { bpm: 200 }) {
        this.props = props;
        /* super(); */
        this.soundbank = new Soundbank({
            onTrigger: (indices) => {
                if (this.props.onTrigger) {
                    this.props.onTrigger(indices);
                }
            }, onStop: (indices) => {
                if (this.props.onStop) {
                    this.props.onStop(indices);
                }
            }
        });
    }

    /* componentDidMount() {
        if (this.props.onMounted) {
            this.props.onMounted(this)
        }
    } */

    // plays the given notes at the given interval
    playNotes(scorenotes, deadline = 0, interval = 0) {
        const sources = scorenotes.map(note => sounds[Note.props(note).midi - this.midiOffset]);
        this.soundbank.playSources(sources, deadline, interval);

    }

    /** plays the current setting */
    play(harmonic = this.props.harmonic) {
        const bpm = this.props.bpm || 200;
        this.playNotes(this.props.notes || [], 0, (harmonic ? 0 : 60 / bpm));
    }

    /** Calls play if autoplay is set to true */
    autoplay() {
        if (this.props.autoplay) {
            this.play();
        }
    }

    render() {
        return (
            <div className="player">
                <a onClick={() => this.play()}>play</a>
            </div>
        );
    }
}
