const CATEGORIES = [
  {
    id: "fx",
    title: "환율",
    exportName: "환율",
    preferredItemName: "USD",
    chartLabel: "환율(USD)",
    icon: "💱",
    sub: "731Y001 · 매매기준율 (일별)",
    statCode: "731Y001",
    cycle: "D",
    items: [
      { code: "0000001", name: "USD", checked: true },
      { code: "0000003", name: "EUR", checked: true },
      { code: "0000002", name: "JPY(100)", checked: true },
      { code: "0000053", name: "CNY", checked: true },
      { code: "0000012", name: "GBP", checked: false },
      { code: "0000013", name: "CAD", checked: false },
      { code: "0000014", name: "CHF", checked: false },
      { code: "0000015", name: "HKD", checked: false },
      { code: "0000017", name: "AUD", checked: false },
      { code: "0000024", name: "SGD", checked: false },
      { code: "0000026", name: "NZD", checked: false },
      { code: "0000028", name: "THB", checked: false },
      { code: "0000029", name: "IDR(100)", checked: false },
      { code: "0000025", name: "MYR", checked: false },
      { code: "0000031", name: "TWD", checked: false },
      { code: "0000034", name: "PHP", checked: false },
      { code: "0000035", name: "VND(100)", checked: false },
      { code: "0000037", name: "INR", checked: false },
      { code: "0000016", name: "SEK", checked: false },
      { code: "0000019", name: "NOK", checked: false },
      { code: "0000018", name: "DKK", checked: false },
      { code: "0000040", name: "MXN", checked: false },
      { code: "0000041", name: "BRL", checked: false },
      { code: "0000043", name: "RUB", checked: false },
      { code: "0000050", name: "TRY", checked: false },
      { code: "0000051", name: "ZAR", checked: false },
      { code: "0000020", name: "SAR", checked: false },
      { code: "0000023", name: "AED", checked: false },
    ],
  },
  {
    id: "rate",
    title: "국고채·회사채·단기금리",
    exportName: "금리",
    preferredItemName: "국고채(3년)",
    chartLabel: "금리(국고채(3년))",
    icon: "📈",
    sub: "817Y002 · 시장금리 (일별)",
    statCode: "817Y002",
    cycle: "D",
    items: [
      { code: "010101000", name: "콜금리(1일)", checked: false },
      { code: "010190000", name: "국고채(1년)", checked: false },
      { code: "010195000", name: "국고채(2년)", checked: false },
      { code: "010200000", name: "국고채(3년)", checked: true },
      { code: "010200001", name: "국고채(5년)", checked: true },
      { code: "010210000", name: "국고채(10년)", checked: true },
      { code: "010220000", name: "국고채(20년)", checked: false },
      { code: "010230000", name: "국고채(30년)", checked: false },
      { code: "010300000", name: "회사채(3년,AA-)", checked: true },
      { code: "010320000", name: "회사채(3년,BBB-)", checked: false },
      { code: "010502000", name: "CD(91일)", checked: false },
      { code: "010503000", name: "CP(91일)", checked: false },
      { code: "010150000", name: "KORIBOR(3개월)", checked: false },
    ],
  },
  {
    id: "base",
    title: "한국은행 기준금리",
    exportName: "기준금리",
    preferredItemName: "기준금리",
    chartLabel: "기준금리",
    icon: "🏦",
    sub: "722Y001 · 기준금리 및 여수신금리 (일별)",
    statCode: "722Y001",
    cycle: "D",
    items: [{ code: "0101000", name: "기준금리", checked: true }],
  },
  {
    id: "loan",
    title: "예금은행 대출금리",
    exportName: "예대금리",
    preferredItemName: "대출평균",
    chartLabel: "예대금리",
    icon: "💳",
    sub: "121Y006 · 신규취급액 기준 (월별)",
    statCode: "121Y006",
    cycle: "M",
    items: [{ code: "BECBLA01", name: "대출평균", checked: true }],
  },
  {
    id: "cpi",
    title: "소비자물가지수",
    exportName: "소비자물가",
    preferredItemName: "총지수",
    chartLabel: "소비자물가",
    icon: "📊",
    sub: "901Y009 · 총지수, 2020=100 (월별)",
    statCode: "901Y009",
    cycle: "M",
    items: [{ code: "0", name: "총지수", checked: true }],
  },
  {
    id: "ppi",
    title: "생산자물가지수",
    exportName: "생산자물가",
    preferredItemName: "총지수",
    chartLabel: "생산자물가",
    icon: "🏭",
    sub: "404Y014 · 총지수, 2020=100 (월별)",
    statCode: "404Y014",
    cycle: "M",
    items: [{ code: "*AA", name: "총지수", checked: true }],
  },
];

