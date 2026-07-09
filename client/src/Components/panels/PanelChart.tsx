import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface PanelChartProps {
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut';
  series: any[];
  options?: any;
  height?: number;
}

const PanelChart: React.FC<PanelChartProps> = ({ type, series, options = {}, height = 300 }) => {
  const defaultOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'var(--font-body)',
      foreColor: '#6e6e73',
    },
    grid: {
      borderColor: '#eaeaea',
      strokeDashArray: 3,
    },
    xaxis: {
      labels: {
        style: { colors: '#6e6e73', fontSize: '11px', fontFamily: 'var(--font-body)' },
      },
      axisBorder: { color: '#eaeaea' },
      axisTicks: { color: '#eaeaea' },
    },
    yaxis: {
      labels: {
        style: { colors: '#6e6e73', fontSize: '11px', fontFamily: 'var(--font-body)' },
      },
    },
    colors: ['#1a3a5c', '#b8860b', '#6b6b6b', '#d1cec9'],
    stroke: { width: 2 },
    fill: { opacity: 0.8 },
    tooltip: {
      theme: 'light',
      style: { fontSize: '12px', fontFamily: 'var(--font-body)' },
    },
    ...options,
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <ReactApexChart type={type} series={series} options={defaultOptions} height={height} />
    </div>
  );
};

export default PanelChart;
