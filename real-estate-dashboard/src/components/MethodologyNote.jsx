import React from "react";

export default function MethodologyNote() {
  return (
    <div className="method-card">
      <div className="method-header">
        <p className="method-eyebrow">How to read this dashboard</p>
        <h2>Compare Sale Price vs Estimated Value</h2>
        <p>
          The dashboard classifies each property based on how far the final sale
          price is from the estimated value.
        </p>
      </div>

      <div className="method-grid">
        <div className="method-pill overvalued">
          <span className="method-dot"></span>
          <div>
            <strong>Overvalued</strong>
            <p>Sold more than 10% above estimate</p>
          </div>
        </div>

        <div className="method-pill fair">
          <span className="method-dot"></span>
          <div>
            <strong>Fair</strong>
            <p>Sold within ±10% of estimate</p>
          </div>
        </div>

        <div className="method-pill undervalued">
          <span className="method-dot"></span>
          <div>
            <strong>Undervalued</strong>
            <p>Sold more than 10% below estimate</p>
          </div>
        </div>
      </div>

      <div className="method-footer">
        Data is pre-cleaned before upload. KPIs and charts update dynamically
        when filters are changed.
      </div>
    </div>
  );
}