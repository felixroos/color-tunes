import React from 'react';
import * as Tone from 'tone';
import '@tonejs/ui';

window.Tone = Tone;

export class Microphone extends React.Component {
    elements = [];
    state = {};

    listen() {
        const mic = new Tone.UserMedia();
        mic.open().then((m) => {
            console.log('got it', m, this.mic);
            //promise resolves when input is available
        });
        this.setState({ mic });
    }

    render() {
        return <div>
            <button onClick={() => this.listen()}>Listen</button>
            <tone-content>
                <tone-piano></tone-piano>
                <tone-fft ref={el => el && this.state.mic && el.bind(this.state.mic)}></tone-fft>
                <tone-meter ref={el => el && this.state.mic && el.bind(this.state.mic)}></tone-meter>
                <tone-oscilloscope ref={el => el && this.state.mic && el.bind(this.state.mic)}></tone-oscilloscope>
                <tone-microphone ref={el => el && this.state.mic && el.bind(this.state.mic)}></tone-microphone>
                <tone-compressor/>
            </tone-content>
        </div>;
    }
}