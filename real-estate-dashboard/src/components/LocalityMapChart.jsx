import React, { useEffect, useMemo, useRef } from "react";
import Plotly from "plotly.js-dist-min";

const MIN_VAL = 100000;
const MAX_VAL = 2000000;

const localityCoords = {
  Bridgeport: { lat: 41.1865, lon: -73.1952 },
  Fairfield: { lat: 41.1408, lon: -73.2613 },
  Greenwich: { lat: 41.0262, lon: -73.6282 },
  Norwalk: { lat: 41.1177, lon: -73.4082 },
  Stamford: { lat: 41.0534, lon: -73.5387 },
  Waterbury: { lat: 41.5582, lon: -73.0515 },
  "West Hartford": { lat: 41.7621, lon: -72.742 },
};

export default function LocalityMapChart({ rows = [] }) {
  const plotRef = useRef(null);

  const mapData = useMemo(() => {
    if (!rows.length) return [];

    const filtered = rows.filter((row) => {
      const sale = Number(row.sale_price);
      const estimated = Number(row.estimated_value);
      const pctDiff = Number(row.pct_diff);
      const locality = row.locality;

      return (
        locality &&
        locality !== "Unknown" &&
        localityCoords[locality] &&
        Number.isFinite(sale) &&
        Number.isFinite(estimated) &&
        Number.isFinite(pctDiff) &&
        sale >= MIN_VAL &&
        sale <= MAX_VAL &&
        estimated >= MIN_VAL &&
        estimated <= MAX_VAL
      );
    });

    const grouped = {};

    filtered.forEach((row) => {
      const locality = row.locality;

      if (!grouped[locality]) {
        grouped[locality] = {
          locality,
          totalPctDiff: 0,
          totalSale: 0,
          totalEstimated: 0,
          count: 0,
        };
      }

      grouped[locality].totalPctDiff += Number(row.pct_diff);
      grouped[locality].totalSale += Number(row.sale_price);
      grouped[locality].totalEstimated += Number(row.estimated_value);
      grouped[locality].count += 1;
    });

    return Object.values(grouped)
      .filter((item) => item.count >= 20)
      .map((item) => {
        const coords = localityCoords[item.locality];

        return {
          locality: item.locality,
          lat: coords.lat,
          lon: coords.lon,
          avgPctDiff: item.totalPctDiff / item.count,
          avgSalePrice: item.totalSale / item.count,
          avgEstimatedValue: item.totalEstimated / item.count,
          transactionCount: item.count,
        };
      });
  }, [rows]);

  useEffect(() => {
    if (!plotRef.current || !mapData.length) return;

    const maxCount = Math.max(...mapData.map((d) => d.transactionCount), 1);

    const markerSizes = mapData.map(
      (d) => 22 + (d.transactionCount / maxCount) * 48
    );

    const data = [
      {
        type: "scattermapbox",
        lat: mapData.map((d) => d.lat),
        lon: mapData.map((d) => d.lon),
        mode: "markers+text",
        text: mapData.map((d) => d.locality.toUpperCase()),
        textposition: "middle center",
        textfont: {
          size: 13,
          color: "#334155",
          family: "Arial, sans-serif",
        },
        marker: {
          size: markerSizes,
          color: mapData.map((d) => d.avgPctDiff),
          colorscale: "RdYlGn",
          reversescale: true,
          opacity: 0.62,

          // fixed range so legend is clearer
          cmin: 25,
          cmax: 50,

          colorbar: {
            title: {
              text: "Average<br>Overvaluation<br>(%)",
              side: "right",
            },
            tickvals: [25, 30, 35, 40, 45, 50],
            ticktext: ["25%", "30%", "35%", "40%", "45%", "50%"],
            thickness: 22,
            len: 0.82,
          },
        },
        customdata: mapData.map((d) => [
          d.avgPctDiff,
          d.avgSalePrice,
          d.avgEstimatedValue,
          d.transactionCount,
        ]),
        hovertemplate:
          "<b>%{text}</b><br>" +
          "Avg % Difference: %{customdata[0]:.1f}%<br>" +
          "Avg Sale Price: $%{customdata[1]:,.0f}<br>" +
          "Avg Estimated Value: $%{customdata[2]:,.0f}<br>" +
          "Transactions: %{customdata[3]:,}<extra></extra>",
      },
    ];

    const layout = {
      title: {
        text:
          "Average Overvaluation by Locality<br>" +
          "<sup>Bubble size represents transaction count; color represents average overvaluation percentage by locality.</sup>",
        x: 0.5,
        xanchor: "center",
        font: {
          size: 24,
          color: "#1e3a5f",
        },
      },
      width: 1200,
      height: 680,
      margin: { l: 20, r: 95, t: 85, b: 20 },
      paper_bgcolor: "white",
      plot_bgcolor: "white",
      mapbox: {
        style: "carto-positron",
        center: { lat: 41.25, lon: -73.25 },
        zoom: 8.25,
      },
    };

    const config = {
      responsive: false,
      displayModeBar: true,
    };

    Plotly.react(plotRef.current, data, layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [mapData]);

  return (
    <div className="chart-card">
      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the map.</p>
      ) : mapData.length === 0 ? (
        <p className="error-inline">No valid locality map data available.</p>
      ) : (
        <>
          <div className="plotly-map-wrap">
            <div ref={plotRef} className="plotly-map-inner" />
          </div>

          <div className="insight-box">
            <strong>Insight:</strong> Locality-level analysis shows that pricing
            inefficiencies vary geographically, with some areas selling further
            above estimated value than others.
          </div>
        </>
      )}
    </div>
  );
}