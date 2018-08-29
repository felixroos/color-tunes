
import React from 'react';
import * as tinycolor from 'tinycolor2';
import { Note, Distance } from 'tonal';
import './colors.css';
import PianoKeyboard from '../components/PianoKeyboard';

export default class ColorTest extends React.Component {

    constructor() {
        super();
        this.state = {
            offset: 0,
            saturation: 60,
            brightness: 60,
            heightFactor: 50
        }
    }

    pitchIndex(pitch) {
        //return (Distance.fifths('C', pitch) + 12) % 12;
        return (Distance.semitones('C', pitch) + 12) % 12;
    }

    // https://bl.ocks.org/naoyak/raw/fd51e7e589ad5a0f6b0a6ffdd125e91a/

    pitchColor(note, saturation = 100, brightness = 50, offset = 0) {
        const hue = (this.pitchIndex(note) + 12 - (offset / 100) * 12) % 12 / 12 * 360;
        return tinycolor(`hsl(${hue},${saturation}%,${brightness}%)`).toString();
    }

    midiColor(midi) {
        const height = 1//midi / 88 + this.state.heightFactor / 100;
        return this.pitchColor(
            Note.props(Note.fromMidi(midi)).name,
            this.state.saturation * height, this.state.brightness * height, this.state.offset
        );
    }

    render() {
        // Note.names(' b').forEach(note => console.log(Note.props(note)))
        let circle = Note.names(' b')
            .sort((a, b) => this.pitchIndex(a) <= this.pitchIndex(b) ? -1 : 1);
        /* circle = Array.rotate(-1, circle); */

        const colors = circle.map(note => this.pitchColor(note, this.state.saturation, this.state.brightness, this.state.offset))
            .map(backgroundColor => ({ backgroundColor }))
            .map((style, index) => (
                <div key={index} className="color" style={style}>
                    {circle[index]}
                </div>
            ))
        return (
            <div>
                <div className="colors">
                    {colors}
                </div>
                <PianoKeyboard colorize={(midi) => this.midiColor(midi)}></PianoKeyboard>
                <input type="range" value={this.state.offset} onChange={((e) => this.setState({ offset: e.target.value }))} min="0" max="100" className="slider" />
                <input type="range" value={this.state.saturation} onChange={((e) => this.setState({ saturation: e.target.value }))} min="0" max="100" className="slider" />
                <input type="range" value={this.state.brightness} onChange={((e) => this.setState({ brightness: e.target.value }))} min="0" max="100" className="slider" />
                {/* <input type="range" value={this.state.heightFactor} onChange={((e) => this.setState({ heightFactor: e.target.value }))} min="0" max="100" className="slider" /> */}
            </div>
        );
    }
}