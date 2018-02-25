
// ripped from https://github.com/danigb/tonal-app/blob/master/src/components/viz/CircleSet.js
import React from "react";
import "./CircleSet.css";
import { stepColor } from './Colorizer';
// check https://codepen.io/n0o0/pen/BpdzOZ
export default class CircleSet extends React.Component {
    /* constructor({ size = 300, offset = 0, chroma = '0', type = 'set', tonic = 'C', flip = false, chromatic = false, onClick, notes, focus, interval }) { */

    history = [[0, 0, 0, 0, 0, 0]];
    animations = [];

    constructor(props) {
        super();
        this.state = {
            interval: null
        }
    }

    enter(e) {
        /* this.setState({ interval: [this.props.tonic, e.target.innerHTML] }); */
    }

    leave(e) {
        /* this.setState({ interval: null }) */
    }

    startAnimation(animation) {
        if (!animation) {
            return;
        }
        animation.beginElement();
    }

    render() {
        const animated = this.props.animated !== undefined ? this.props.animate : true;
        let size = this.props.size || 300;
        if (typeof size === 'string') {
            size = size.replace('px', '')
        }
        size = parseInt(size);
        const center = size / 2;
        const strokeWidth = size * 0.1;
        const radius = size / 2 - strokeWidth / 2;
        let chroma = this.props.chroma || '0';
        if (!this.props.chromatic) {
            // transform chroma from chromatic order to fourths/fifths
            chroma = this.props.chroma.split('').map((p, i, a) => {
                return a[i * 5 % 12];
            }).join('');
        }
        // const circumference = 2 * Math.PI * radius;
        const radians = 2 * Math.PI / 12;
        let offset = this.props.offset || 0;
        let notes = this.props.notes || ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        if (!this.props.chromatic) {
            notes = notes.map((p, i, a) => {
                return a[i * 5 % 12];
            });
        }
        if (this.props.flip) {
            notes = notes.reverse();
            offset += 1;
            chroma = chroma.split('').reverse().join('');
        }
        // calculcate polygon points
        const clinch = 0.8;
        const points = chroma.split('').reduce((points, value, i) => {
            if (value === '1') {
                points.push(Math.round(center + radius * Math.cos((offset + i - 3) * radians) * clinch));
                points.push(Math.round(center + radius * Math.sin((offset + i - 3) * radians) * clinch));
            }
            return points;
        }, []);
        this.history.unshift(points);

        // render note labels
        const fontsize = size / 12;
        const fontclinch = 0.9;
        function noteInfo(note) {
            console.log('note', note);
        }
        const positions = [];
        notes.forEach((note, i) => {
            positions.push(center + radius * Math.cos((offset + i - 3) * radians) * clinch);
            positions.push(center + radius * Math.sin((offset + i - 3) * radians) * clinch);
        });


        const labels = notes
            .map((note, i) => {
                const x = center + radius * Math.cos((offset + i - 3) * radians) * fontclinch - fontsize / 3;
                const y = center + radius * Math.sin((offset + i - 3) * radians) * fontclinch + fontsize / 3;
                const color = stepColor(i, this.props.flip);
                return (
                    <text x={x} y={y} onClick={() => noteInfo(note)} onClick={(e) => handleClick(e, note)}
                        fontFamily="Verdana" fontSize={fontsize} key={i} fill={color} onMouseOver={(e) => this.enter(e)}
                        onMouseOut={(e) => this.leave(e)}>
                        {note}
                    </text>)
            });
        const classNames = 'Circle ' + this.props.type;
        // find out position of tonic circle
        const tonicIndex = notes.indexOf(this.props.tonic) || 0;
        const tonicPosition = {
            x: center + radius * Math.cos((offset + tonicIndex - 3) * radians) * clinch,
            y: center + radius * Math.sin((offset + tonicIndex - 3) * radians) * clinch
        }

        const handleClick = (e, note) => {
            e.preventDefault();
            this.props.onClick(note);
        };
        const color = stepColor(notes.indexOf(this.props.tonic), this.props.flip);
        // hover line?
        let line = ''
        if (this.state.interval && this.state.interval.length === 2) {
            const indices = [notes.indexOf(this.state.interval[0]), notes.indexOf(this.state.interval[1])];
            const vec = [{
                x: center + radius * Math.cos((offset + indices[0] - 3) * radians) * clinch,
                y: center + radius * Math.sin((offset + indices[0] - 3) * radians) * clinch
            }, {
                x: center + radius * Math.cos((offset + indices[1] - 3) * radians) * clinch,
                y: center + radius * Math.sin((offset + indices[1] - 3) * radians) * clinch
            }];
            line = <line x1={vec[0].x} y1={vec[0].y} x2={vec[1].x} y2={vec[1].y} style={{ stroke: 'black', strokeWidth: 2 }} />;
        }
        let animation = '';
        if (animated && this.history.length > 1) {
            animation = <animate fill="freeze" key={this.history.length} ref={(animation) => { this.startAnimation(animation) }} attributeName="points" dur="200ms" from={this.history[1].join(' ')} to={this.history[0].join(' ')} />
            this.animations.push(animation);
        }

        return (
            <svg
                className={classNames}
                width={this.props.size}
                height={this.props.size}
                viewBox={`0 0 ${this.props.size} ${this.props.size}`}
            >
                <polygon className="background" points={positions.join(' ')} />
                <circle className="tonic" cx={tonicPosition.x} cy={tonicPosition.y} r={3} fill={color} />
                <polygon className="shape" points={(animated ? this.history[1] : this.history[0]).join(' ')} fill={color}>
                    {this.animations}
                </polygon>
                {line}
                {this.props.line}
                {labels}
            </svg>
        );
    }
};