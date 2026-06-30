import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
} from "recharts";

export default function ExpensesChart({ data }) {

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;

        return (
            <div className="rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 shadow-lg">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-[#07D896]">
                    ${payload[0].value.toLocaleString("es-MX")}
                </p>
            </div>
        );
    };

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#07D896" stopOpacity={1} />
                            <stop offset="100%" stopColor="#07D896" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>

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
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                        content={<CustomTooltip />}
                    />
                    <Bar
                        dataKey="total"
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}