const CHART_COLORS = ["#1a6de0", "#e0631a", "#1a9e6a", "#a31ae0", "#e01a54", "#1ac2e0", "#c9a227"];

const grid = document.getElementById("cardGrid");
const toastEl = document.getElementById("toast");


function pad2(n) { return String(n).padStart(2, "0"); }

function fmtDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function previousBusinessDay(from) {
  const d = new Date(from);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

// ---- 기본일자: 단일 조회일 = 오늘의 이전 영업일 / 기간 조회는 기본값 없음 ----
const prevBiz = previousBusinessDay(new Date());
document.getElementById("dateSingle").value = fmtDate(prevBiz);

// ---- 날짜 입력 자동 마스킹 (20260804 입력 시 2026-08-04 로 자동 변환) ----
function attachDateMask(el) {
  el.addEventListener("input", () => {
    const digits = el.value.replace(/\D/g, "").slice(0, 8);
    let out = digits;
    if (digits.length > 4) out = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 6) out = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    el.value = out;
  });
}
["dateSingle", "dateStart", "dateEnd"].forEach((id) => attachDateMask(document.getElementById(id)));

document.getElementById("btnClearDates").addEventListener("click", () => {
  ["dateSingle", "dateStart", "dateEnd"].forEach((id) => {
    document.getElementById(id).value = "";
  });
});

document.querySelectorAll('input[name="dateMode"]').forEach((r) => {
  r.addEventListener("change", (e) => {
    const isRange = e.target.value === "range";
    document.getElementById("singleDateField").style.display = isRange ? "none" : "flex";
    document.getElementById("rangeDateField").style.display = isRange ? "flex" : "none";
  });
});

function formatDateForCycle(dateStr, cycle) {
  const [y, m, d] = dateStr.split("-");
  if (cycle === "D") return `${y}${m}${d}`;
  if (cycle === "M") return `${y}${m}`;
  if (cycle === "Q") return `${y}Q${Math.ceil(parseInt(m, 10) / 3)}`;
  return y;
}

