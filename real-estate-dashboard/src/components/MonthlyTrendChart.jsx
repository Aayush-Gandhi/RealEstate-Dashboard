import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function formatCurrencyFull(value) {
  if (value == null || Number.isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyShort(value) {
  if (value == null || Number.isNaN(value)) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}

export default function MonthlyTrendChart({ rows = [], data = [] }) {
  const legendFormatter = (value) => {
    if (value === "smooth_estimate") return "Estimated (3-mo Avg)";
    if (value === "smooth_sale") return "Sale (3-mo Avg)";
    return value;
  };

  return (
    <div className="chart-card">
      <h2 className="chart-title">Monthly Pricing Trend</h2>

      <p className="chart-subtitle">
        This chart compares 3-month moving average trends of sale price and
        estimated value over time, aggregated at the monthly level.
      </p>

      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the chart.</p>
      ) : data.length === 0 ? (
        <p className="error-inline">No valid monthly trend data available.</p>
      ) : (
        <div className="chart-wrap monthly-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 24, bottom: 90, left: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />

              <XAxis
                dataKey="year_month"
                tick={{ fontSize: 10, fill: "#475569" }}
                interval={Math.max(1, Math.floor(data.length / 10))}
                minTickGap={24}
                height={70}
                label={{
                  value: "Year-Month",
                  position: "insideBottom",
                  offset: -2,
                  style: {
                    fill: "#334155",
                    fontWeight: 500,
                    textAnchor: "middle",
                  },
                }}
              />

              <YAxis
                width={105}
                tick={{ fill: "#475569" }}
                tickFormatter={formatCurrencyShort}
                label={{
                  value: "Monthly Average Price ($)",
                  angle: -90,
                  position: "insideLeft",
                  offset: -28,
                  style: {
                    textAnchor: "middle",
                    fill: "#334155",
                    fontWeight: 500,
                  },
                }}
              />

              <Tooltip
                formatter={(value) => formatCurrencyFull(Number(value))}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "18px" }}
                formatter={legendFormatter}
              />

              <Line
                type="monotone"
                dataKey="smooth_estimate"
                stroke="#059669"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 5 }}
                name="smooth_estimate"
              />

              <Line
                type="monotone"
                dataKey="smooth_sale"
                stroke="#1d4ed8"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 5 }}
                name="smooth_sale"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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
        <strong>Insight:</strong> Sale prices stay above estimated values across
        the majority of the timeline, with the gap widening during 2014–2016
        and again after 2019. This suggests sustained market pressure and
        possible underestimation in pricing models, alongside cyclical
        fluctuations that may reflect seasonal or macroeconomic effects.
      </div>
    </div>
  );
}