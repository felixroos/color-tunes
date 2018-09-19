// ripped from https://github.com/danigb/tonal-app/blob/master/src/components/viz/PianoKeyboard.js
import cat from "classcat";
import React from 'react';
import { Array, Note } from "tonal";
import { circleIndex } from "./CircleSet";
import { pitchColor } from './Colorizer';
import { stepColor } from './Colorizer';
import { colorConfig } from '../config';
import "./PianoKeyboard.css";

const scale = 0.5;
const WHITES = [0, 2, 4, 5, 7, 9, 11];
const BLACKS = [1, 3, 6, 8, 10];
const BPOS = [1, 2, 4, 5, 6];
const WHITE_WIDTH = 40 * scale;
const WHITE_HEIGHT = 150 * scale;
const BLACK_WIDTH = 22 * scale;
const BLACK_HEIGHT = 90 * scale;

const getKeyTypes = (type, midi, pcset, scorenotes, highlightedNotes = []) => {
    const chroma = midi % 12;
    const active = () => scorenotes && !!scorenotes.find(note => Note.props(note).midi === midi);
    const highlight = () => highlightedNotes && !!highlightedNotes.find(note => Note.props(note).midi === midi);
    return cat([
        "piano-key",
        type,
        {
            active: active(),
            tonic: active() && pcset.tonic === chroma,
            chroma: pcset.chroma[chroma] === "1",
            'chroma-tonic': pcset.tonic === chroma,
            highlight: highlight(),
        }
    ]);
};

const Key = ({ type, chroma, i, oct, pcset, scorenotes, highlightedNotes, x, onClick, colorize }) => {
    const isWhite = type === "white";
    const midi = (oct) * 12 + chroma;
    const offset = (isWhite
        ? i * WHITE_WIDTH
        : WHITE_WIDTH * BPOS[i] - BLACK_WIDTH / 2)

    const handleClick = e => {
        e.preventDefault();
        onClick(midi);
    };
    const keyClass = `note-${midi} ${getKeyTypes(type, midi, pcset, scorenotes, highlightedNotes)}`;
    const style = {};
    if (colorize) {
        Object.assign(style, {
            fill: colorize(midi, isWhite)
        });
    }

    return (
        <rect
            key={"note-" + midi}
            id={"note-" + midi}
            style={style}
            className={keyClass}
            width={isWhite ? WHITE_WIDTH : BLACK_WIDTH}
            height={isWhite ? WHITE_HEIGHT : BLACK_HEIGHT}
            x={x + offset}
            onClick={handleClick}
        />
    );
};

const Octave = props => {
    return (
        <g id={"octave-" + props.oct}>
            {WHITES.map((chroma, i) => (
                <Key key={chroma} type="white" chroma={chroma} i={i} {...props} />
            ))}
            {BLACKS.map((chroma, i) => (
                <Key key={chroma} type="black" chroma={chroma} i={i} {...props} />
            ))}
        </g>
    );
};

export default ({
    className,
    setChroma,
    setTonic,
    width,
    scorenotes,
    highlightedNotes,
    onClick,
    minOct = 1,
    maxOct = 9,
    colorize
}) => {
    const pcset = { tonic: setTonic, chroma: setChroma || "" };

    const leftKeyCut = 5;
    const rightKeyCut = 6;
    const octs = Array.range(minOct, maxOct);
    // const viewWidth = 1120
    const viewWidth = octs.length * 7 * WHITE_WIDTH - ((leftKeyCut + rightKeyCut) * WHITE_WIDTH);

    width = width || "100%";
    const tonic = Note.names(' b')[setTonic];
    /* 
    const index = circleIndex(setTonic, true);
    const highlight = stepColor(index, false, 30);
    const color = stepColor(index, false);
    const bgColor = stepColor(index, false, 80); */

    const highlight = pitchColor(tonic, colorConfig.saturationActive, colorConfig.brightnessActive);
    const bgColor = pitchColor(tonic, colorConfig.saturationDefault, colorConfig.brightnessDefault);
    const color = pitchColor(tonic, colorConfig.saturationActive, colorConfig.brightnessActive);

    const style = `
      .piano-key.active {
        fill: ${bgColor};
      }
      
      .piano-key.black.active {
        fill: ${bgColor};
      }
      
      .piano-key.white.tonic {
        fill: ${color};
      }
      
      .piano-key.black.tonic {
        fill: ${color};
      }

      .piano-key.highlight {
        fill: ${highlight} !important;
      }
    `;
    return (
        <div className={"Piano " + className}>
            <style>{style}</style>
            <svg
                width={viewWidth}
                viewBox={`0 0 ${viewWidth} ${WHITE_HEIGHT}`}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g>
                    {octs.map((o, i) => (
                        <Octave
                            key={"oct-" + o}
                            oct={o}
                            x={i * 7 * WHITE_WIDTH - (5 * WHITE_WIDTH)}
                            colorize={colorize}
                            pcset={pcset}
                            scorenotes={scorenotes}
                            highlightedNotes={highlightedNotes}
                            onClick={onClick || (() => { })}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};