function getQueryRange(cycle) {
  const mode = document.querySelector('input[name="dateMode"]:checked').value;
  if (mode === "single") {
    const d = document.getElementById("dateSingle").value;
    return { start: formatDateForCycle(d, cycle), end: formatDateForCycle(d, cycle), rawStart: d, rawEnd: d, isRange: false };
  }
  const s = document.getElementById("dateStart").value;
  const e = document.getElementById("dateEnd").value;
  return { start: formatDateForCycle(s, cycle), end: formatDateForCycle(e, cycle), rawStart: s, rawEnd: e, isRange: true };
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function getDisplayItems(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function tableHeaderHtml(items) {
  return `<th class="date-column">일자</th>${items.map((item) => `<th>${item.name}</th>`).join("")}`;
}

function renderPivotTable(thead, tbody, items, rows) {
  const valuesByDate = new Map();
  rows.forEach((row) => {
    if (!valuesByDate.has(row.time)) valuesByDate.set(row.time, new Map());
    valuesByDate.get(row.time).set(row.item_name, row.value);
  });

  const dates = [...valuesByDate.keys()].sort();
  if (items.length === 1) {
    const item = items[0];
    thead.innerHTML = `<th class="item-column">항목</th>${dates.map((time) => `<th>${time}</th>`).join("")}`;
    tbody.innerHTML = `<tr><td>${item.name}</td>${dates
      .map((time) => {
        const values = valuesByDate.get(time);
        return `<td>${values.has(item.name) ? numFmt(values.get(item.name)) : "-"}</td>`;
      })
      .join("")}</tr>`;
    requestAnimationFrame(() => {
      const tableWrap = tbody.closest(".table-wrap");
      if (tableWrap) tableWrap.scrollLeft = tableWrap.scrollWidth;
    });
    return;
  }

  thead.innerHTML = tableHeaderHtml(items);
  tbody.innerHTML = dates
    .map((time) => {
      const values = valuesByDate.get(time);
      const cells = items.map((item) => `<td>${values.has(item.name) ? numFmt(values.get(item.name)) : "-"}</td>`).join("");
      return `<tr><td>${time}</td>${cells}</tr>`;
    })
    .join("");
}

function buildCard(cat) {
  const card = document.createElement("div");
  card.className = "card";
  card.id = `card-${cat.id}`;
  const initialItems = getDisplayItems(cat.items.filter((item) => item.checked || cat.items.length === 1));

  const itemsHtml = cat.items
    .map(
      (it) => `
      <label>
        <input type="checkbox" data-code="${it.code}" data-name="${it.name}" ${it.checked ? "checked" : ""} />
        ${it.name}
      </label>`
    )
    .join("");

  const itemListHtml = cat.items.length > 1
    ? `<div class="item-list">
        <label class="select-all"><input type="checkbox" data-action="select-all" /> 전체</label>
        ${itemsHtml}
      </div>`
    : "";

  card.innerHTML = `
    <div class="card-head">
      <div>
        <div class="card-title">${cat.icon} ${cat.title}</div>
        <div class="card-sub">${cat.sub}</div>
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost btn-sm" data-action="copy">COPY</button>
        <button class="btn btn-ghost btn-sm" data-action="excel">엑셀 다운로드</button>
        <button class="btn btn-primary btn-sm" data-action="query">조회</button>
      </div>
    </div>
    ${itemListHtml}
    <div class="result-summary" id="summary-${cat.id}"></div>
    <div class="chart-box" id="chart-${cat.id}"></div>
    <div class="table-wrap">
      <table>
        <thead><tr id="thead-${cat.id}">${tableHeaderHtml(initialItems)}</tr></thead>
        <tbody id="tbody-${cat.id}"><tr><td colspan="${initialItems.length + 1}" class="empty-msg">조회 버튼을 눌러 데이터를 가져오세요.</td></tr></tbody>
      </table>
    </div>
  `;

  const selectAllBox = card.querySelector('[data-action="select-all"]');
  if (selectAllBox) {
    const itemBoxes = () => card.querySelectorAll(".item-list input[data-code]");
    selectAllBox.addEventListener("change", () => {
      itemBoxes().forEach((b) => (b.checked = selectAllBox.checked));
    });
  }

  card.querySelector('[data-action="query"]').addEventListener("click", () => queryCategory(cat));
  card.querySelector('[data-action="copy"]').addEventListener("click", () => copyCategory(cat));
  card.querySelector('[data-action="excel"]').addEventListener("click", () => exportCategoryExcel(cat));

  return card;
}

CATEGORIES.forEach((cat) => grid.appendChild(buildCard(cat)));

function getCheckedItems(cat) {
  if (cat.items.length === 1) return cat.items.map((it) => ({ code: it.code, name: it.name }));
  const card = document.getElementById(`card-${cat.id}`);
  const boxes = card.querySelectorAll(".item-list input[data-code]:checked");
  return Array.from(boxes).map((b) => ({ code: b.dataset.code, name: b.dataset.name }));
}

function dataFileName(cat, item) {
  const safeCode = item.code.replace(/[^A-Za-z0-9_-]/g, (char) => `_${char.charCodeAt(0)}`);
  return `${cat.id}-${safeCode}.json`;
}

async function fetchItem(cat, item, range) {
  const url = `./ecos-data/${dataFileName(cat, item)}`;
  const res = await fetch(url, { cache: "no-cache" });
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.includes("application/json")) {
    throw new Error(`공개 데이터 파일 응답 오류 (${res.status})`);
  }

  const data = await res.json();
  const rows = (data.rows || [])
    .filter(([time]) => time >= range.start && time <= range.end)
    .map(([time, value]) => ({ time, value }));
  return { rows };
}

function numFmt(v) {
  const n = parseFloat(v);
  if (Number.isNaN(n)) return v;
  return n.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildChartSVG(seriesMap, range) {
  const width = 400;
  const height = 84;
  const padTop = 10;
  const padBottom = 20;
  const padSide = 6;

  const allValues = [];
  Object.values(seriesMap).forEach((arr) => arr.forEach((p) => allValues.push(p.value)));
  if (allValues.length === 0) return "";

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const span = max - min || Math.abs(max) * 0.02 || 1;

  const xScale = (i, n) => padSide + (n <= 1 ? 0 : (i / (n - 1)) * (width - padSide * 2));
  const yScale = (v) => padTop + (height - padTop - padBottom) - ((v - min) / span) * (height - padTop - padBottom);

  let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none">`;
  let colorIdx = 0;
  const legend = [];

  Object.entries(seriesMap).forEach(([name, points]) => {
    if (points.length === 0) return;
    const color = CHART_COLORS[colorIdx % CHART_COLORS.length];
    colorIdx++;
    const n = points.length;
    const pathPts = points.map((p, i) => `${xScale(i, n).toFixed(1)},${yScale(p.value).toFixed(1)}`).join(" ");
    svg += `<polyline points="${pathPts}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />`;
    svg += `<circle cx="${xScale(0, n).toFixed(1)}" cy="${yScale(points[0].value).toFixed(1)}" r="2" fill="${color}" />`;
    svg += `<circle cx="${xScale(n - 1, n).toFixed(1)}" cy="${yScale(points[n - 1].value).toFixed(1)}" r="2" fill="${color}" />`;
    legend.push({ name, color, first: points[0].value, last: points[n - 1].value });
  });

  svg += `<text x="${padSide}" y="${height - 4}" font-size="7" fill="#8a94a1">${range.rawStart}</text>`;
  svg += `<text x="${width - padSide}" y="${height - 4}" font-size="7" fill="#8a94a1" text-anchor="end">${range.rawEnd}</text>`;
  svg += `</svg>`;

  const legendHtml = legend
    .map(
      (l) =>
        `<span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${l.color};margin-right:3px;"></span>${l.name} ${l.first.toFixed(2)} → ${l.last.toFixed(2)}</span>`
    )
    .join("");

  return `${svg}<div class="chart-legend">${legendHtml}</div>`;
}

async function queryCategory(cat) {
  const items = getDisplayItems(getCheckedItems(cat));
  const tbody = document.getElementById(`tbody-${cat.id}`);
  const thead = document.getElementById(`thead-${cat.id}`);
  const columnCount = Math.max(items.length + 1, 1);
  thead.innerHTML = tableHeaderHtml(items);
  const summary = document.getElementById(`summary-${cat.id}`);
  const chartBox = document.getElementById(`chart-${cat.id}`);
  summary.style.display = "none";
  summary.innerHTML = "";
  chartBox.style.display = "none";
  chartBox.innerHTML = "";

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${columnCount}" class="empty-msg">조회할 항목을 1개 이상 선택하세요.</td></tr>`;
    return;
  }

  const mode = document.querySelector('input[name="dateMode"]:checked').value;
  if (mode === "single" && !document.getElementById("dateSingle").value) {
    tbody.innerHTML = `<tr><td colspan="${columnCount}" class="empty-msg">조회일을 입력하세요.</td></tr>`;
    return;
  }
  if (mode === "range" && (!document.getElementById("dateStart").value || !document.getElementById("dateEnd").value)) {
    tbody.innerHTML = `<tr><td colspan="${columnCount}" class="empty-msg">시작일과 종료일을 입력하세요.</td></tr>`;
    return;
  }

  tbody.innerHTML = `<tr><td colspan="${columnCount}" class="empty-msg"><span class="spinner"></span>조회중...</td></tr>`;
  const range = getQueryRange(cat.cycle);
  cat._lastRows = [];
  cat._lastItems = items;
  cat._lastRange = range;

  let allRows = [];
  const errors = [];
  for (const item of items) {
    try {
      const data = await fetchItem(cat, item, range);
      if (data.error) {
        errors.push(`${item.name}: ${data.error}`);
        continue;
      }
      allRows.push(...data.rows.map((r) => ({ ...r, item_name: item.name })));
    } catch (e) {
      errors.push(`${item.name}: 요청 실패 (${e.message})`);
    }
  }

  allRows.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : a.item_name.localeCompare(b.item_name)));

  cat._lastRows = allRows;
  cat._lastRange = range;

  if (allRows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${columnCount}" class="error-msg">${errors.length ? errors.join("<br/>") : "해당 기간에 데이터가 없습니다."}</td></tr>`;
    return;
  }

  renderPivotTable(thead, tbody, items, allRows);

  const byItem = {};
  allRows.forEach((r) => {
    const v = parseFloat(r.value);
    if (Number.isNaN(v)) return;
    if (!byItem[r.item_name]) byItem[r.item_name] = { sum: 0, cnt: 0, series: [] };
    byItem[r.item_name].sum += v;
    byItem[r.item_name].cnt += 1;
    byItem[r.item_name].series.push({ time: r.time, value: v });
  });

  const avgParts = Object.entries(byItem).map(
    ([name, s]) => `<span class="avg-item">${name} 평균: ${(s.sum / s.cnt).toFixed(2)}</span>`
  );

  if (avgParts.length) {
    summary.style.display = "flex";
    summary.innerHTML = avgParts.join("") + (errors.length ? `<span style="color:#c0392b;">일부 오류: ${errors.join(" / ")}</span>` : "");
  }

  const distinctDates = new Set(allRows.map((r) => r.time)).size;
  if (range.isRange && distinctDates > 1) {
    const seriesMap = {};
    Object.entries(byItem).forEach(([name, s]) => { seriesMap[name] = s.series; });
    chartBox.innerHTML = buildChartSVG(seriesMap, range);
    chartBox.style.display = "block";
  }
}

