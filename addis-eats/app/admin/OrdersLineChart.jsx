"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function OrdersLineChart({ data }) {
  if (!data.length) {
    return <p className="muted" role="status">No daily order data is available for this month yet.</p>;
  }

  return (
    <div className="dashboard-chart" role="img" aria-label="Line chart showing the number of orders per day this month. The same values are listed in the accessible table below.">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" interval="preserveStartEnd" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} domain={[0, "auto"]} width={42} />
          <Tooltip formatter={(value) => [Number(value), "Orders"]} />
          <Line type="monotone" dataKey="orders" name="Orders" stroke="#B9534D" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
