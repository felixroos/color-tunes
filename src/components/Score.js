// ripped from https://github.com/danigb/tonal-app/blob/master/src/components/viz/Score.js
import React, { PureComponent } from "react";
import { Note } from "tonal";
import PropTypes from "prop-types";

const W = 512;
const H = 120;

class Score extends PureComponent {
    svg = false;
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        if (window.Vex === undefined) {
            setTimeout(() => this.updateCanvas(), 500);
            return;
        }
        try {
            const Vex = window.Vex;
            const { Renderer, Formatter } = Vex.Flow;
            let renderer;
            if (this.svg) {
                this.refs.container.innerHTML = '';
                renderer = new Renderer(this.refs.container, Renderer.Backends.SVG);
            } else {
                renderer = new Renderer(this.refs.container, Renderer.Backends.CANVAS);
            }
            const ctx = renderer.getContext();
            renderer.resize(W, H);
            ctx.clearRect(0, 0, W, H);
            var stave = new Vex.Flow.Stave(0, 0, W - 5);
            stave.addClef("treble").setContext(ctx);
            if (this.props.keyTonic) stave.addKeySignature(this.props.keyTonic);

            stave.draw();

            Formatter.FormatAndDraw(
                ctx,
                stave,
                this.props.notes.map(function (n) {
                    const { letter, acc, oct } = Note.props(n);

                    const note = new Vex.Flow.StaveNote({
                        keys: [letter + "/" + oct],
                        duration: "q"
                    });
                    if (acc) note.addAccidental(0, new Vex.Flow.Accidental(acc));
                    return note;
                })
            );
        } catch (e) {
            console.warn("VexFlow problem", e);
        }
    }

    render() {
        if (this.svg) {
            return (<div className="score" ref="container" width={W} height={H}></div>);
        }
        return (
            <div className="score" >
                <canvas ref="container" width={W} height={H}></canvas>
            </div>);
    }
}
Score.propTypes = {
    key: PropTypes.string,
    notes: PropTypes.arrayOf(PropTypes.string)
};

export default Score;