function getExportItems(cat) {
  return cat._lastItems || getDisplayItems(getCheckedItems(cat));
}

function buildRowsForExport(cat) {
  const rows = cat._lastRows || [];
  const items = getExportItems(cat);
  const valuesByDate = new Map();
  rows.forEach((row) => {
    if (!valuesByDate.has(row.time)) valuesByDate.set(row.time, new Map());
    valuesByDate.get(row.time).set(row.item_name, row.value);
  });
  const dates = [...valuesByDate.keys()].sort();
  if (items.length === 1) {
    const item = items[0];
    return { header: ["항목", ...dates], body: [[item.name, ...dates.map((date) => valuesByDate.get(date).get(item.name) ?? "-")]] };
  }
  return {
    header: ["일자", ...items.map((item) => item.name)],
    body: dates.map((date) => [date, ...items.map((item) => valuesByDate.get(date).get(item.name) ?? "-")]),
  };
}

function copyCategory(cat) {
  if (!cat._lastRows || cat._lastRows.length === 0) {
    showToast("먼저 조회를 실행하세요.");
    return;
  }
  const { header, body } = buildRowsForExport(cat);
  const lines = [header.join("\t"), ...body.map((row) => row.map((value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? numFmt(parsed) : value;
  }).join("\t"))];
  navigator.clipboard.writeText(lines.join("\n")).then(
    () => showToast(`${cat.title} 결과가 클립보드에 복사되었습니다. 엑셀에 붙여넣으세요.`),
    () => showToast("복사에 실패했습니다.")
  );
}

