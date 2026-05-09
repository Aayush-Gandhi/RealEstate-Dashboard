import React, { useMemo } from "react";

const MIN_VAL = 100000;
const MAX_VAL = 2000000;

const variables = [
  { key: "sale_price", label: "Sale Price" },
  { key: "estimated_value", label: "Estimated Value" },
  { key: "pct_diff", label: "% Difference" },
  { key: "price_diff", label: "Price Difference" },
  { key: "num_bedrooms", label: "Bedrooms" },
  { key: "num_bathrooms", label: "Bathrooms" },
  { key: "carpet_area", label: "Carpet Area" },
  { key: "property_tax_rate", label: "Property Tax Rate" },
];

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function correlation(xValues, yValues) {
  if (xValues.length !== yValues.length || xValues.length < 2) return 0;

  const xMean = mean(xValues);
  const yMean = mean(yValues);

  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;

  for (let i = 0; i < xValues.length; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;

    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }

  const denominator = Math.sqrt(xDenominator * yDenominator);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getHeatColor(value) {
  const clamped = Math.max(-1, Math.min(1, value));

  // Negative = red
  if (clamped < 0) {
    const intensity = Math.abs(clamped);
    const r = Math.round(248 - intensity * 91);
    const g = Math.round(250 - intensity * 220);
    const b = Math.round(252 - intensity * 220);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Positive = blue
  const intensity = clamped;
  const r = Math.round(248 - intensity * 233);
  const g = Math.round(250 - intensity * 191);
  const b = Math.round(252 - intensity * 140);
  return `rgb(${r}, ${g}, ${b})`;
}

function getTextColor(value) {
  return Math.abs(value) >= 0.65 ? "#ffffff" : "#0f172a";
}

export default function CorrelationHeatmap({ rows = [] }) {
  const matrix = useMemo(() => {
    if (!rows.length) return [];

    const cleaned = rows
      .map((row) => {
        const sale = toNumber(row.sale_price);
        const estimated = toNumber(row.estimated_value);

        if (
          sale == null ||
          estimated == null ||
          sale < MIN_VAL ||
          sale > MAX_VAL ||
          estimated < MIN_VAL ||
          estimated > MAX_VAL
        ) {
          return null;
        }

        const bedrooms =
          toNumber(row.num_bedrooms) ??
          toNumber(row.bedrooms) ??
          toNumber(row.num_rooms);

        return {
          sale_price: sale,
          estimated_value: estimated,
          pct_diff: toNumber(row.pct_diff),
          price_diff: toNumber(row.price_diff),
          num_bedrooms: bedrooms,
          num_bathrooms: toNumber(row.num_bathrooms),
          carpet_area: toNumber(row.carpet_area),
          property_tax_rate: toNumber(row.property_tax_rate),
        };
      })
      .filter(Boolean);

    return variables.map((rowVar) =>
      variables.map((colVar) => {
        const pairs = cleaned
          .map((row) => [row[rowVar.key], row[colVar.key]])
          .filter(([x, y]) => x != null && y != null);

        const xValues = pairs.map(([x]) => x);
        const yValues = pairs.map(([, y]) => y);

        return correlation(xValues, yValues);
      })
    );
  }, [rows]);

  return (
    <div className="chart-card">
      <h2 className="chart-title">
        Correlation Heatmap of Pricing and Property Features
      </h2>

      <p className="chart-subtitle">
        This heatmap shows how strongly pricing variables and property features
        move together.
      </p>

      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the heatmap.</p>
      ) : matrix.length === 0 ? (
        <p className="error-inline">No valid correlation data available.</p>
      ) : (
        <>
          <div className="heatmap-layout">
            <p className="heatmap-axis-note">
              Columns and rows show the same variables; each cell shows the correlation between the row variable and column variable.
            </p>
            <div className="heatmap-table">
              <div className="heatmap-corner" />

              {variables.map((variable) => (
                <div className="heatmap-x-label" key={variable.key}>
                  {variable.label}
                </div>
              ))}

              {variables.map((rowVariable, rowIndex) => (
                <React.Fragment key={rowVariable.key}>
                  <div className="heatmap-y-label">{rowVariable.label}</div>

                  {variables.map((colVariable, colIndex) => {
                    const value = matrix[rowIndex][colIndex];

                    return (
                      <div
                        className="heatmap-cell"
                        key={`${rowVariable.key}-${colVariable.key}`}
                        style={{
                          backgroundColor: getHeatColor(value),
                          color: getTextColor(value),
                        }}
                        title={`${rowVariable.label} vs ${colVariable.label
                          }: ${value.toFixed(2)}`}
                      >
                        {value.toFixed(2)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div className="heatmap-legend">
              <div className="legend-title">Correlation</div>
              <div className="legend-scale" />
              <div className="legend-labels">
                <span>+1 Strong Positive</span>
                <span>0 No Relationship</span>
                <span>-1 Strong Negative</span>
              </div>
            </div>
          </div>

          <div className="insight-box">
            <strong>Insight:</strong> Sale price and estimated value are
            strongly related, while percentage difference helps reveal pricing
            gaps that are not fully explained by property size alone.
          </div>
        </>
      )}
    </div>
  );
}