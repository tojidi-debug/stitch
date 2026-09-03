import assert from "node:assert/strict";
import {
  CATALOG,
  cycleBoundary,
  filterRowsByRange,
  normalizeAdminSettings,
  pivotSeries,
  tableMatrixForCategory,
} from "../public/ecos2.js";

assert.equal(cycleBoundary("20260804", "D"), "20260804");
assert.equal(cycleBoundary("20260804", "M"), "202608");
assert.equal(cycleBoundary("20260804", "Q"), "2026Q3");
assert.equal(cycleBoundary("20260804", "A"), "2026");

assert.deepEqual(
  filterRowsByRange([["2025Q4", "1.2"], ["2026Q1", "0.8"], ["2026Q2", "1.0"]], "20260101", "20260630", "Q"),
  [["2026Q1", "0.8"], ["2026Q2", "1.0"]],
);

assert.deepEqual(CATALOG.slice(0, 2).map(({ id }) => id), ["stock", "base"]);
assert.equal(CATALOG.find(({ id }) => id === "base")?.defaultVisible, true);
assert.equal(new Set(CATALOG.map(({ dataRoot }) => dataRoot)).size, 1);
assert.equal(CATALOG[0].dataRoot, "./ecos-data");

const transposedSeries = [
  { id: "first", name: "수출물가", rows: [["202607", "120.1"], ["202608", "121.2"]] },
  { id: "second", name: "수입물가", rows: [["202607", "130.3"], ["202608", "131.4"]] },
];

assert.deepEqual(tableMatrixForCategory("trade", transposedSeries), {
  header: ["항목", "202608", "202607"],
  body: [
    ["수출물가", "121.2", "120.1"],
    ["수입물가", "131.4", "130.3"],
  ],
});

assert.deepEqual(tableMatrixForCategory("stock", transposedSeries), {
  header: ["항목", "202608", "202607"],
  body: [
    ["수출물가", "121.2", "120.1"],
    ["수입물가", "131.4", "130.3"],
  ],
});

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

assert.deepEqual(
  pivotSeries([
    { id: "kospi", label: "KOSPI", rows: [["20260813", "6813.34"], ["20260814", "6977.94"]] },
    { id: "kosdaq", label: "KOSDAQ", rows: [["20260813", "861.37"], ["20260814", "864.65"]] },
  ], { descending: true }),
  {
    dates: ["20260814", "20260813"],
    rows: [
      ["KOSPI", "6977.94", "6813.34"],
      ["KOSDAQ", "864.65", "861.37"],
    ],
  },
);

console.log("ecos2 core tests passed");
