import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function parseDate(row) {
  const possibleDateFields = [
    row.date,
    row.transaction_date,
    row.sold_date,
    row.sale_date,
  ];

  for (const value of possibleDateFields) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function formatMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function movingAverage(data, key, windowSize = 3) {
  return data.map((item, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const slice = data.slice(start, index + 1);
    const avg =
      slice.reduce((sum, row) => sum + Number(row[key] || 0), 0) / slice.length;

    return {
      ...item,
      transaction_count_smooth: avg,
    };
  });
}

export default function TransactionVolumeChart({ rows = [] }) {
  const data = useMemo(() => {
    if (!rows.length) return [];

    const grouped = {};

    rows.forEach((row) => {
      const date = parseDate(row);
      if (!date) return;

      const month = formatMonth(date);

      if (!grouped[month]) {
        grouped[month] = {
          year_month: month,
          transaction_count: 0,
        };
      }

      grouped[month].transaction_count += 1;
    });

    const monthlyData = Object.values(grouped).sort((a, b) =>
      a.year_month.localeCompare(b.year_month)
    );

    return movingAverage(monthlyData, "transaction_count", 3);
  }, [rows]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;

    return (
      <div className="custom-tooltip">
        <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
        <p style={{ margin: "6px 0 0" }}>
          Transactions: {item.transaction_count.toLocaleString()}
        </p>
        <p style={{ margin: "4px 0 0" }}>
          3-Month Avg: {item.transaction_count_smooth.toFixed(1)}
        </p>
      </div>
    );
  };

  return (
    <div className="chart-card">
      <h2 className="chart-title">Transaction Volume Over Time</h2>

      <p className="chart-subtitle">
        Monthly transaction activity shown using a 3-month moving average for
        smoother trend interpretation.
      </p>

      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the area chart.</p>
      ) : data.length === 0 ? (
        <p className="error-inline">No valid transaction volume data available.</p>
      ) : (
        <>
          <div className="chart-wrap transaction-volume-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 25, right: 30, bottom: 65, left: 55 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />

                <XAxis
                  dataKey="year_month"
                  interval={Math.max(1, Math.floor(data.length / 9))}
                  tick={{ fontSize: 11, fill: "#334155" }}
                  label={{
                    value: "Year-Month",
                    position: "insideBottom",
                    offset: -10,
                    style: {
                      textAnchor: "middle",
                      fill: "#334155",
                      fontWeight: 600,
                    },
                  }}
                />

                <YAxis
                  tick={{ fontSize: 12, fill: "#334155" }}
                  label={{
                    value: "Number of Transactions (3-Month Avg)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -35,
                    style: {
                      textAnchor: "middle",
                      fill: "#334155",
                      fontWeight: 600,
                    },
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="transaction_count_smooth"
                  stroke="#2563eb"
                  strokeWidth={4}
                  fill="#2563eb"
                  fillOpacity={0.22}
                  name="Transactions (3-Month Avg)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="insight-box">
            <strong>Insight:</strong> Transaction activity changes over time,
            showing periods of stronger and weaker market movement across the
            dataset.
          </div>
        </>
      )}
    </div>
  );
}