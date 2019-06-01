import React from 'react';
import * as Detect from 'tonal-detect';

export function detectNotes(notes) {
  const chord = Detect.chord(notes);
  const scale = Detect.scale(notes);
  return chord || scale;
}

export function Steps({ steps, notes }) {
  if (!steps || !notes) {
    return;
  }
  const names = detectNotes(steps);
  console.log('names', names);

  return (
    <>
      <strong>{names[0]}</strong>
      <ul>
        {steps.map((note, i) => (
          <li key={i}>-</li>
        ))}
      </ul>

      <ul>
        {steps.map((note, i) => (
          <li key={i}>b</li>
        ))}
      </ul>
      <ul>
        {steps.map((note, i) => (
          <li key={i} className={notes.includes(note) ? 'sub' : ''}>
            {note}
          </li>
        ))}
      </ul>
      <ul>
        {steps.map((note, i) => (
          <li key={i}>#</li>
        ))}
      </ul>
      <ul>
        {steps.map((note, i) => (
          <li key={i}>+</li>
        ))}
      </ul>
    </>
  );
}
