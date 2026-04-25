import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import FuncFormatter

df = pd.read_csv("real_estate_final.csv")

df = df.rename(columns={
    "estimated_value": "estimated",
    "sale_price": "sale"
})

# Use bedroom column if it exists; otherwise use num_rooms as a proxy
if "num_bedrooms" not in df.columns:
    if "bedrooms" in df.columns:
        df["num_bedrooms"] = df["bedrooms"]
    else:
        df["num_bedrooms"] = df["num_rooms"]

df["num_bedrooms"] = pd.to_numeric(df["num_bedrooms"], errors="coerce")

df = df[
    (df["estimated"] > 0) &
    (df["sale"] > 0) &
    (df["num_bedrooms"] > 0)
].copy()

MIN_VAL = 100000
MAX_VAL = 2000000

df = df[
    (df["estimated"] >= MIN_VAL) &
    (df["estimated"] <= MAX_VAL) &
    (df["sale"] >= MIN_VAL) &
    (df["sale"] <= MAX_VAL)
].copy()

df = df.sample(min(1000, len(df)), random_state=42)

def categorize(row):
    if row["sale"] > row["estimated"] * 1.1:
        return "Overvalued"
    elif row["sale"] < row["estimated"] * 0.9:
        return "Undervalued"
    else:
        return "Fair"

df["category"] = df.apply(categorize, axis=1)

colors = {
    "Overvalued": "#ef4444",
    "Fair": "#94a3b8",
    "Undervalued": "#10b981"
}

def format_dollar(x, pos):
    if x >= 1_000_000:
        return f"${x / 1_000_000:.1f}M"
    elif x >= 1_000:
        return f"${x / 1_000:.0f}K"
    return f"${x:.0f}"

plt.figure(figsize=(12, 8))

for category, color in colors.items():
    subset = df[df["category"] == category]
    plt.scatter(
        subset["estimated"],
        subset["sale"],
        label=category,
        color=color,
        alpha=0.55,
        s=30
    )

plt.plot(
    [MIN_VAL, MAX_VAL],
    [MIN_VAL, MAX_VAL],
    linestyle="--",
    color="black",
    linewidth=2.5,
    label="Fair Value Line"
)

plt.xscale("log")
plt.yscale("log")

plt.xlim(MIN_VAL, MAX_VAL)
plt.ylim(MIN_VAL, MAX_VAL)

ticks = np.logspace(np.log10(MIN_VAL), np.log10(MAX_VAL), num=5)

ax = plt.gca()
ax.set_xticks(ticks)
ax.set_yticks(ticks)

ax.xaxis.set_major_formatter(FuncFormatter(format_dollar))
ax.yaxis.set_major_formatter(FuncFormatter(format_dollar))

plt.title("Sale Price vs Estimated Value (Log Scale)", fontsize=18, fontweight="bold")
plt.xlabel("Estimated Value")
plt.ylabel("Sale Price")

plt.grid(True, linestyle="--", alpha=0.35)
plt.legend()

plt.tight_layout()
plt.show()