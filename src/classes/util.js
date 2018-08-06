export function randomNumber(n) {
    return Math.floor(Math.random() * n)
}

export function arraySum(array) {
    return array.reduce((s, i) => s + i, 0);
}

export function randomElement(array, weighted) {
    if (!weighted) {
        return array[randomNumber(array.length)];
    }
    const r = randomNumber(arraySum(weighted)) + 1;
    const total = weighted
        .reduce((abs, w, i) => abs.concat(w + (abs.length ? abs[i - 1] : 0)), []);
    return array[total.indexOf(total.find((s, i) => s >= r))];
}


// decides if a one should be played based on last pattern
export function getOne(latest) {
    if (!latest || !latest.length) {
        return 1;
    }
    const zero = latest[latest.length - 1].length === 3 && latest[latest.length - 1][2] !== 0;
    return zero ? 0 : 1;
}



/* getAllInversion(notes) {
    return notes.map((n, i) => TonalArray.rotate(i, notes));
} 
 
getIntervals(notes) {
    return notes.reduce((intervals, note, index) => {
        if (index >= notes.length - 1) {
            return intervals;
        }
        intervals.push(Distance.interval(note, notes[index + 1]));
        return intervals;
    }, []);
}
 
invert(notes, times) {
    return TonalArray.rotate(times,
        notes.map((note, index) => index < times ? Distance.transpose(note, 'P8') : note))
}
*/