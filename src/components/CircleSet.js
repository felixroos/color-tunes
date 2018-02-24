
// ripped from https://github.com/danigb/tonal-app/blob/master/src/components/viz/CircleSet.js
import React from "react";
import "./CircleSet.css";
import { stepColor } from './Colorizer';
// check https://codepen.io/n0o0/pen/BpdzOZ
export default ({ size = 300, offset = 0, chroma = '0', type = 'set', tonic = 'C', flip = false, chromatic = false, onClick, notes }) => {
    if (typeof size === 'string') {
        size = size.replace('px', '')
    }
    size = parseInt(size);
    const center = size / 2;
    const strokeWidth = size * 0.1;
    const radius = size / 2 - strokeWidth / 2;
    if (!chromatic) {
        // transform chroma from chromatic order to fourths/fifths
        chroma = chroma.split('').map((p, i, a) => {
            return a[i * 5 % 12];
        }).join('');
    }
    // const circumference = 2 * Math.PI * radius;
    const radians = 2 * Math.PI / 12;
    notes = notes || ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    if (!chromatic) {
        notes = notes.map((p, i, a) => {
            return a[i * 5 % 12];
        });
    }
    if (flip) {
        notes = notes.reverse();
        offset += 1;
        chroma = chroma.split('').reverse().join('');
    }
    // calculcate polygon points
    const clinch = 0.8;
    const points = chroma.split('').reduce((points, value, i) => {
        if (value === '1') {
            points.push(center + radius * Math.cos((offset + i - 3) * radians) * clinch);
            points.push(center + radius * Math.sin((offset + i - 3) * radians) * clinch);
        }
        return points;
    }, []);
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
            const color = stepColor(i, flip);
            return (
                <text x={x} y={y} onClick={() => noteInfo(note)} onClick={(e) => handleClick(e, note)}
                    fontFamily="Verdana" fontSize={fontsize} key={i} fill={color}>
                    {note}
                </text>) //<!-- fill={color} -->
        });
    const classNames = 'Circle ' + type;
    // find out position of tonic circle
    const tonicIndex = notes.indexOf(tonic) || 0;
    const tonicPosition = {
        x: center + radius * Math.cos((offset + tonicIndex - 3) * radians) * clinch,
        y: center + radius * Math.sin((offset + tonicIndex - 3) * radians) * clinch
    }

    const handleClick = (e, note) => {
        e.preventDefault();
        onClick(note);
    };
    const color = stepColor(notes.indexOf(tonic), flip);
    //<circle className="background" cx={center} cy={center} r={radius * clinch} />
    return (
        <svg
            className={classNames}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
        >
            <polygon className="background" points={positions.join(' ')} />
            <circle className="tonic" cx={tonicPosition.x} cy={tonicPosition.y} r={3} fill={color} />
            <polygon className="shape" points={points.join(' ')} fill={color} />
            {labels}
        </svg>
    ); //fill={color}
};