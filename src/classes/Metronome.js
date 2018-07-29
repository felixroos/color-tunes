import * as WAAClock from 'waaclock';

export class Metronome {
    callbacks = [];
    constructor(
        bpm = 90,
        cycle = 4
    ) {
        this.bpm = bpm;
        this.cycle = cycle;
        this.tick = 0;
        this.context = new AudioContext();
        this.clock = new WAAClock(this.context, { toleranceEarly: 0.1, toleranceLate: 0.1 });
    }

    getMeasureLength(bpm = this.bpm, beatsPerMeasure = this.cycle) {
        return 60 / bpm * beatsPerMeasure;
    }

    arrayPulse(children, length = 1, path = [], start = 0, callback) {
        if (!Array.isArray(children)) {
            const item = {
                children,
                length,
                path,
                start
            };
            item.timeout = this.clock.setTimeout((event) => callback({ item, event }), start)
            return item;
        }
        const childLength = length / children.length;
        return {
            length,
            children: children.map((el, i) =>
                this.arrayPulse(
                    el,
                    childLength,
                    path.concat([i]),
                    start + i * childLength,
                    callback
                )
            )
        };
    }

    tickArray(array, callback) {
        const length = this.getMeasureLength() * array.length;
        this.clock.start();
        return this.arrayPulse(array, length, [], 0, callback);
    }


    start() {
        this.clock.start();
    }

    pause() {
        this.clock.stop();
    }

    stop() {
        this.clock.stop();
        this.tick = 0;
    }
}