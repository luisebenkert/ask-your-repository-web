import React from 'react';
import Plot from 'react-plotly.js';
import './Evaluation.scss';

function Graph(props) {
  const { data, xaxisLabels } = props;
  xaxisLabels.push(['overall']);

  console.log(xaxisLabels);

  const xaxisVals = [];
  for (let i = 0; i < xaxisLabels.length; i += 1) {
    xaxisVals.push(i);
  }

  const colors = [
    '#a9a9a9',
    '#fabebe',
    '#ffd8b1',
    '#f032e6',
    '#800000',
    '#469990',
    '#000075',
    '#8c0000',
    '#e6beff',
  ];

  let yMin = Infinity;
  let yMax = 0;

  function getPlotdata(item) {
    const yaxis = {};
    Object.keys(item).forEach((pipe) => {
      const y = [];
      let sum = 0;
      const values = Object.keys(item[pipe]);
      values.forEach((pair) => {
        const val = item[pipe][pair];
        y.push(val);
        sum += val;
        if (val < yMin) {
          yMin = val;
        }
        if (val > yMax) {
          yMax = val;
        }
      });
      y.push(sum / values.length);
      console.log(y);
      yaxis[pipe] = y;
    });

    const plotdata = [];
    Object.keys(yaxis).forEach((pipe) => {
      if (pipe === '0') {
        plotdata.push(
          {
            x: xaxisVals,
            y: yaxis[pipe],
            type: 'scatter',
            fill: 'tozeroy',
            marker: { color: colors[pipe] },
            name: 'Benchmark',
          },
        );
      } else {
        plotdata.push(
          {
            x: xaxisVals,
            y: yaxis[pipe],
            type: 'scatter',
            marker: { color: colors[pipe] },
            name: `Pipeline ${pipe}`,
          },
        );
      }
    });

    console.log(plotdata);
    return plotdata;
  }

  const amounts = {
    0: 'Label-, User- & Text-',
    1: 'Label- & User-',
    2: 'Label-',
  };

  function getGraphTitle(index) {
    let amount = '';
    if (Object.keys(data).length > 1) {
      amount = `with ${amounts[index]}Tags`;
    }

    return `Testset 1 ${amount} - NDCG`;
  }

  const offset = 0.02;

  return (
    <div className="Graphs">
      <Plot
        data={getPlotdata(data)}
        layout={
          {
            width: 700,
            height: 400,
            title: 'Testset 1 - NDCG',
            xaxis: {
              tickvals: xaxisVals,
              ticktext: xaxisLabels,
            },
            yaxis: {
              range: [yMin - offset, yMax + offset],
            },
          }
        }
      />
    </div>
  );
}

export default Graph;
