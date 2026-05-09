import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

const MIN_VAL = 100000;
const MAX_VAL = 2000000;

const localityCoords = {
  Bridgeport: [41.1865, -73.1952],
  Fairfield: [41.1408, -73.2613],
  Greenwich: [41.0262, -73.6282],
  Norwalk: [41.1177, -73.4082],
  Stamford: [41.0534, -73.5387],
  Waterbury: [41.5582, -73.0515],
  "West Hartford": [41.7621, -72.742],
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getBubbleColor(value) {
  if (value >= 50) return "#d9cfc5";
  if (value >= 45) return "#e8bf92";
  if (value >= 40) return "#df9b66";
  if (value >= 35) return "#c9684f";
  if (value >= 30) return "#b63b32";
  return "#991f1f";
}

function LocalityMapChart({ rows = [] }) {
  const mapData = useMemo(() => {
    if (!rows.length) return [];

    const grouped = {};

    rows.forEach((row) => {
      const sale = Number(row.sale_price);
      const estimated = Number(row.estimated_value);
      const pctDiff = Number(row.pct_diff);
      const locality = row.locality;

      if (
        !locality ||
        locality === "Unknown" ||
        !localityCoords[locality] ||
        !Number.isFinite(sale) ||
        !Number.isFinite(estimated) ||
        !Number.isFinite(pctDiff) ||
        sale < MIN_VAL ||
        sale > MAX_VAL ||
        estimated < MIN_VAL ||
        estimated > MAX_VAL
      ) {
        return;
      }

      if (!grouped[locality]) {
        grouped[locality] = {
          locality,
          totalPctDiff: 0,
          totalSale: 0,
          totalEstimated: 0,
          count: 0,
        };
      }

      grouped[locality].totalPctDiff += pctDiff;
      grouped[locality].totalSale += sale;
      grouped[locality].totalEstimated += estimated;
      grouped[locality].count += 1;
    });

    return Object.values(grouped)
      .filter((item) => item.count >= 20)
      .map((item) => ({
        locality: item.locality,
        position: localityCoords[item.locality],
        avgPctDiff: item.totalPctDiff / item.count,
        avgSalePrice: item.totalSale / item.count,
        avgEstimatedValue: item.totalEstimated / item.count,
        transactionCount: item.count,
      }));
  }, [rows]);

  const maxCount = Math.max(...mapData.map((d) => d.transactionCount), 1);

  return (
    <div className="chart-card">
      <h2 className="chart-title">Average Overvaluation by Locality</h2>

      <p className="chart-subtitle">
        Bubble size represents transaction count; color represents average
        overvaluation percentage by locality.
      </p>

      {!rows.length ? (
        <p className="muted-text">Upload the dataset to see the map.</p>
      ) : mapData.length === 0 ? (
        <p className="error-inline">No valid locality map data available.</p>
      ) : (
        <>
          <div className="leaflet-map-shell">
            <div className="leaflet-map-wrap">
              <MapContainer
                center={[41.18, -73.28]}
                zoom={9}
                scrollWheelZoom={false}
                attributionControl={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapData.map((item) => {
                  const radius =
                    8 + (item.transactionCount / maxCount) * 18;

                  return (
                    <CircleMarker
                      key={item.locality}
                      center={item.position}
                      radius={radius}
                      pathOptions={{
                        fillColor: getBubbleColor(item.avgPctDiff),
                        color: getBubbleColor(item.avgPctDiff),
                        weight: 2,
                        fillOpacity: 0.45,
                        opacity: 0.7,
                      }}
                    >
                      <Tooltip>
                        <div>
                          <strong>{item.locality}</strong>
                          <br />
                          Avg Overvaluation: {item.avgPctDiff.toFixed(1)}%
                          <br />
                          Avg Sale Price: {formatCurrency(item.avgSalePrice)}
                          <br />
                          Avg Estimated Value:{" "}
                          {formatCurrency(item.avgEstimatedValue)}
                          <br />
                          Transactions:{" "}
                          {item.transactionCount.toLocaleString()}
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>

            <div className="map-legend">
              <div className="map-legend-title">
                Average
                <br />
                Overvaluation
              </div>

              <div className="map-legend-scale" />

              <div className="map-legend-labels">
                <span>55%</span>
                <span>50%</span>
                <span>45%</span>
                <span>40%</span>
                <span>35%</span>
                <span>30%</span>
                <span>25%</span>
              </div>
            </div>
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

export default React.memo(LocalityMapChart);