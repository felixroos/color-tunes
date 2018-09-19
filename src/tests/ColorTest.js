
import React from 'react';
import { Note } from 'tonal';
import './colors.css';
import PianoKeyboard from '../components/PianoKeyboard';
import { pitchColor, pitchIndex } from '../components/Colorizer';
import { colorConfig } from '../config';

export default class ColorTest extends React.Component {

    constructor() {
        super();
        this.state = {
            offset: 0,
            saturation: colorConfig.saturationDefault,
            brightness: colorConfig.brightnessDefault,
            heightFactor: 50
        }
    }


    midiColor(midi) {
        return pitchColor(
            Note.props(Note.fromMidi(midi)).name,
            this.state.saturation, this.state.brightness, this.state.offset
        );
    }

    render() {
        // Note.names(' b').forEach(note => console.log(Note.props(note)))
        let circle = Note.names(' b')
            .sort((a, b) => pitchIndex(a) <= pitchIndex(b) ? -1 : 1);
        /* circle = Array.rotate(-1, circle); */

        const colors = circle.map(note => pitchColor(note, this.state.saturation, this.state.brightness, this.state.offset))
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