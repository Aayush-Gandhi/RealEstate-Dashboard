import pandas as pd

df = pd.read_csv("real_estate_final.csv")

avg_sale = df["sale_price"].mean()
avg_estimate = df["estimated_value"].mean()
avg_diff = df["price_diff"].mean()

overvalued_pct = (df["valuation_status"] == "Overvalued").mean() * 100

print("Avg Sale Price:", round(avg_sale, 2))
print("Avg Estimated Value:", round(avg_estimate, 2))
print("Avg Price Difference:", round(avg_diff, 2))
print("% Overvalued:", round(overvalued_pct, 2), "%")