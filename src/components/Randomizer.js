import React from 'react';

export default class Randomizer extends React.Component {
    options;
    constructor() {
        super();
        this.state = {
            options: null,
            chessOffset: 0,
            chessGrain: 3,
            unique: false,
            sequence: [],
            maxPicks: 3, // maximal allowed occurence of an option in a random set
            maxRepeats: 0, // maximal allowed repetition of the same option
        };
    }

    componentDidMount() {
    }

    findValue(options, value) {
        return options.find(o => o && o.value === value);
    }


    toggle(x, y, options, max) {
        if (this.state.unique && x > (max - 1)) {
            // item wont ever be in possible options
            return;
        }
        options[x][y] = !options[x][y];
        this.setState({ options: [].concat(this.state.options || options) });
    }

    chessPattern(items, options, grain = this.state.chessGrain || 2, offset = this.state.chessOffset || 0) {
        options = options.map((option, i) => [].concat(
            //items.filter((item, j) => j % grain === (i + offset) % grain))
            items.map((item, j) => (j % grain === (i + offset) % grain)))
        );
        this.setState({
            options,
            chessOffset: (this.state.chessOffset + 1) % grain
        });
        this.generate(options, items);
    }

    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    randomize(options, items, unique = this.state.unique, lastResult = [], maxPicks = this.state.maxPicks, maxRepeats = this.state.maxRepeats, ) {
        return options
            .reduce((result, option, x) => {
                const maxCombo = Math.min(maxRepeats + 1, result.length);
                const pool = items
                    .filter((item, i) => option[i])
                    .filter(item => !unique || !this.findValue(result, item.value))
                    .filter(item => result.filter(r => r && r.value === item.value).length < maxPicks)
                    .filter(item =>
                        maxCombo === 0 || !result.slice(-maxCombo)
                            .reduce((combo, r) => r && r.value && combo && r.value === item.value, true)
                    )
                return result.concat(
                    this.randomItem(pool)
                )
            }, lastResult).filter(r => !!r);
    }

    generate(options, items, unique = this.state.unique) {
        const sequence = this.randomize(options, items, unique);
        this.setState({ sequence });
        if (this.props.onRandom) {
            this.props.onRandom(sequence);
        }
    }

    getItemClass(item, active, current, index, max) {
        //const sub = !!this.findValue(array, item.value);
        if (this.state.unique && index > (max - 1)) {
            // item wont ever be in possible options
            return;
        }
        if (!item.value) {
            console.log('nöp');
            return;
        }
        const chosen = current[index] && current[index].value === item.value;
        return (active ? 'sub ' : '') + /* (sub && active ? 'active' : '') + */ (chosen ? 'parallel' : '');
    }

    defaultItems(x, y) {
        x = Math.max(0, x);
        //return new Array(length).fill(0).map(() => [].concat(this.props.defaultItems));
        return new Array(x).fill(0).map(() => new Array(y).fill(true));
    }
    setLength(length, items, sequence = this.state.sequence, options = this.state.options) {
        if (length > sequence.length) {
            //const extraSequence = this.randomize(this.defaultItems(length - sequence.length, items.length), items, this.state.unique);
            const appendOptions = this.defaultItems(length - sequence.length, items.length);
            sequence = this.randomize(appendOptions, items, this.state.unique, sequence);
        } else if (length < sequence.length) {
            sequence = sequence.slice(0, length);
            options = options ? options.slice(0, length) : this.state.options;
        } else {
            return;
        }
        this.setState({ length, sequence, options });

        if (this.props.onRandom) {
            this.props.onRandom(sequence);
        }
    }

    render() {
        const items = this.props.items;
        const current = this.props.current;
        /* const defaultItems = this.props.defaultItems; */
        const length = this.state.length || this.props.length || items.length;
        // slice/fill option length
        let options = (this.state.options || []);
        options = options.slice(0, length).concat(this.defaultItems(length - options.length, items.length));


        if (!this.state.length && !this.props.length && options.length < items.length) {
            options = options.concat(new Array(items.length - options.length)).fill(0)
                .map(() => [].concat(items));
            console.log('options fill', options);
        }
        const _options =
            options.map((option, i) =>
                <div className="option-container" key={i}>
                    <ul className="options">
                        {items.map((step, j) => (
                            <li key={i + ',' + j} className={this.getItemClass(step, option[j], current, i, items.length)}
                                onClick={() => this.toggle(i, j, options, items.length)}>
                                {step.label}
                            </li>
                        ))}
                    </ul>
                </div>)

        return (
            <div>
                <div className="randomizer">
                    {_options}
                </div>
                <ul>
                    <li onClick={() => this.generate(options, items)}>randomize</li>
                    <li className={this.state.unique ? 'active' : ''} onClick={() => this.setState({ unique: !this.state.unique })}>unique</li>
                    <li onClick={() => this.chessPattern(items, options, 2)}>chess 2</li>
                    <li onClick={() => this.chessPattern(items, options, 3)}>chess 3</li>
                    <li onClick={() => this.chessPattern(items, options, 4)}>chess 4</li>
                    <li onClick={() => this.setLength(length - 1, items)}>-</li>
                    <li onClick={() => this.setLength(length, items)}>{length}/{items.length}</li>
                    <li onClick={() => this.setLength(length + 1, items)}>+</li>
                </ul>
            </div >
        );
    }
}
