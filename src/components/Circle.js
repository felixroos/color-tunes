import React from 'react';
import { pitchColor } from '../components/Colorizer';

export function getPoint({
  index = 0,
  size = 350,
  offset = 0,
  clinch = 0.8,
  outset = 0,
  length = 12
}) {
  const center = size / 2;
  const strokeWidth = size * 0.1;
  const radius = size / 2 - strokeWidth / 2;
  const radians = (2 * Math.PI) / length;
  return [
    Math.round(
      center +
        radius * Math.cos((offset + index - 3) * radians) * clinch -
        outset
    ),
    Math.round(
      center +
        radius * Math.sin((offset + index - 3) * radians) * clinch +
        outset
    )
  ];
}

export function getPoints({ set, size, offset, clinch, close, fill, length }) {
  let points;

  points = set.reduce((points, index) => {
    return points.concat(getPoint({ index, size, offset, clinch, length }));
  }, []);

  // connect end to start
  /* if (close) {
    points.push(points[0]);
    points.push(points[1]);
  } */
  /* if (fill) {
    const fill = (24 - points.length) / 2;
    for (let p = 0; p < fill; ++p) {
      points = points.concat([points[0], points[1]]);
    }
  } */
  return points;
}
export function getPath(points, interconnected, prependEach) {
  return points.reduce((path, point, index) => {
    if (index === 0) {
      path += 'M';
    } else if (index % 2 === 0) {
      if (prependEach) {
        path += prependEach + ' ';
      }
      path += 'L';
    }
    path += point + ' ';

    if (interconnected && index > 0 && index % 2 !== 0) {
      path += getPath(points, false, `M${points[index - 1]} ${point}`);
    }
    return path;
  }, '');
}

export function Circle(props) {
  let { size, offset, clinch, nodes, origin, onClick, set } = {
    ...{
      size: 100,
      set: [],
      clinch: 0.8,
      highlightedNotes: [],
      onClick: () => {}
    },
    ...props
  };
  const fontsize = size / 12;
  const fontclinch = 0.9;
  const color = pitchColor(origin, 40, 60);
  const bgColor = pitchColor(origin, 50, 80);

  const labelNodes = nodes.map((label, i) => {
    const pos = getPoint({
      index: i,
      size,
      offset,
      clinch: fontclinch,
      outset: fontsize / 3,
      length: nodes.length
    });
    const idleColor = 'gray';
    const style = {
      textDecoration: 'none',
      fill: idleColor
    };
    return (
      <text
        x={pos[0]}
        y={pos[1]}
        onClick={e => onClick(e, label)}
        /* className={active ? 'active' : ''} */
        fontFamily="Verdana"
        fontSize={fontsize}
        key={i}
        style={style}
      >
        {label}
      </text>
    );
  });

  let points = getPoints({
    set,
    size,
    offset,
    clinch,
    close: false,
    fill: true,
    length: nodes.length
  });

  let bgPoints = getPoints({
    set,
    size,
    offset,
    clinch,
    close: false,
    fill: true,
    length: nodes.length
  });
  let positions = getPoints({
    set: new Array(nodes.length).fill(1).map((p, i) => i),
    size,
    offset,
    clinch,
    length: nodes.length
  });

  const interconnectedPath = getPath(points, true);
  const orderedPath = getPath(points);
  const bgPath = getPath(bgPoints);

  const dot = getPoint({
    index: nodes.indexOf(origin),
    size,
    offset,
    clinch,
    length: nodes.length
  });
  const dotPosition = {
    x: dot[0],
    y: dot[1]
  };

  return (
    <div>
      <svg
        className="Circle"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <polygon className="background" strokeWidth="0" points={positions.join(' ')} />
        {/* <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2)}
          fill="white"
        /> */}
        <path d={bgPath} stroke={color} strokeWidth="0" fill={bgColor} />
        <path
          className="interconnections"
          d={interconnectedPath}
          stroke={color}
          strokeWidth="3"
          fill="none"
        />
        <path
          className="ordered"
          d={orderedPath}
          stroke={color}
          strokeWidth="3"
          fill="none"
        />
        <circle
          className="origin"
          cx={dotPosition.x}
          cy={dotPosition.y}
          r={5}
          fill={color}
        />
        {labelNodes}
      </svg>
    </div>
  );
}
