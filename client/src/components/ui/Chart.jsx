import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// Thin wrapper over recharts with JNTUA colors. type: bar | line | pie.
const COLORS = ['#003087', '#c8102e', '#c9a227', '#2f6f4f', '#5b7fb4', '#a50d26'];
export default function Chart({ type = 'bar', data = [], xKey = 'name', series = [{ key: 'value' }], height = 280 }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey={series[0].key} nameKey={xKey} cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend />
            {series.map((s, i) => <Line key={s.key} type="monotone" dataKey={s.key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />)}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend />
            {series.map((s, i) => <Bar key={s.key} dataKey={s.key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
