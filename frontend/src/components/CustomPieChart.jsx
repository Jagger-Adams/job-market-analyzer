import { Pie, PieChart, Label, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
    'var(--color-chart1)',
    'var(--color-chart2)',
    'var(--color-chart3)',
    'var(--color-chart4)',
    'var(--color-chart5)',
    'var(--color-chart6)',
    'var(--color-chart7)',
    'var(--color-chart8)',
    'var(--color-chart9)',
    'var(--color-chart10)',
    'var(--color-chart11)',
    'var(--color-chart12)',
    'var(--color-chart13)',
    'var(--color-chart14)',
    'var(--color-chart15)',
];

export default function CustomPieChart({ data, dataKey, nameKey, title }) {
    const lines = title ? title.split(' ') : [];
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    strokeWidth={0}
                    label={({ name, percent }) => percent > 0.05 ? name : ''}
                    labelLine={true}
                >
                    <Label content={({ viewBox }) => {
                        const { cx, cy } = viewBox;
                        const fontSize = cx * 0.035;
                        const lineHeight = fontSize * 1.4;
                        return (
                            <text x={cx} textAnchor="middle" fill="var(--color-text)" fontWeight="bold" fontSize={fontSize}>
                                {lines.map((line, i) => (
                                    <tspan key={i} x={cx} y={cy + 10 + (i - 1) * lineHeight}>{line}</tspan>
                                ))}
                            </text>
                        );
                    }} />
                    
                    {data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        color: 'var(--color-text)'
                    }}
                    labelStyle={{ color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}