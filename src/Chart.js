import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { curveMonotoneX } from "d3-shape";
import { ChartCanvas, Chart } from "react-stockcharts";
import {
  BarSeries,
  CandlestickSeries,
  LineSeries,
  AreaSeries
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { EdgeIndicator } from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { HoverTooltip } from "react-stockcharts/lib/tooltip";
import { ema } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";
import {
  createVerticalLinearGradient,
  hexToRGBA
} from "react-stockcharts/lib/utils";

const canvasGradient = createVerticalLinearGradient([
  { stop: 0, color: hexToRGBA("#b5d0ff", 0.2) },
  { stop: 0.7, color: hexToRGBA("#6fa4fc", 0.4) },
  { stop: 1, color: hexToRGBA("#4286f4", 0.8) }
]);
const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");

function tooltipContent(ys) {
  return ({ currentItem, xAccessor }) => {
    return {
      x: dateFormat(xAccessor(currentItem)),
      y: [
        {
          label: "open",
          value: currentItem.open && numberFormat(currentItem.open)
        },
        {
          label: "high",
          value: currentItem.high && numberFormat(currentItem.high)
        },
        {
          label: "low",
          value: currentItem.low && numberFormat(currentItem.low)
        },
        {
          label: "close",
          value: currentItem.close && numberFormat(currentItem.close)
        },
        {
          label: "upper",
          value: currentItem.upper && numberFormat(currentItem.upper)
        },
        {
          label: "lower",
          value: currentItem.lower && numberFormat(currentItem.lower)
        },
        {
          label: "pred",
          value: currentItem.pred && numberFormat(currentItem.pred)
        }
      ]
        .concat(
          ys.map((each) => ({
            label: each.label,
            value: each.value(currentItem),
            stroke: each.stroke
          }))
        )
        .filter((line) => line.value)
    };
  };
}

const keyValues = ["high", "low"];

class CandleStickChartWithHoverTooltip extends React.Component {
  removeRandomValues(data) {
    return data.map((item) => {
      const newItem = { ...item };
      const numberOfDeletion = Math.floor(Math.random() * keyValues.length) + 1;
      for (let i = 0; i < numberOfDeletion; i += 1) {
        const randomKey =
          keyValues[Math.floor(Math.random() * keyValues.length)];
        newItem[randomKey] = undefined;
      }
      return newItem;
    });
  }

  render() {
    let { type, data: initialData, width, ratio } = this.props;

    // remove some of the data to be able to see
    // the tooltip resize
    initialData = this.removeRandomValues(initialData);

    const ema20 = ema()
      .id(0)
      .options({ windowSize: 20 })
      .merge((d, c) => {
        d.ema20 = c;
      })
      .accessor((d) => d.ema20);

    const ema50 = ema()
      .id(2)
      .options({ windowSize: 50 })
      .merge((d, c) => {
        d.ema50 = c;
      })
      .accessor((d) => d.ema50);

    const margin = { left: 80, right: 80, top: 30, bottom: 50 };

    const calculatedData = ema50(ema20(initialData));
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => d.date
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      calculatedData
    );

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];

    return (
      <ChartCanvas
        height={400}
        width={width}
        ratio={ratio}
        margin={margin}
        type={type}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >
        <Chart
          id={1}
          yExtents={[(d) => [d.high - d.high / 10, d.low + d.low / 10]]}
        >
          <defs>
            <linearGradient id="MyGradient" x1="0" y1="100%" x2="0" y2="0%">
              <stop offset="0%" stopColor="#b5d0ff" stopOpacity={0.2} />
              <stop offset="70%" stopColor="#6fa4fc" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#4286f4" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <XAxis axisAt="bottom" orient="bottom" />

          <YAxis axisAt="right" orient="right" ticks={5} />

          <AreaSeries
            yAccessor={(d) => d.close}
            fill="url(#MyGradient)"
            strokeWidth={2}
            interpolation={curveMonotoneX}
            canvasGradient={canvasGradient}
          />
          <AreaSeries yAccessor={(d) => d.upper} />
          <AreaSeries yAccessor={(d) => d.lower} fill="white" />
          <LineSeries yAccessor={(d) => d.pred} stroke="#2ca02c" />

          <EdgeIndicator
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={(d) => d.close}
            fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
          />

          <HoverTooltip
            yAccessor={ema50.accessor()}
            tooltipContent={tooltipContent([])}
            fontSize={15}
          />
        </Chart>
      </ChartCanvas>
    );
  }
}

CandleStickChartWithHoverTooltip.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWithHoverTooltip.defaultProps = {
  type: "svg"
};
CandleStickChartWithHoverTooltip = fitWidth(CandleStickChartWithHoverTooltip);

export default CandleStickChartWithHoverTooltip;
