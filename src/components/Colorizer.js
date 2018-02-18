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

export function stepColor(step, flip = false) {
    return `hsl(${stepHue(step, flip)},40%,50%)`;
}