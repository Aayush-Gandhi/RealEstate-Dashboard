import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const MIN_VAL = 100000;
const MAX_VAL = 2000000;

const LOG_MIN = Math.log10(MIN_VAL);
const LOG_MAX = Math.log10(MAX_VAL);

function formatDollarShort(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}

function formatDollarFull(value) {
  if (value == null || Number.isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function toLog10(value) {
  return Math.log10(value);
}

function fromLog10(value) {
  return 10 ** value;
}

function formatBedroom(value) {
  const num = Number(value);

  if (!Number.isFinite(num) || num <= 0) {
    return "Not available";
  }

  return `${num} Bedroom${num > 1 ? "s" : ""}`;
}

export default function ScatterPlotChart({ rows = [] }) {
  const sampledData = useMemo(() => {
    if (!rows.length) return [];

    const valid = rows
      .map((row) => ({
        estimated: Number(row.estimated_value),
        sale: Number(row.sale_price),
        category: row.valuation_status,
        bedrooms: Number(row.num_bedrooms),
        locality: row.locality,
        date: row.date,
      }))
      .filter(
        (row) =>
          Number.isFinite(row.estimated) &&
          Number.isFinite(row.sale) &&
          row.estimated >= MIN_VAL &&
          row.estimated <= MAX_VAL &&
          row.sale >= MIN_VAL &&
          row.sale <= MAX_VAL &&
          row.category
      )
      .map((row) => ({
        ...row,
        xLog: toLog10(row.estimated),
        yLog: toLog10(row.sale),
      }));

    const sampleSize = Math.min(700, valid.length);
    const shuffled = [...valid].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, sampleSize);
  }, [rows]);

  const overvaluedData = sampledData.filter(
    (d) => d.category === "Overvalued"
  );
  const fairData = sampledData.filter((d) => d.category === "Fair");
  const undervaluedData = sampledData.filter(
    (d) => d.category === "Undervalued"
  );

  const tickValuesRaw = [100000, 211000, 447000, 946000, 2000000];
  const tickValuesLog = tickValuesRaw.map((v) => Math.log10(v));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0].payload;

    return (
      <div
        style={{
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#0f172a" }}>
          {point.category}
        </p>

        <p style={{ margin: 0, color: "#334155" }}>
          Estimated Value: {formatDollarFull(point.estimated)}
        </p>

        <p style={{ margin: "4px 0 0", color: "#334155" }}>
          Sale Price: {formatDollarFull(point.sale)}
        </p>

        <p style={{ margin: "4px 0 0", color: "#334155" }}>
          Bedrooms: {formatBedroom(point.bedrooms)}
        </p>

        <p style={{ margin: "4px 0 0", color: "#334155" }}>
          Locality: {point.locality || "N/A"}
        </p>
      </div>
    );
  };

  return (
    <div className="chart-card">
      <h2 className="chart-title">Sale Price vs Estimated Value</h2>

      <p className="chart-subtitle">
        This chart compares actual sale price with estimated value within the
        $100K to $2M range. Points above the dashed line sold above estimate,
        while points below sold under estimate.
      </p>

      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the chart.</p>
      ) : sampledData.length === 0 ? (
        <p className="error-inline">No valid scatter plot data available.</p>
      ) : (
        <>
          <div className="chart-wrap" style={{ height: "540px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 55, left: 45 }}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  type="number"
                  dataKey="xLog"
                  name="Estimated Value"
                  domain={[LOG_MIN, LOG_MAX]}
                  ticks={tickValuesLog}
                  tickFormatter={(value) => formatDollarShort(fromLog10(value))}
                  label={{
                    value: "Estimated Value ($)",
                    position: "insideBottom",
                    offset: -3,
                    style: {
                      textAnchor: "middle",
                      fill: "#334155",
                      fontWeight: 600,
                      fontSize: 14,
                    },
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="yLog"
                  name="Sale Price"
                  domain={[LOG_MIN, LOG_MAX]}
                  ticks={tickValuesLog}
                  tickFormatter={(value) => formatDollarShort(fromLog10(value))}
                  width={80}
                  label={{
                    value: "Sale Price ($)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: {
                      textAnchor: "middle",
                      fill: "#334155",
                      fontWeight: 600,
                      fontSize: 14,
                    },
                  }}
                />


                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <ReferenceLine
                  segment={[
                    { x: LOG_MIN, y: LOG_MIN },
                    { x: LOG_MAX, y: LOG_MAX },
                  ]}
                  stroke="black"
                  strokeDasharray="6 6"
                  label="Fair Value Line"
                />

                <Scatter
                  name="Overvalued"
                  data={overvaluedData}
                  fill="#ef4444"
                />

                <Scatter name="Fair" data={fairData} fill="#94a3b8" />

                <Scatter
                  name="Undervalued"
                  data={undervaluedData}
                  fill="#10b981"
                />
              </ScatterChart>
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
            <strong>Insight:</strong> A large proportion of properties lie above
            the fair value line, confirming a consistent pattern of
            overvaluation. The spread widens at higher price levels, suggesting
            pricing inefficiencies increase in higher-value properties.
          </div>
        </>
      )}
    </div>
  );
}