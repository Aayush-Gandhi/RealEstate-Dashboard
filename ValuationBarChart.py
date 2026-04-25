import pandas as pd
import matplotlib.pyplot as plt

# Load dataset
df = pd.read_csv("real_estate_final.csv")

# Keep needed rows
df = df.dropna(subset=["valuation_status"]).copy()

# Optional: keep same market range used in scatter chart
df = df[
    (df["estimated_value"] >= 100000) & (df["estimated_value"] <= 2000000) &
    (df["sale_price"] >= 100000) & (df["sale_price"] <= 2000000)
].copy()

# Count categories
counts = df["valuation_status"].value_counts().reindex(
    ["Overvalued", "Fair", "Undervalued"],
    fill_value=0
)

# Colors
colors = ["#ef4444", "#94a3b8", "#10b981"]

# Plot
plt.figure(figsize=(8, 6))
bars = plt.bar(counts.index, counts.values, color=colors)

# Add values on top
for bar in bars:
    height = bar.get_height()
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        height,
        f"{int(height):,}",
        ha="center",
        va="bottom",
        fontsize=11
    )

plt.title("Count of Properties by Valuation Category", fontsize=16, fontweight="bold")
plt.xlabel("Valuation Category")
plt.ylabel("Number of Properties")
plt.grid(axis="y", linestyle="--", alpha=0.35)
plt.tight_layout()
plt.show()