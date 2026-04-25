import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("real_estate_final.csv")

# Use num_rooms as bedroom proxy if num_bedrooms does not exist
if "num_bedrooms" not in df.columns:
    df["num_bedrooms"] = df["num_rooms"]

df = df.dropna(
    subset=["num_bedrooms", "pct_diff", "estimated_value", "sale_price"]
).copy()

df["num_bedrooms"] = pd.to_numeric(df["num_bedrooms"], errors="coerce")

df = df[
    (df["estimated_value"] >= 100000) &
    (df["estimated_value"] <= 2000000) &
    (df["sale_price"] >= 100000) &
    (df["sale_price"] <= 2000000) &
    (df["num_bedrooms"] > 0)
].copy()

bedroom_summary = (
    df.groupby("num_bedrooms", as_index=False)
      .agg(
          avg_pct_diff=("pct_diff", "mean"),
          count=("num_bedrooms", "size")
      )
)

bedroom_summary = bedroom_summary[bedroom_summary["count"] >= 20].copy()
bedroom_summary = bedroom_summary.sort_values("num_bedrooms")

labels = [
    f"{int(x)} Bedroom" if int(x) == 1 else f"{int(x)} Bedrooms"
    for x in bedroom_summary["num_bedrooms"]
]

plt.figure(figsize=(10, 6))
bars = plt.bar(labels, bedroom_summary["avg_pct_diff"], color="#2563eb")

for bar in bars:
    height = bar.get_height()
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        height,
        f"{height:.1f}%",
        ha="center",
        va="bottom",
        fontsize=10
    )

plt.title("Average Price Difference by Number of Bedrooms", fontsize=16, fontweight="bold")
plt.xlabel("Number of Bedrooms")
plt.ylabel("Average % Difference")
plt.xticks(rotation=20, ha="right")
plt.grid(axis="y", linestyle="--", alpha=0.35)
plt.tight_layout()
plt.show()