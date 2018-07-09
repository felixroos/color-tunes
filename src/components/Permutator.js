import React from 'react';
import * as Note from 'tonal-note';
import * as Distance from 'tonal-distance';
import * as Interval from 'tonal-interval';
import Randomizer from './Randomizer';

export default class Permutator extends React.Component {

    constructor() {
        super();
        this.state = {
            options: null,
            showRandomizer: false
        };
    }

    componentDidMount() {
    }

    getStep(interval) {
        if (!interval) {
            console.warn('undefined interval');
            return;
        }
        let step = interval;
        const down = step[0] === '-';
        if (down) {
            step = Interval.invert(step);
            step = step.slice(1, step.length);
        }
        step = (step[step.length - 1] + step.slice(0, step.length - 1))
            .replace('m', 'b')
            .replace('M', '')
            .replace('P', '')
            .replace('A', '#');

        if (step === 'd5') {
            step = 'b5';
        }
        return step;
    }

    clickedStep(step, index) {
        console.log('step', step, index);
    }

    getTonicIndex() {
        return this.props.tonic ? this.props.options.map(n => Note.pc(n)).indexOf(this.props.tonic) : 0;
    }

    getStepClass(note, index, chroma) {
        const inside = () => {
            return !chroma || chroma[Note.chroma(note)] === '1'
        };
        const classes = {
            highlight: this.props.highlightedNotes && this.props.highlightedNotes.includes(this.props.notes[index]),
            active: this.getTonicIndex() === index && inside(),
            sub: this.getTonicIndex() !== index && inside()
        }
        return Object.keys(classes).filter(key => classes[key]).join(' ');
    }

    applySequence(random) {
        const order = random.map(step => {
            if (!step) {
                return 0;
            }
            return Distance.transpose(this.props.tonic, step.value)
        });
        if (this.props.onRandom) {
            this.props.onRandom(order);
        }
    }

    render() {
        const tonicIndex = this.getTonicIndex(this.props.options);
        const tonic = this.props.options[tonicIndex || 0];

        const notes = this.props.notes;

        const intervals = notes
            .map(note => Interval.simplify(Distance.interval(tonic, note)))
            .filter(s => !!s);

        const steps = intervals.map(interval => this.props.showSteps ? this.getStep(interval) : interval)
            .filter(s => !!s);

        const _steps = steps.map((step, i) =>
            <li className={this.getStepClass(notes[i], i, this.props.fixedChroma)}
                onClick={() => this.clickedStep(step, i)} key={i}>
                {step}
            </li>);


        /** prepare options for randomizer */
        const allIntervalsSorted = this.props.options
            .map(note => Distance.interval(tonic, note))
            .sort((a, b) => Interval.semitones(a) > Interval.semitones(b) ? -1 : 1)
            .filter(s => !!s);

        const allStepsSorted = allIntervalsSorted.map(interval => this.props.showSteps ? this.getStep(interval) : interval)
            .filter(s => !!s);
        const options = allIntervalsSorted
            .map((value, i) => {
                return { value, label: allStepsSorted[i] }
            });

        const current = intervals.map((value, i) => ({ value, label: steps[i] }));
        const defaultItems = [].concat(options);//.filter(o => o.value !== 'CHR');
        /* .concat([{ label: 'CHR', value: 'c' }]); */

        const randomizer = this.state.showRandomizer ? <Randomizer current={current} onRandom={(items) => this.applySequence(items)} items={options} defaultItems={defaultItems} /> : '';
        return (
            <div>
                <ul className="permutator">
                    {_steps}
                    <li className={this.state.showRandomizer ? 'active' : ''} onClick={() => this.setState({ showRandomizer: !this.state.showRandomizer })}> randomizer</li>
                </ul>
                {randomizer}
            </div>
        );
    }
}
