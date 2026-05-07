import pandas as pd
import plotly.express as px

# =========================
# 1. Load dataset
# =========================
df = pd.read_csv("real_estate_final.csv")

# =========================
# 2. Clean required columns
# =========================
df = df.dropna(
    subset=["locality", "pct_diff", "sale_price", "estimated_value"]
).copy()

df["sale_price"] = pd.to_numeric(df["sale_price"], errors="coerce")
df["estimated_value"] = pd.to_numeric(df["estimated_value"], errors="coerce")
df["pct_diff"] = pd.to_numeric(df["pct_diff"], errors="coerce")

df = df.dropna(subset=["sale_price", "estimated_value", "pct_diff"])

# Remove unknown / invalid localities
df = df[df["locality"].str.lower() != "unknown"].copy()

# =========================
# 3. Keep same readable market range
# =========================
MIN_VAL = 100000
MAX_VAL = 2000000

df = df[
    (df["sale_price"] >= MIN_VAL) &
    (df["sale_price"] <= MAX_VAL) &
    (df["estimated_value"] >= MIN_VAL) &
    (df["estimated_value"] <= MAX_VAL)
].copy()

# =========================
# 4. Coordinates for dataset localities
# =========================
coords = {
    "Bridgeport": (41.1865, -73.1952),
    "Fairfield": (41.1408, -73.2613),
    "Greenwich": (41.0262, -73.6282),
    "Norwalk": (41.1177, -73.4082),
    "Stamford": (41.0534, -73.5387),
    "Waterbury": (41.5582, -73.0515),
    "West Hartford": (41.7621, -72.7420),
}

# =========================
# 5. Aggregate by locality
# =========================
locality_summary = (
    df.groupby("locality", as_index=False)
      .agg(
          avg_pct_diff=("pct_diff", "mean"),
          avg_sale_price=("sale_price", "mean"),
          avg_estimated_value=("estimated_value", "mean"),
          transaction_count=("locality", "size")
      )
)

# Add lat/lon
locality_summary["lat"] = locality_summary["locality"].map(
    lambda x: coords.get(x, (None, None))[0]
)

locality_summary["lon"] = locality_summary["locality"].map(
    lambda x: coords.get(x, (None, None))[1]
)

# Drop locations without coordinates
locality_summary = locality_summary.dropna(subset=["lat", "lon"])

# Optional: keep localities with enough records
locality_summary = locality_summary[
    locality_summary["transaction_count"] >= 20
].copy()

# =========================
# 6. Create bubble map
# =========================
fig = px.scatter_map(
    locality_summary,
    lat="lat",
    lon="lon",
    size="transaction_count",
    color="avg_pct_diff",
    hover_name="locality",
    hover_data={
        "avg_pct_diff": ":.1f",
        "avg_sale_price": ":,.0f",
        "avg_estimated_value": ":,.0f",
        "transaction_count": True,
        "lat": False,
        "lon": False,
    },
    color_continuous_scale="RdYlGn_r",
    size_max=45,
    zoom=8.2,
    height=700,
    title="Average Overvaluation by Locality"
)

# =========================
# 7. Styling
# =========================
fig.update_traces(
    opacity=0.65,
    marker=dict(
        sizemode="area"
    )
)

fig.update_layout(
    mapbox_style="open-street-map",
    margin={"r": 20, "t": 70, "l": 20, "b": 20},
    title=dict(
        text="Average Overvaluation by Locality<br><sup>Bubble size represents transaction count; color represents average percentage difference from estimated value.</sup>",
        x=0.5,
        xanchor="center",
        font=dict(size=22)
    ),
    coloraxis_colorbar=dict(
        title="Avg % Difference",
        ticksuffix="%"
    )
)

fig.show()