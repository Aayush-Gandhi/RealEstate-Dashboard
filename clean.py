import pandas as pd
import numpy as np

# =========================
# 1. Load raw dataset
# =========================
input_file = "V3.csv"   # change this if needed
df = pd.read_csv(input_file)

# =========================
# 2. Clean column names
# =========================
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

# =========================
# 3. Remove duplicate rows
# =========================
df = df.drop_duplicates().copy()

# =========================
# 4. Clean text columns
# =========================
text_cols = ["locality", "property", "residential", "face"]
for col in text_cols:
    if col in df.columns:
        df[col] = df[col].astype("string").str.strip()
        df[col] = df[col].replace({"": pd.NA, "nan": pd.NA, "None": pd.NA})

# =========================
# 5. Convert numeric columns
# =========================
numeric_cols = [
    "estimated_value",
    "sale_price",
    "num_rooms",
    "num_bathrooms",
    "carpet_area",
    "property_tax_rate",
    "year"
]

for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

# =========================
# 6. Convert date column
# =========================
if "date" in df.columns:
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["year_from_date"] = df["date"].dt.year
    df["month_num"] = df["date"].dt.month
    df["month_name"] = df["date"].dt.month_name()
    df["year_month"] = df["date"].dt.to_period("M").astype("string")

# =========================
# 7. Handle missing values
# =========================

# Fill missing locality so charts still work
if "locality" in df.columns:
    df["locality"] = df["locality"].fillna("Unknown")

# Fill missing carpet_area with median
if "carpet_area" in df.columns:
    df["carpet_area"] = df["carpet_area"].fillna(df["carpet_area"].median())

# Drop rows missing critical dashboard fields
required_cols = ["sale_price", "estimated_value", "property", "date"]
existing_required_cols = [col for col in required_cols if col in df.columns]
df = df.dropna(subset=existing_required_cols).copy()

# =========================
# 8. Create derived columns
# =========================
df["price_diff"] = df["sale_price"] - df["estimated_value"]

df["pct_diff"] = np.where(
    df["estimated_value"] != 0,
    ((df["sale_price"] - df["estimated_value"]) / df["estimated_value"]) * 100,
    np.nan
)

df["valuation_status"] = pd.cut(
    df["pct_diff"],
    bins=[-np.inf, -5, 5, np.inf],
    labels=["Undervalued", "Fair", "Overvalued"]
).astype("string")

# Remove rows where pct_diff or valuation_status could not be created
df = df.dropna(subset=["pct_diff", "valuation_status"]).copy()

# =========================
# 9. Add outlier flags
# =========================
for col in ["sale_price", "estimated_value", "price_diff", "pct_diff"]:
    if col in df.columns:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        df[f"{col}_outlier_flag"] = (df[col] < lower) | (df[col] > upper)

# =========================
# 10. Final validation checks
# =========================
print("Duplicates remaining:", df.duplicated().sum())
print("\nMissing values after final cleaning:")
print(df.isna().sum())

# =========================
# 11. Save ONE final dataset
# =========================
output_file = "real_estate_final.csv"
df.to_csv(output_file, index=False)

print("\nCleaning complete.")
print(f"Final dataset saved as: {output_file}")
print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")

# Optional preview
print("\nPreview of cleaned dataset:")
print(df.head())