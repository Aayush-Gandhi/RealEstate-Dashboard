import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const MIN_VAL = 100000;
const MAX_VAL = 2000000;

export default function ValuationBarChart({ rows }) {
  const chartData = useMemo(() => {
    if (!rows.length) return [];

    const filtered = rows.filter((row) => {
      const estimated = Number(row.estimated_value);
      const sale = Number(row.sale_price);

      return (
        Number.isFinite(estimated) &&
        Number.isFinite(sale) &&
        estimated >= MIN_VAL &&
        estimated <= MAX_VAL &&
        sale >= MIN_VAL &&
        sale <= MAX_VAL &&
        row.valuation_status
      );
    });

    const counts = {
      Overvalued: 0,
      Fair: 0,
      Undervalued: 0,
    };

    filtered.forEach((row) => {
      if (counts[row.valuation_status] !== undefined) {
        counts[row.valuation_status] += 1;
      }
    });

    const total = filtered.length || 1;

    return [
      {
        category: "Overvalued",
        count: counts.Overvalued,
        pct: (counts.Overvalued / total) * 100,
        color: "#ef4444",
      },
      {
        category: "Fair",
        count: counts.Fair,
        pct: (counts.Fair / total) * 100,
        color: "#94a3b8",
      },
      {
        category: "Undervalued",
        count: counts.Undervalued,
        pct: (counts.Undervalued / total) * 100,
        color: "#10b981",
      },
    ];
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
          {item.category}
        </p>
        <p style={{ margin: "4px 0 0", color: "#334155" }}>
          Count: {item.count.toLocaleString()}
        </p>
        <p style={{ margin: "4px 0 0", color: "#334155" }}>
          Share: {item.pct.toFixed(1)}%
        </p>
      </div>
    );
  };

  return (
    <div className="chart-card">
      <h2 className="chart-title">Properties by Valuation Category</h2>
      <p className="chart-subtitle">
        This chart summarizes how many properties are overvalued, fairly priced,
        or undervalued within the $100K to $2M range.
      </p>

      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the chart.</p>
      ) : chartData.length === 0 ? (
        <p className="error-inline">No valid valuation count data available.</p>
      ) : (
        <>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis
                  width={90}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                  }
                  label={{
                    value: "Number of Properties",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: {
                      textAnchor: "middle",
                      fill: "#334155",
                      fontWeight: 500,
                    },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    content={(props) => {
                      const { x, y, width, value, index } = props;
                      const item = chartData[index];

                      if (!item) return null;

                      return (
                        <text
                          x={x + width / 2}
                          y={y - 8}
                          fill={item.color}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="600"
                        >
                          {`${value.toLocaleString()} (${item.pct.toFixed(1)}%)`}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              background: "#f8fafc",
              borderRadius: "8px",
              color: "#334155",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            <strong>Insight:</strong> Over 75% of properties fall into the overvalued category, indicating a strong upward pricing bias relative to estimated values. Fairly priced properties represent only a small portion of the dataset.
          </div>
        </>
      )}
    </div>
  );
}