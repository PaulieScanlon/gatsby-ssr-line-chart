import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

const LineChart = ({ data }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);

  const chartWidth = 1200;
  const chartHeight = 600;
  const offsetY = 40;
  const paddingX = 50;
  const paddingY = 90;
  const maxAdditionsY = Math.max(...data.map((item) => item.additions));
  const maxDeletionsY = Math.max(...data.map((item) => -item.deletions));
  const guides = [...Array(16).keys()];
  const hoverBarWidth = 18;
  const tooltipWidth = 200;
  const tooltipHeight = 110;

  const properties = data.map((property, index) => {
    const { date, additions, deletions } = property;
    const x = (index / data.length) * (chartWidth - paddingX) + paddingX / 2;
    const additionsY = chartHeight / 2 - (additions / maxAdditionsY) * (chartHeight / 2 + (paddingY / 2 - offsetY * 2));
    const deletionsY = chartHeight / 2 - (deletions / maxDeletionsY) * (chartHeight / 2 - (paddingY + offsetY / 2));
    return {
      date: date,
      additions: additions,
      deletions: deletions,
      x: x,
      additionsY: additionsY,
      deletionsY: deletionsY
    };
  });

  const pointsAdditions = properties.map((point) => {
    const { x, additionsY } = point;
    return `${x},${additionsY}`;
  });

  const pointsDeletions = properties.map((point) => {
    const { x, deletionsY } = point;
    return `${x},${deletionsY}`;
  });

  const handleClick = ({ additions, deletions, date, x, additionsY }) => {
    const boundingClientRect = svgRef.current.getBoundingClientRect();
    const safeX = x > boundingClientRect.width / 2 ? x - tooltipWidth : x;
    const safeY = additionsY < boundingClientRect.height / 2 ? additionsY : additionsY - tooltipHeight;

    setTooltip({
      date: date,
      additions: additions,
      deletions: deletions,
      x: safeX,
      y: safeY
    });
  };

  const handleClose = () => {
    setTooltip(null);
  };

  return (
    <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="presentation">
      {guides.map((_, index) => {
        const ratio = index / guides.length;
        const y = chartHeight - paddingY - chartHeight * ratio;

        return (
          <polyline key={index} className="stroke-gray-200/80" fill="none" strokeWidth={1} points={`${paddingX / 2},${y} ${chartWidth - paddingX},${y}`} />
        );
      })}

      <polyline fill="none" className="stroke-green-400" strokeWidth={2} points={pointsAdditions} />
      <polyline fill="none" className="stroke-red-400" strokeWidth={2} points={pointsDeletions} />

      {properties.map((property, index) => {
        const { date, additions, deletions, x, additionsY, deletionsY } = property;

        return (
          <g key={index}>
            <rect
              className="fill-transparent hover:fill-gray-100/50 cursor-pointer"
              x={x - hoverBarWidth / 2}
              y={0}
              width={hoverBarWidth}
              height={chartHeight}
              onClick={() => handleClick({ date, additions, deletions, x, additionsY })}
            />
            <circle className="stroke-green-400 fill-white pointer-events-none" cx={x} cy={additionsY} r={5} strokeWidth={2} />
            <circle className="stroke-red-400 fill-white pointer-events-none" cx={x} cy={deletionsY} r={5} strokeWidth={2} />

            {tooltip ? (
              <g className="transition-all duration-300 ease-in-out" transform={`translate(${tooltip.x}, ${tooltip.y})`}>
                <rect width={tooltipWidth} height={tooltipHeight} className="fill-white stroke-gray-300" rx={3} ry={3} strokeWidth={1.2} />

                <circle
                  className="fill-gray-100 origin-center [transform-box:fill-box] select-none pointer-events-none motion-safe:animate-ping"
                  cx={tooltipWidth}
                  r={10}
                  width={10}
                  height={10}
                />

                <circle
                  className="fill-white stroke-gray-300 cursor-pointer transition-all duration-200 hover:fill-gray-200"
                  cx={tooltipWidth}
                  r={10}
                  strokeWidth={1.2}
                  width={10}
                  height={10}
                  onClick={handleClose}
                />

                <text className="fill-gray-800 text-[14px] select-none pointer-events-none" x={tooltipWidth - 3.2} y={3.4}>
                  x
                </text>

                <text className="uppercase font-bold tracking-widest text-xs fill-gray-500" x={tooltipWidth / 2} y={24} textAnchor="middle">
                  activity
                </text>

                <text className="fill-green-400 font-bold" x={tooltipWidth / 2} y={50} textAnchor="middle">
                  {`+${tooltip.additions}`}
                </text>

                <text className="fill-red-400 font-bold" x={tooltipWidth / 2} y={70} textAnchor="middle">
                  {tooltip.deletions}
                </text>

                <text className="fill-gray-400 text-xs" x={tooltipWidth / 2} y={94} textAnchor="middle">
                  {new Date(tooltip.date).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
      {properties.map((property, index) => {
        const { date, x } = property;

        return (
          <g key={index} transform={`translate(${x} ${chartHeight - (paddingY - offsetY)})`}>
            <text transform="rotate(45)" textAnchor="start" transformorigin="50% 50%" fontSize={10} className="fill-gray-500 select-none">
              {new Date(date).toLocaleDateString(undefined, { year: '2-digit', month: 'numeric', day: 'numeric' })}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

LineChart.propTypes = {
  /** The shape of the data  */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      additions: PropTypes.number.isRequired,
      deletions: PropTypes.number.isRequired
    })
  ).isRequired
};

export default LineChart;
