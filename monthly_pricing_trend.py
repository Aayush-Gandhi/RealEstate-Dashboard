import pandas as pd
import matplotlib.pyplot as plt

# =========================
# 1. Load dataset
# =========================
df = pd.read_csv("real_estate_final.csv")

# =========================
# 2. Make sure year_month is usable
# =========================
df["year_month_date"] = pd.to_datetime(df["year_month"] + "-01", errors="coerce")

# Drop bad rows just in case
df = df.dropna(subset=["year_month_date", "sale_price", "estimated_value"]).copy()

# =========================
# 3. Group by month
# =========================
monthly = (
    df.groupby(["year_month", "year_month_date"], as_index=False)
      .agg(
          avg_sale_price=("sale_price", "mean"),
          avg_estimated_value=("estimated_value", "mean")
      )
      .sort_values("year_month_date")
)

# =========================
# 4. Create smoothed trend lines
#    3-month moving average
# =========================
monthly["smooth_sale"] = monthly["avg_sale_price"].rolling(window=3, min_periods=1).mean()
monthly["smooth_estimate"] = monthly["avg_estimated_value"].rolling(window=3, min_periods=1).mean()

# =========================
# 5. Plot chart
# =========================
plt.figure(figsize=(16, 7))

# Raw lines
plt.plot(
    monthly["year_month_date"],
    monthly["avg_estimated_value"],
    label="Estimated (Raw)",
    linewidth=2,
    alpha=0.35
)

plt.plot(
    monthly["year_month_date"],
    monthly["avg_sale_price"],
    label="Sale (Raw)",
    linewidth=2,
    alpha=0.35
)

# Trend lines
plt.plot(
    monthly["year_month_date"],
    monthly["smooth_estimate"],
    label="Estimated Trend",
    linewidth=4
)

plt.plot(
    monthly["year_month_date"],
    monthly["smooth_sale"],
    label="Sale Trend",
    linewidth=4
)

plt.title("Monthly Pricing Trend", fontsize=18, weight="bold")
plt.xlabel("Month")
plt.ylabel("Price")
plt.grid(True, linestyle="--", alpha=0.5)
plt.legend()
plt.tight_layout()

plt.show()