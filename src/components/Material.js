
import React from 'react';
import { parallelSymbols, symbolClasses } from './Chroma';
import { symbolName } from './Symbols';


export default class Material extends React.Component {

    symbolList(type, items, props) {
        return items.map((item, index) => {
            const data = {
                [type]: item.symbol,
                [type === 'scale' ? 'chord' : 'scale']: null,
                tonic: item.root,
                order: null
            };
            return (<li key={index}
                className={symbolClasses(type, item.symbol, props, item.root)}
                onClick={() => this.props.onClick(data)}
            >
                {item.root}{type === 'scale' ? ' ' : ''}{symbolName(type, item.symbol)}
            </li>);
        });
    }

    render() {
        const similarChords = parallelSymbols('chord', 'roots', this.props.props);
        const similarScales = parallelSymbols('scale', 'roots', this.props.props);
        const subChords = parallelSymbols('chord', 'sub', this.props.props);
        const subScales = parallelSymbols('scale', 'sub', this.props.props);
        const superChords = parallelSymbols('chord', 'super', this.props.props);
        const superScales = parallelSymbols('scale', 'super', this.props.props);
        return (
            <div>
                <h2>Material</h2>
                {subChords.length ? <ul className="scroll">
                    {this.symbolList('chord', subChords, this.props.props)}
                </ul> : ''}
                {subScales.length ? <ul className="scroll">
                    {this.symbolList('scale', subScales, this.props.props)}
                </ul> : ''}
                {(similarChords.concat(similarScales)).length ? <ul className="scroll">
                    {this.symbolList('chord', similarChords, this.props.props)}
                    {this.symbolList('scale', similarScales, this.props.props)}
                </ul> : ''}
                {superChords.length ? <ul className="scroll">
                    {this.symbolList('chord', superChords, this.props.props)}
                </ul> : ''}
                {superScales.length ? <ul className="scroll">
                    {this.symbolList('scale', superScales, this.props.props)}
                </ul> : ''}
            </div>);

    }
}