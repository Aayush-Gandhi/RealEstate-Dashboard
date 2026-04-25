import React from "react";

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "--";

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export default function DatasetStatus({ summary = {} }) {
  const hasData = summary.totalRows > 0;

  return (
    <div className="status-card status-card-wide">
      <h3 className="status-title">Market Summary</h3>

      <div className="status-kpi-row">
        <div className="status-kpi">
          <span className="status-kpi-value">
            {hasData ? summary.totalRows.toLocaleString() : "--"}
          </span>
          <span className="status-kpi-label">Properties Analyzed</span>
        </div>

        <div className="status-kpi">
          <span className="status-kpi-value">
            {hasData ? formatPercent(summary.avgPctDiff) : "--"}
          </span>
          <span className="status-kpi-label">Avg Price Difference</span>
        </div>

        <div className="status-kpi">
          <span className="status-kpi-value">
            {hasData ? `${summary.overvaluedPct.toFixed(1)}%` : "--"}
          </span>
          <span className="status-kpi-label">Overvalued Share</span>
        </div>
      </div>

      <div className="insight-highlight">
        {hasData
          ? "Most properties are selling above their estimated value, suggesting a consistent market premium and possible underestimation in pricing models."
          : "Upload a dataset to view market insights and pricing patterns."}
      </div>

      <div className="status-notes">
        <span>
          {hasData
            ? "Few properties fall within the ±10% fair range"
            : "No dataset loaded yet"}
        </span>
        <span>Charts use a $100K–$2M filtered range</span>
      </div>
    </div>
  );
}