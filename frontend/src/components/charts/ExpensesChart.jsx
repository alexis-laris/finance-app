import {
    ResponsiveContainer,
    LineChart,
    Line,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

export default function ExpensesChart({ data }) {




    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid
                        vertical={false}
                        stroke="rgba(255,255,255,.05)"
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "#0f1115",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            color: "#fff",
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}