import React, { useMemo } from "react";
import { LabelList } from "recharts";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const MIN_VAL = 100000;
const MAX_VAL = 2000000;

function formatBedroomLabel(value) {
  const num = Number(value);
  return `${num} Bedroom${num > 1 ? "s" : ""}`;
}

export default function PropertyTypeBarChart({ rows }) {
  const chartData = useMemo(() => {
    if (!rows.length) return [];

    const filtered = rows
      .map((row) => {
        const estimated = Number(row.estimated_value);
        const sale = Number(row.sale_price);
        const pctDiff = Number(row.pct_diff);
        const bedrooms = Number(row.num_bedrooms);

        return {
          estimated,
          sale,
          pctDiff,
          bedrooms,
        };
      })
      .filter(
        (row) =>
          Number.isFinite(row.bedrooms) &&
          row.bedrooms > 0 &&
          Number.isFinite(row.estimated) &&
          Number.isFinite(row.sale) &&
          Number.isFinite(row.pctDiff) &&
          row.estimated >= MIN_VAL &&
          row.estimated <= MAX_VAL &&
          row.sale >= MIN_VAL &&
          row.sale <= MAX_VAL
      );

    const grouped = {};

    filtered.forEach((row) => {
      const key = row.bedrooms;

      if (!grouped[key]) {
        grouped[key] = {
          bedrooms: key,
          totalPctDiff: 0,
          count: 0,
        };
      }

      grouped[key].totalPctDiff += row.pctDiff;
      grouped[key].count += 1;
    });

    return Object.values(grouped)
      .filter((item) => item.count >= 20)
      .map((item) => ({
        bedrooms: item.bedrooms,
        label: formatBedroomLabel(item.bedrooms),
        avgPctDiff: item.totalPctDiff / item.count,
      }))
      .sort((a, b) => a.bedrooms - b.bedrooms);
  }, [rows]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;

    return (
      <div
        style={{
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
          {item.label}
        </p>
        <p style={{ margin: "4px 0 0", color: "#334155" }}>
          Avg % Difference: {item.avgPctDiff.toFixed(1)}%
        </p>
      </div>
    );
  };

  return (
    <div className="chart-card">
      <h2 className="chart-title">
        Average Overvaluation by Number of Bedrooms
      </h2>

      <p className="chart-subtitle">
        This chart compares the average percentage difference across bedroom
        counts within the $100K to $2M range.
      </p>

      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the chart.</p>
      ) : chartData.length === 0 ? (
        <p className="error-inline">
          No valid bedroom-based comparison data available.
        </p>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="label"
                angle={-15}
                textAnchor="end"
                interval={0}
                height={60}
              />

              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                label={{
                  value: "Average Overvaluation (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#334155",
                    fontWeight: 500,
                  },
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="avgPctDiff" radius={[8, 8, 0, 0]}>
                <LabelList
                  dataKey="avgPctDiff"
                  position="top"
                  formatter={(v) => `${v.toFixed(1)}%`}
                />

                {chartData.map((entry) => (
                  <Cell key={entry.bedrooms} fill="#1d4ed8" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}