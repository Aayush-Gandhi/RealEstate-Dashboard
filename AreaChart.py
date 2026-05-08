import pandas as pd
import plotly.express as px

# =========================
# 1. Load dataset
# =========================
df = pd.read_csv("real_estate_final.csv")

# =========================
# 2. Find date column
# =========================
possible_date_cols = ["date", "transaction_date", "sold_date", "sale_date"]
date_col = next((col for col in possible_date_cols if col in df.columns), None)

if date_col is None:
    raise ValueError("No date column found. Check your dataset column names.")

# =========================
# 3. Clean date
# =========================
df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
df = df.dropna(subset=[date_col]).copy()

# =========================
# 4. Create monthly transaction count
# =========================
df["year_month"] = df[date_col].dt.to_period("M").dt.to_timestamp()

monthly_volume = (
    df.groupby("year_month", as_index=False)
      .size()
      .rename(columns={"size": "transaction_count"})
      .sort_values("year_month")
)

# =========================
# 5. Add 3-month moving average
# =========================
monthly_volume["transaction_count_smooth"] = (
    monthly_volume["transaction_count"]
    .rolling(window=3, min_periods=1)
    .mean()
)

# =========================
# 6. Plot smoother area chart
# =========================
fig = px.area(
    monthly_volume,
    x="year_month",
    y="transaction_count_smooth",
    labels={
        "year_month": "Year-Month",
        "transaction_count_smooth": "Transactions (3-Month Avg)"
    }
)

fig.update_traces(
    line=dict(width=4, color="#2563eb"),
    fillcolor="rgba(37, 99, 235, 0.28)",
    hovertemplate="<b>%{x|%b %Y}</b><br>Transactions (3-mo avg): %{y:.1f}<extra></extra>"
)

fig.update_layout(
    width=1150,
    height=620,
    title={
        "text": (
            "Transaction Volume Over Time"
            "<br><sup>Monthly transaction activity shown using a 3-month moving average for smoother trend interpretation.</sup>"
        ),
        "x": 0.5,
        "xanchor": "center",
        "font": {"size": 28}
    },
    margin=dict(l=90, r=50, t=110, b=80),
    xaxis_title="Year-Month",
    yaxis_title="Number of Transactions (3-Month Avg)",
    hovermode="x unified",
    plot_bgcolor="white",
    paper_bgcolor="white"
)

fig.update_xaxes(
    showgrid=True,
    gridcolor="rgba(148, 163, 184, 0.25)"
)

fig.update_yaxes(
    showgrid=True,
    gridcolor="rgba(148, 163, 184, 0.25)",
    rangemode="tozero"
)

fig.show()