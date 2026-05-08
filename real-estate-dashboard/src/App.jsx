import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import FileUpload from "./components/FileUpload";
import MethodologyNote from "./components/MethodologyNote";
import KPISection from "./components/KPISection";
import DatasetStatus from "./components/DatasetStatus";
import MonthlyTrendChart from "./components/MonthlyTrendChart";
import ScatterPlotChart from "./components/ScatterPlotChart";
import ValuationBarChart from "./components/ValuationBarChart";
import PropertyTypeBarChart from "./components/PropertyTypeBarChart";
import LocalityMapChart from "./components/LocalityMapChart";
import CorrelationHeatmap from "./components/CorrelationHeatmap";



function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeText(value) {
  if (!value) return "";
  return String(value).trim();
}

function bedroomLabel(value) {
  if (value === "All") return "All Bedrooms";
  const num = Number(value);
  return `${num} Bedroom${num > 1 ? "s" : ""}`;
}

export default function App() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const [selectedBedrooms, setSelectedBedrooms] = useState("All");
  const [selectedValuation, setSelectedValuation] = useState("All");
  const [selectedLocality, setSelectedLocality] = useState("All");

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const cleaned = results.data.map((row) => ({
            ...row,
            sale_price: toNumber(row.sale_price),
            estimated_value: toNumber(row.estimated_value),
            price_diff: toNumber(row.price_diff),
            pct_diff: toNumber(row.pct_diff),
            num_rooms: toNumber(row.num_rooms),
            num_bedrooms: toNumber(row.num_bedrooms || row.bedrooms || row.num_rooms),
            num_bathrooms: toNumber(row.num_bathrooms),
            carpet_area: toNumber(row.carpet_area),
            property: normalizeText(row.property),
            valuation_status: normalizeText(row.valuation_status),
            locality: normalizeText(row.locality),
          }));

          setRows(cleaned);
          setSelectedBedrooms("All");
          setSelectedValuation("All");
          setSelectedLocality("All");
        } catch (err) {
          setError("Could not parse the CSV correctly.");
          console.error(err);
        }
      },
      error: (err) => {
        setError("File upload failed.");
        console.error(err);
      },
    });
  };

  const bedroomOptions = useMemo(() => {
    if (!rows.length) return [];

    return [...new Set(rows.map((row) => Number(row.num_bedrooms)))]
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b);
  }, [rows]);

  const valuationOptions = useMemo(() => {
    if (!rows.length) return [];

    return [...new Set(rows.map((row) => normalizeText(row.valuation_status)))]
      .filter((value) => value)
      .sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const localityOptions = useMemo(() => {
    if (!rows.length) return [];

    return [...new Set(rows.map((row) => normalizeText(row.locality)))]
      .filter((value) => value)
      .sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!rows.length) return [];

    return rows.filter((row) => {
      const bedroomMatch =
        selectedBedrooms === "All" ||
        Number(row.num_bedrooms) === Number(selectedBedrooms);

      const valuationMatch =
        selectedValuation === "All" ||
        normalizeText(row.valuation_status) === selectedValuation;

      const localityMatch =
        selectedLocality === "All" ||
        normalizeText(row.locality) === selectedLocality;

      return bedroomMatch && valuationMatch && localityMatch;
    });
  }, [rows, selectedBedrooms, selectedValuation, selectedLocality]);

  const summary = useMemo(() => {
    if (!filteredRows.length) {
      return {
        totalRows: 0,
        avgSalePrice: 0,
        avgEstimatedValue: 0,
        avgPctDiff: 0,
        overvaluedPct: 0,
        fairPct: 0,
        undervaluedPct: 0,
      };
    }

    const totalRows = filteredRows.length;

    const avgSalePrice =
      filteredRows.reduce((sum, row) => sum + row.sale_price, 0) / totalRows;

    const avgEstimatedValue =
      filteredRows.reduce((sum, row) => sum + row.estimated_value, 0) / totalRows;

    const avgPctDiff =
      filteredRows.reduce((sum, row) => sum + Number(row.pct_diff || 0), 0) /
      totalRows;

    const overvalued = filteredRows.filter(
      (row) => row.valuation_status === "Overvalued"
    ).length;

    const fair = filteredRows.filter(
      (row) => row.valuation_status === "Fair"
    ).length;

    const undervalued = filteredRows.filter(
      (row) => row.valuation_status === "Undervalued"
    ).length;

    return {
      totalRows,
      avgSalePrice,
      avgEstimatedValue,
      avgPctDiff,
      overvaluedPct: (overvalued / totalRows) * 100,
      fairPct: (fair / totalRows) * 100,
      undervaluedPct: (undervalued / totalRows) * 100,
    };
  }, [filteredRows]);

  const monthlyTrendData = useMemo(() => {
    if (!filteredRows.length) return [];

    const grouped = {};

    filteredRows.forEach((row) => {
      const key = row.year_month;
      const sale = Number(row.sale_price);
      const estimate = Number(row.estimated_value);

      if (!key) return;
      if (!Number.isFinite(sale) || !Number.isFinite(estimate)) return;

      if (!grouped[key]) {
        grouped[key] = {
          year_month: key,
          sale_sum: 0,
          estimate_sum: 0,
          count: 0,
        };
      }

      grouped[key].sale_sum += sale;
      grouped[key].estimate_sum += estimate;
      grouped[key].count += 1;
    });

    const baseData = Object.values(grouped)
      .filter((item) => item.count > 0)
      .map((item) => ({
        year_month: item.year_month,
        avg_sale_price: item.sale_sum / item.count,
        avg_estimated_value: item.estimate_sum / item.count,
      }))
      .sort(
        (a, b) =>
          new Date(`${a.year_month}-01`) - new Date(`${b.year_month}-01`)
      );

    return baseData.map((item, index, arr) => {
      const window = arr.slice(Math.max(0, index - 2), index + 1);

      const smoothSale =
        window.reduce((sum, d) => sum + d.avg_sale_price, 0) / window.length;

      const smoothEstimate =
        window.reduce((sum, d) => sum + d.avg_estimated_value, 0) /
        window.length;

      return {
        ...item,
        smooth_sale: smoothSale,
        smooth_estimate: smoothEstimate,
      };
    });
  }, [filteredRows]);

  return (
    <div className="app-shell">
      <div className="page-container">
        <section className="hero-page">
          <div className="hero-section">
            <p className="hero-audience">
              For Buyers • Sellers • Agents • Investors
            </p>

            <h1 className="page-title">Real Estate Pricing Intelligence</h1>

            <p className="hero-tagline">
              See if properties are overpriced, underpriced, or fairly valued —
              before making a decision.
            </p>

            <p className="hero-subtitle">
              Compare actual sale prices with estimated values using real
              transaction data.
            </p>
          </div>

          <FileUpload
            fileName={fileName}
            error={error}
            onFileUpload={handleFileUpload}
          />

          <div className="filter-section">
            <div className="filter-box">
              <label htmlFor="bedroom-filter" className="filter-label">
                Bedrooms
              </label>

              <select
                id="bedroom-filter"
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All">All</option>
                {bedroomOptions.map((bedroom) => (
                  <option key={bedroom} value={bedroom}>
                    {bedroom} Bedroom{bedroom > 1 ? "s" : ""}
                  </option>
                ))}
              </select>

              <label htmlFor="valuation-filter" className="filter-label">
                Valuation
              </label>

              <select
                id="valuation-filter"
                value={selectedValuation}
                onChange={(e) => setSelectedValuation(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All">All</option>
                {valuationOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <label htmlFor="locality-filter" className="filter-label">
                Locality
              </label>

              <select
                id="locality-filter"
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All">All</option>
                {localityOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSelectedBedrooms("All");
                  setSelectedValuation("All");
                  setSelectedLocality("All");
                }}
                className="filter-reset"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="active-filters">
            Showing:
            <span> {bedroomLabel(selectedBedrooms)}</span> |
            <span>
              {selectedValuation === "All"
                ? "All Valuations"
                : selectedValuation}
            </span>{" "}
            |
            <span>
              {selectedLocality === "All" ? "All Locations" : selectedLocality}
            </span>
          </div>
        </section>

        <section className="method-page">
          <MethodologyNote />
        </section>

        <KPISection rows={filteredRows} summary={summary} />

        <DatasetStatus summary={summary} />

        <MonthlyTrendChart rows={filteredRows} data={monthlyTrendData} />

        <ScatterPlotChart rows={filteredRows} />

        <ValuationBarChart rows={filteredRows} />

        <PropertyTypeBarChart rows={filteredRows} />

        <LocalityMapChart rows={filteredRows} />

        <CorrelationHeatmap rows={filteredRows} />

      </div>
    </div>
  );
}