import { Area, AreaChart, Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import './MultiSeriesChart.css'

const CHART_COLORS = [
  'var(--color-chart1)',  'var(--color-chart2)',  'var(--color-chart3)',
  'var(--color-chart4)',  'var(--color-chart5)',  'var(--color-chart6)',
  'var(--color-chart7)',  'var(--color-chart8)',  'var(--color-chart9)',
  'var(--color-chart10)', 'var(--color-chart11)', 'var(--color-chart12)',
  'var(--color-chart13)', 'var(--color-chart14)', 'var(--color-chart15)',
];

export default function MultiSeriesChart({ data, xLabel, yLabel }) {

    const [mode, setMode] = useState('area');

    const sorted = Object.entries(data).sort((a, b) => {
        const maxA = Math.max(...a[1].map(p => p.postings));
        const maxB = Math.max(...b[1].map(p => p.postings));
        return maxB - maxA;   // descending: biggest first
    });

    const Chart = mode === 'area' ? AreaChart : LineChart;

    return (
        <div className='mscWrap'>
            <div className='mscToggle'>
                <span className={mode === 'area' ? 'mscToggleOption mscToggleActive' : 'mscToggleOption'}
                      onClick={() => setMode('area')}>Area</span>
                <span className={mode === 'line' ? 'mscToggleOption mscToggleActive' : 'mscToggleOption'}
                      onClick={() => setMode('line')}>Line</span>
            </div>

            <div className='mscChartArea'>
                <ResponsiveContainer width="100%" height='100%'>
                    <Chart margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                        <defs>
                            {CHART_COLORS.map((color, i) => (
                                <linearGradient key={i} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.2} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid stroke="none" />
                        <Legend
                            wrapperStyle={{ color: 'var(--color-text)', paddingTop: '10px' }}
                            verticalAlign="top"
                            height={36}
                        />
                        <XAxis 
                            dataKey="year_month"
                            allowDuplicatedCategory={false}
                            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                            axisLine={{ stroke: 'var(--color-border)' }}
                            tickLine={false}
                            interval={1}
                            label={{ value: xLabel, position: 'insideBottom', offset: -20, fill: 'var(--color-muted)', fontSize: '1.25vw'}}
                        />
                        <YAxis
                            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                            axisLine={{ stroke: 'var(--color-border)' }}
                            tickLine={false}
                            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 0, fill: 'var(--color-muted)', fontSize: '1.25vw' }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                color: 'var(--color-text)'
                            }}
                            labelStyle={{ color: 'var(--color-muted)' }}
                            itemStyle={{ color: 'var(--color-accent)' }}
                        />
                        {sorted.map(([name, points], i) => (
                            mode === 'area' ? (
                                <Area
                                    key={name}
                                    data={points}
                                    type="monotone"
                                    dataKey="postings"
                                    name={name}
                                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                                />
                            ) : (
                                <Line
                                    key={name}
                                    data={points}
                                    type="monotone"
                                    dataKey="postings"
                                    name={name}
                                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )
                        ))}
                    </Chart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}