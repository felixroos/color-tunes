import * as tinycolor from 'tinycolor2';
import { Distance } from 'tonal';

export function stepHue(step, flip = false) {
    let colorshift = 4;
    let offset = 25;
    if (flip) {
        colorshift = 12 - colorshift;
        offset = 30 - offset;
    }
    let hue = ((step + colorshift) % 12 * 30 + offset) % 360;
    if (flip) {
        hue = 360 - hue;
    }
    return hue;
}

export function stepColor(step, flip = false, opacity = 50) {
    return `hsl(${stepHue(step, flip)},40%,${opacity}%)`;
}


export function pitchIndex(pitch) {
    //return (Distance.fifths('C', pitch) + 12) % 12;
    return (Distance.semitones('C', pitch) + 12) % 12;
}

export function pitchColor(note, saturation = 100, brightness = 50, offset = 0) {
    if (!note) {
        return '#ccc';
    }
    const hue = (pitchIndex(note) + 12 - (offset / 100) * 12) % 12 / 12 * 360;
    return tinycolor(`hsl(${hue},${saturation}%,${brightness}%)`).toString();
}

