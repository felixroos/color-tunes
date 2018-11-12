
// ripped from https://github.com/danigb/tonal-app/blob/master/src/components/viz/CircleSet.js
import React from 'react';
import "./CircleSet.css";
import { Note } from 'tonal';
import { pitchColor } from '../components/Colorizer';

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

    constructor(props) {
        super();
        this.state = {
            line: null
        }
    }

    getPoint(index, size = 350, offset = 0, clinch = 0.8, outset = 0) {
        const center = size / 2;
        const strokeWidth = size * 0.1;
        const radius = size / 2 - strokeWidth / 2;
        const radians = 2 * Math.PI / 12;
        return [
            (Math.round(center + radius * Math.cos((offset + index - 3) * radians) * clinch - outset)),
            (Math.round(center + radius * Math.sin((offset + index - 3) * radians) * clinch + outset))
        ]
    }

    getPoints(chroma, size, offset, clinch, close, fill, order) {
        let points;
        if (order && this.props.ordered) {
            points = order.reduce((points, i) => {
                const index = circleIndex(i, !this.props.chromatic, this.props.flip);
                return points.concat(this.getPoint(index, size, offset, clinch));
            }, []);
        } else {
            points = chroma.split('').reduce((points, v, i) => {
                const index = circleIndex(i, !this.props.chromatic, this.props.flip);
                const value = chroma.split('')[index];

                if (value === '1') {
                    return points.concat(this.getPoint(i, size, offset, clinch));
                }
                return points;
            }, []);
        }
        if (close) {
            // connect end to start
            points.push(points[0]);
            points.push(points[1]);
        }
        if (fill) {
            const fill = (24 - points.length) / 2;
            for (let p = 0; p < fill; ++p) {
                points = points.concat([points[0], points[1]]);
            }
        }
        return points;
    }

    getPath(points, interconnected, prependEach) {
        return points.reduce((path, point, index) => {
            if (index === 0) {
                path += 'M';
            }
            else if (index % 2 === 0) {
                if (prependEach) {
                    path += prependEach + ' '
                }
                path += 'L';
            }
            path += point + ' ';

            if (interconnected && index > 0 && index % 2 !== 0) {
                path += this.getPath(points, false, `M${points[index - 1]} ${point}`)
            }
            return path;
        }, '')
    }

    isHighlighted(label) {
        return this.props.highlightedNotes && this.props.highlightedNotes
            .map(n => Note.chroma(n)).includes(Note.chroma(label));
    }

    render() {
        let size = this.props.size || 300;
        if (typeof size === 'string') {
            size = size.replace('px', '')
        }
        size = parseInt(size, 10);
        const clinch = 0.8;
        let chroma = this.props.chroma || '0';
        let offset = this.props.offset || 0;
        let labels = this.props.labels || [];
        labels = labels.map((p, i, a) => {
            return a[circleIndex(i, !this.props.chromatic, this.props.flip)];
        });

        let points = this.getPoints(chroma, size, offset, clinch, false, true, this.props.order);
        let bgPoints = this.getPoints(chroma, size, offset, clinch, false, true);
        let positions = this.getPoints(new Array(12).fill(1).join(''), size, offset, clinch);

        // render labels
        const fontsize = size / 12;
        const fontclinch = 0.9;
        const originIndex = labels.indexOf(this.props.origin);
        //const color = stepColor(originIndex, this.props.flip);
        //const bgColor = stepColor(originIndex, this.props.flip, 80);
        const color = pitchColor(this.props.origin, 40, 60);
        const bgColor = pitchColor(this.props.origin, 50, 80);

        const labelNodes = labels
            .map((label, i) => {
                const pos = this.getPoint(i, size, offset, fontclinch, fontsize / 3);
                const active = (this.props.order || []).indexOf(circleIndex(i, !this.props.chromatic, this.props.flip)) === -1;
                const idleColor = !active ? 'black' : 'gray';
                const highlighted = this.isHighlighted(label);
                const style = {
                    textDecoration: highlighted ? 'underline' : 'none',
                    fill: highlighted ? color : idleColor
                };
                return (
                    <text x={pos[0]} y={pos[1]} onClick={(e) => handleClick(e, label)} className={active ? 'active' : ''}
                        fontFamily="Verdana" fontSize={fontsize} key={i} style={style}>
                        {label}
                    </text>)
            });

        const classNames = 'Circle ' + this.props.type;
        const dot = this.getPoint(originIndex, size, offset, clinch);
        const dotPosition = {
            x: dot[0],
            y: dot[1]
        }
        const handleClick = (e, label) => {
            if (!this.props.onClick) {
                return;
            }
            e.preventDefault();
            this.props.onClick(label);
        };
        // hover line?
        let line = ''
        // this.state.line = this.props.order.slice(0, 2).map(i => this.props.labels[i]);
        if (this.state.line && this.state.line.length === 2) {
            const indices = [labels.indexOf(this.state.line[0]), labels.indexOf(this.state.line[1])];
            const points = [this.getPoint(indices[0], size, offset, clinch), this.getPoint(indices[1], size, offset, clinch)];
            const vec = [{
                x: points[0][0],
                y: points[0][1]
            }, {
                x: points[1][0],
                y: points[1][1]
            }];
            line = <line x1={vec[0].x} y1={vec[0].y} x2={vec[1].x} y2={vec[1].y} style={{ stroke: 'black', strokeWidth: 2 }} />;
        }

        const interconnectedPath = this.getPath(points, true);
        const orderedPath = this.getPath(points);
        const bgPath = this.getPath(bgPoints);

        return (
            <div>
                <svg
                    className={classNames}
                    width={this.props.size}
                    height={this.props.size}
                    viewBox={`0 0 ${this.props.size} ${this.props.size}`}
                >
                    <polygon className="background" points={positions.join(' ')} />
                    <path d={bgPath} stroke={color} strokeWidth="0" fill={bgColor}> {/* <!-- fill="none"  --> */}
                    </path>
                    <path className="interconnections" d={interconnectedPath} stroke={color} strokeWidth="3" fill="none">
                    </path>
                    <path className="ordered" d={orderedPath} stroke={color} strokeWidth="3" fill="none">
                    </path>
                    <circle className="origin" cx={dotPosition.x} cy={dotPosition.y} r={5} fill={color} />
                    {line}
                    {this.props.line}
                    {labelNodes}
                </svg>
            </div >
        );
    }
};