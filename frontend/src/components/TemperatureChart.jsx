import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function TemperatureChart({
  rows,
  unit = "°C",
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
          Step 3
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Temperature trend
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Daily maximum and minimum temperatures from the selected stored file.
        </p>
      </div>

      <div className="h-[330px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={rows}>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              minTickGap={20}
            />

            <YAxis
              tick={{ fontSize: 11 }}
              unit={unit}
            />

            <Tooltip
              formatter={(value) =>
                value == null
                  ? "N/A"
                  : `${value}${unit}`
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="maxTemperature"
              name="Max Temperature"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="minTemperature"
              name="Min Temperature"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TemperatureChart;