function workbookSheetForCategory(cat) {
  const items = getExportItems(cat);
  const preferredItemName = items.some((item) => item.name === cat.preferredItemName)
    ? cat.preferredItemName
    : items[0]?.name;
  const chartLabel = preferredItemName === cat.preferredItemName
    ? cat.chartLabel
    : `${cat.exportName}(${preferredItemName})`;
  return {
    sheetName: cat.exportName || cat.title,
    items,
    rows: cat._lastRows || [],
    preferredItemName,
    chartLabel,
  };
}

function exportCategoryExcel(cat) {
  if (!cat._lastRows || cat._lastRows.length === 0) {
    showToast("먼저 조회를 실행하세요.");
    return;
  }
  if (!window.EcosXlsx) {
    showToast("엑셀 생성 모듈을 불러오지 못했습니다.");
    return;
  }
  const sheetName = cat.exportName || cat.title;
  const range = cat._lastRange || getQueryRange(cat.cycle);
  const filename = `${sheetName}_${range.start}_${range.end}.xlsx`;
  window.EcosXlsx.downloadWorkbook({ sheets: [workbookSheetForCategory(cat)], filename });
  showToast(`${filename} 다운로드되었습니다.`);
}

async function exportAllExcel() {
  const button = document.getElementById("btnExportAll");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "조회 및 생성중...";
  try {
    for (const cat of CATEGORIES) await queryCategory(cat);
    const missing = CATEGORIES.filter((cat) => !cat._lastRows || cat._lastRows.length === 0);
    if (missing.length) {
      showToast(`${missing.map((cat) => cat.exportName).join(", ")} 데이터가 없어 통합 파일을 만들 수 없습니다.`);
      return;
    }
    const range = getQueryRange("D");
    const filename = `ECOS통계_${range.start}_${range.end}.xlsx`;
    window.EcosXlsx.downloadWorkbook({
      sheets: CATEGORIES.map(workbookSheetForCategory),
      filename,
    });
    showToast(`${filename} 다운로드되었습니다.`);
  } catch (error) {
    showToast(`전체 엑셀 생성 실패: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

document.getElementById("btnQueryAll").addEventListener("click", async () => {
  for (const cat of CATEGORIES) {
    await queryCategory(cat);
  }
  showToast("전체 조회가 완료되었습니다.");
});

document.getElementById("btnExportAll").addEventListener("click", exportAllExcel);
