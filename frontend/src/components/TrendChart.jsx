import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function TrendChart({ data, xLabel, yLabel }) {
    return (
        <ResponsiveContainer width="100%" height='100%'>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="--color-primary" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid stroke="none" />
                <XAxis 
                    dataKey="year_month"
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
                <Area type="monotone" dataKey="postings" fill="url(#colorUv)" stroke="var(--color-primary)"/>
            </AreaChart>
        </ResponsiveContainer>
    );
}