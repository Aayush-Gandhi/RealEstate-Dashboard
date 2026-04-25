import React from "react";

function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return "--";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "--";

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export default function KPISection({ rows = [], summary = {} }) {
  const hasData = Array.isArray(rows) && rows.length > 0;

  const cards = [
    {
      label: "Average Sale Price",
      value: hasData ? formatCurrency(summary.avgSalePrice) : "--",
    },
    {
      label: "Average Estimated Value",
      value: hasData ? formatCurrency(summary.avgEstimatedValue) : "--",
    },
    {
      label: "Avg % Difference from Estimate",
      value: hasData ? formatPercent(summary.avgPctDiff) : "--",
    },
    {
      label: "% Overvalued",
      value: hasData ? `${summary.overvaluedPct.toFixed(1)}%` : "--",
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <div className="kpi-card" key={card.label}>
          <p className="kpi-label">{card.label}</p>
          <h2 className="kpi-value">{card.value}</h2>
        </div>
      ))}
    </div>
  );
}