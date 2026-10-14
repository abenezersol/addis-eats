"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatETB } from "../../lib/dashboardData";

export default function RevenueChart({ data }) {
  if (!data.length) {
    return <p className="muted" role="status">No revenue data yet. Revenue will appear when completed or active orders are placed.</p>;
  }

  return (
    <div className="dashboard-chart" role="img" aria-label="Bar chart showing revenue in Ethiopian birr by neighbourhood. The same values are listed in the accessible table below.">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis type="number" domain={[0, "auto"]} tickFormatter={(value) => formatETB(value)} />
          <YAxis type="category" dataKey="area" width={112} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [formatETB(Number(value)), "Revenue"]} />
          <Bar dataKey="revenue" name="Revenue (ETB)" fill="#1B4D8E" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
