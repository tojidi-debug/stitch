import assert from "node:assert/strict";
import {
  cycleBoundary,
  filterRowsByRange,
  normalizeAdminSettings,
  pivotSeries,
} from "../public/ecos2-core.js";

assert.equal(cycleBoundary("20260804", "D"), "20260804");
assert.equal(cycleBoundary("20260804", "M"), "202608");
assert.equal(cycleBoundary("20260804", "Q"), "2026Q3");
assert.equal(cycleBoundary("20260804", "A"), "2026");

assert.deepEqual(
  filterRowsByRange([["2025Q4", "1.2"], ["2026Q1", "0.8"], ["2026Q2", "1.0"]], "20260101", "20260630", "Q"),
  [["2026Q1", "0.8"], ["2026Q2", "1.0"]],
);

const catalog = [
  { id: "stock", title: "주가지수", defaultVisible: true },
  { id: "growth", title: "경제성장률", defaultVisible: true },
  { id: "fx", title: "환율", defaultVisible: false },
];

assert.deepEqual(
  normalizeAdminSettings(catalog, {
    order: ["fx", "missing", "stock"],
    hidden: ["growth", "missing"],
    titles: { stock: "증시", missing: "무시" },
  }),
  {
    order: ["fx", "stock", "growth"],
    hidden: ["growth"],
    titles: { stock: "증시" },
  },
);

assert.deepEqual(
  pivotSeries([
    { id: "kospi", label: "KOSPI", rows: [["20260102", "2500"], ["20260103", "2520"]] },
    { id: "kosdaq", label: "KOSDAQ", rows: [["20260103", "850"]] },
  ]),
  {
    dates: ["20260102", "20260103"],
    rows: [
      ["KOSPI", "2500", "2520"],
      ["KOSDAQ", "", "850"],
    ],
  },
);

console.log("ecos2 core tests passed");
