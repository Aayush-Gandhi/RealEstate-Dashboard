import pandas as pd
import plotly.express as px

df = pd.read_csv("real_estate_final.csv")

if "num_bedrooms" not in df.columns:
    if "bedrooms" in df.columns:
        df["num_bedrooms"] = df["bedrooms"]
    else:
        df["num_bedrooms"] = df["num_rooms"]

cols = [
    "sale_price",
    "estimated_value",
    "pct_diff",
    "price_diff",
    "num_bedrooms",
    "num_bathrooms",
    "carpet_area",
    "property_tax_rate",
]

df_heat = df[cols].copy()

for col in cols:
    df_heat[col] = pd.to_numeric(df_heat[col], errors="coerce")

df_heat = df_heat.dropna()

df_heat = df_heat[
    (df_heat["sale_price"] >= 100000) &
    (df_heat["sale_price"] <= 2000000) &
    (df_heat["estimated_value"] >= 100000) &
    (df_heat["estimated_value"] <= 2000000)
].copy()

df_heat = df_heat.rename(columns={
    "sale_price": "Sale Price",
    "estimated_value": "Estimated Value",
    "pct_diff": "% Difference",
    "price_diff": "Price Difference",
    "num_bedrooms": "Bedrooms",
    "num_bathrooms": "Bathrooms",
    "carpet_area": "Carpet Area",
    "property_tax_rate": "Property Tax Rate",
})

corr = df_heat.corr()

fig = px.imshow(
    corr,
    text_auto=".2f",
    color_continuous_scale="RdBu",
    zmin=-1,
    zmax=1,
    aspect="auto",
)

fig.update_layout(
    width=1050,
    height=850,
    title={
        "text": (
            "Correlation Heatmap of Pricing and Property Features"
            "<br><sup>This heatmap shows how strongly pricing variables and property features move together.</sup>"
        ),
        "x": 0.5,
        "xanchor": "center",
        "font": {"size": 24},
    },
    margin=dict(l=140, r=80, t=110, b=160),
    coloraxis_colorbar={
        "title": {
            "text": "Correlation<br><sup>Blue = positive<br>Red = negative</sup>"
        },
        "tickvals": [-1, -0.5, 0, 0.5, 1],
        "ticktext": [
            "-1 Strong Negative",
            "-0.5 Negative",
            "0 No Relationship",
            "0.5 Positive",
            "1 Strong Positive"
        ]
    },
    font=dict(size=15),
)

fig.update_xaxes(
    side="bottom",
    tickangle=-35,
)

fig.update_yaxes(
    tickangle=0,
)

fig.show()