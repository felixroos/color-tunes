
// ripped from https://github.com/danigb/tonal-app/blob/master/src/components/viz/CircleSet.js
import React from "react";
import * as Note from 'tonal-note';
import "./CircleSet.css";
import { stepColor } from './Colorizer';

export function circleIndex(index, fourths, flip) {
    if (!fourths && !flip) {
        return index;
    }
    if (!fourths) {
        return 12 - index;
    }
    if (fourths && !flip) {
        return index * 5 % 12;
    }
    if (fourths && flip) {
        return (12 - index) * 5 % 12;
    }
}

// check https://codepen.io/n0o0/pen/BpdzOZ
export class CircleSet extends React.Component {
    history = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

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

    getPoints(chroma, size, offset, clinch, order) {

        const center = size / 2;
        const strokeWidth = size * 0.1;
        const radius = size / 2 - strokeWidth / 2;
        const radians = 2 * Math.PI / 12;
        if (order && this.props.ordered) {
            return order.reduce((points, i) => {
                const index = circleIndex(i, !this.props.chromatic, this.props.flip);
                points.push(Math.round(center + radius * Math.cos((offset + index - 3) * radians) * clinch));
                points.push(Math.round(center + radius * Math.sin((offset + index - 3) * radians) * clinch));
                return points;
            }, []);
        }

        return chroma.split('').reduce((points, v, i) => {
            const index = circleIndex(i, !this.props.chromatic, this.props.flip);
            const value = chroma.split('')[index];
            if (value === '1') {
                points.push(Math.round(center + radius * Math.cos((offset + i - 3) * radians) * clinch));
                points.push(Math.round(center + radius * Math.sin((offset + i - 3) * radians) * clinch));
            }
            return points;
        }, []);
    }


    render() {
        const animated = this.props.animated !== undefined ? this.props.animate : true;
        let size = this.props.size || 300;
        if (typeof size === 'string') {
            size = size.replace('px', '')
        }

        let order = this.props.notes ?
            this.props.notes
                /* .map(note => Note.chroma(note)) */
                .map(note => Note.props(note).chroma)
            : null;
        size = parseInt(size, 10);
        const center = size / 2;
        const strokeWidth = size * 0.1;
        const radius = size / 2 - strokeWidth / 2;
        let chroma = this.props.chroma || '0';
        // const circumference = 2 * Math.PI * radius;
        const radians = 2 * Math.PI / 12;
        let offset = this.props.offset || 0;
        let notes = this.props.labels || ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

        notes = notes.map((p, i, a) => {
            return a[circleIndex(i, !this.props.chromatic, this.props.flip)];
        });

        const clinch = 0.8;

        let points = this.getPoints(chroma, size, offset, clinch, order);

        points.push(points[0]);
        points.push(points[1]);

        const fill = (24 - points.length) / 2;
        for (let p = 0; p < fill; ++p) {
            points = points.concat([points[0], points[1]]);
        }
        this.history.unshift(points);

        // render note labels
        const fontsize = size / 12;
        const fontclinch = 0.9;

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
                let match;
                if (this.props.notes) {
                    match = this.props.notes.find(n => Note.chroma(n) === Note.chroma(note));
                    note = match || note;
                }
                return (
                    <text x={x} y={y} onClick={(e) => handleClick(e, note)} className={!match ? 'active' : ''}
                        fontFamily="Verdana" fontSize={fontsize} key={i} fill={color} onMouseOver={(e) => this.enter(e)}
                        onMouseOut={(e) => this.leave(e)}>
                        {note}
                    </text>)
            });
        const classNames = 'Circle ' + this.props.type;
        // find out position of tonic circle
        const tonicIndex = circleIndex(Note.props(this.props.tonic).chroma, !this.props.chromatic, this.props.flip);

        const tonicPosition = {
            x: center + radius * Math.cos((offset + tonicIndex - 3) * radians) * clinch,
            y: center + radius * Math.sin((offset + tonicIndex - 3) * radians) * clinch
        }

        const handleClick = (e, note) => {
            if (!this.props.onClick) {
                return;
            }
            e.preventDefault();

            this.props.onClick(Note.simplify(note));
        };
        const color = stepColor(notes.indexOf(this.props.tonic), this.props.flip);
        const bgColor = stepColor(notes.indexOf(this.props.tonic), this.props.flip, 80);
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
            /* this.animations.push(animation); */
        }
        let skeletons = '';

        /* if (this.props.skeletons) {
            skeletons = this.props.skeletons.map((skeleton, index) => {
                const points = this.getPoints(skeleton, size, offset, clinch, this.state.flip);
                return (<polygon key={index} className="skeleton" points={points.join(' ')} fill="transparent" />)
            });
        } */
        const path = this.history[0].reduce((path, point, index) => {
            if (index === 0) {
                path += 'M';
            }
            else if (index % 2 === 0) {
                path += 'L';
            }
            path += point + ' ';
            return path;
        }, '')
        return (
            <div>
                <svg
                    className={classNames}
                    width={this.props.size}
                    height={this.props.size}
                    viewBox={`0 0 ${this.props.size} ${this.props.size}`}
                >
                    <polygon className="background" points={positions.join(' ')} />
                    {/* <polygon className="shape" points={(animated ? this.history[1] : this.history[0]).join(' ')} fill={color} strokeWidth="2">
                        {animation}
                    </polygon> */}
                    <path className="shape" d={path} stroke={color} fill={bgColor} strokeWidth="3">
                    </path>
                    <circle className="tonic" cx={tonicPosition.x} cy={tonicPosition.y} r={5} fill={color} />
                    {skeletons}
                    {line}
                    {this.props.line}
                    {labels}
                </svg>
            </div >
        );
    }
};