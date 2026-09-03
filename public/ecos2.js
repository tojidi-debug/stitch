const STORAGE_KEY = "ecos2.admin.v2";
const QUERY_SETTINGS_KEY = "ecos.querySettings.v1";
const COLORS = ["#1a6de0", "#e0631a", "#1a9e6a", "#8b5cf6", "#e11d48", "#0ea5e9"];
export const CATALOG = [
  {"id":"stock","title":"주가지수","exportName":"주가지수","icon":"📈","sub":"802Y001 · 주식시장 (일별)","cycle":"D","dataRoot":"./ecos-data","defaultVisible":true,"items":[{"id":"kospi","code":"0001000","name":"KOSPI","file":"stock-kospi.json","checked":true},{"id":"kosdaq","code":"0089000","name":"KOSDAQ","file":"stock-kosdaq.json","checked":true}]},
  {"id":"base","title":"한국은행 기준금리","exportName":"기준금리","icon":"🏦","sub":"722Y001 · 기준금리 (일별)","cycle":"D","dataRoot":"./ecos-data","defaultVisible":true,"items":[{"id":"base","code":"0101000","name":"기준금리","file":"base-0101000.json","checked":true}]},
  {"id":"growth","title":"경제성장률","exportName":"경제성장률","icon":"🌱","sub":"902Y015 · 한국 경제성장률 (분기)","cycle":"Q","dataRoot":"./ecos-data","defaultVisible":true,"items":[{"id":"korea","code":"KOR","name":"한국","file":"growth-korea.json","checked":true}]},
  {"id":"trade","title":"수출·수입물가지수","exportName":"수출입물가","icon":"🚢","sub":"원화기준, 2020=100 (월별)","cycle":"M","dataRoot":"./ecos-data","defaultVisible":true,"items":[{"id":"export","code":"*AA/W","name":"수출물가","file":"trade-export.json","checked":true},{"id":"import","code":"*AA/W","name":"수입물가","file":"trade-import.json","checked":true}]},
  {"id":"living","title":"생활물가지수","exportName":"생활물가","icon":"🧺","sub":"901Y010 · 소비자물가 특수분류 (월별)","cycle":"M","dataRoot":"./ecos-data","defaultVisible":true,"items":[{"id":"living","code":"110","name":"생활물가","file":"living-living.json","checked":true},{"id":"fresh","code":"10","name":"신선식품","file":"living-fresh.json","checked":false}]},
  {"id":"supply","title":"국내공급물가지수","exportName":"국내공급물가","icon":"🏭","sub":"405Y006 · 2020=100 (월별)","cycle":"M","dataRoot":"./ecos-data","defaultVisible":true,"items":[{"id":"total","code":"*A","name":"총지수","file":"supply-total.json","checked":true},{"id":"raw","code":"100A","name":"원재료","file":"supply-raw.json","checked":true},{"id":"intermediate","code":"200A","name":"중간재","file":"supply-intermediate.json","checked":true},{"id":"final","code":"300A","name":"최종재","file":"supply-final.json","checked":true}]},
  {"id":"fx","title":"환율","exportName":"환율","icon":"💱","sub":"731Y001 · 매매기준율 (일별)","cycle":"D","dataRoot":"./ecos-data","defaultVisible":false,"items":[{"id":"usd","code":"0000001","name":"USD","file":"fx-0000001.json","checked":true},{"id":"eur","code":"0000003","name":"EUR","file":"fx-0000003.json","checked":true},{"id":"jpy","code":"0000002","name":"JPY(100)","file":"fx-0000002.json","checked":true},{"id":"cny","code":"0000053","name":"CNY","file":"fx-0000053.json","checked":true}]},
  {"id":"rate","title":"국고채·회사채·단기금리","exportName":"금리","icon":"📉","sub":"817Y002 · 시장금리 (일별)","cycle":"D","dataRoot":"./ecos-data","defaultVisible":false,"items":[{"id":"gov3","code":"010200000","name":"국고채(3년)","file":"rate-010200000.json","checked":true},{"id":"gov5","code":"010200001","name":"국고채(5년)","file":"rate-010200001.json","checked":true},{"id":"gov10","code":"010210000","name":"국고채(10년)","file":"rate-010210000.json","checked":true},{"id":"corp3","code":"010300000","name":"회사채(3년,AA-)","file":"rate-010300000.json","checked":true}]},
  {"id":"loan","title":"예금은행 대출금리","exportName":"예대금리","icon":"💳","sub":"121Y006 · 신규취급액 기준 (월별)","cycle":"M","dataRoot":"./ecos-data","defaultVisible":false,"items":[{"id":"loan","code":"BECBLA01","name":"대출평균","file":"loan-BECBLA01.json","checked":true}]},
  {"id":"cpi","title":"소비자물가지수","exportName":"소비자물가","icon":"📊","sub":"901Y009 · 총지수, 2020=100 (월별)","cycle":"M","dataRoot":"./ecos-data","defaultVisible":false,"items":[{"id":"cpi","code":"0","name":"총지수","file":"cpi-0.json","checked":true}]},
  {"id":"ppi","title":"생산자물가지수","exportName":"생산자물가","icon":"🏗️","sub":"404Y014 · 총지수, 2020=100 (월별)","cycle":"M","dataRoot":"./ecos-data","defaultVisible":false,"items":[{"id":"ppi","code":"*AA","name":"총지수","file":"ppi-_42AA.json","checked":true}]}
];
const hasDocument = typeof document !== "undefined";
const grid = hasDocument ? document.getElementById("cardGrid") : null;
const toast = hasDocument ? document.getElementById("toast") : null;
let catalog = CATALOG;
let settings = { order: [], hidden: [], titles: {} };

export function cycleBoundary(dateValue, cycle) {
  const digits = String(dateValue || "").replace(/\D/g, "");
  const year = digits.slice(0, 4);
  if (cycle === "A") return year;
  if (cycle === "Q") {
    const month = Number(digits.slice(4, 6) || "1");
    return `${year}Q${Math.min(4, Math.max(1, Math.ceil(month / 3)))}`;
  }
  if (cycle === "M") return digits.slice(0, 6);
  return digits.slice(0, 8);
}

export function filterRowsByRange(rows, startDate, endDate, cycle) {
  const start = cycleBoundary(startDate, cycle);
  const end = cycleBoundary(endDate, cycle);
  return (rows || []).filter(([time]) => String(time) >= start && String(time) <= end);
}

export function normalizeAdminSettings(sourceCatalog, candidate = {}) {
  const ids = sourceCatalog.map((item) => item.id);
  const allowed = new Set(ids);
  const requestedOrder = Array.isArray(candidate.order) ? candidate.order.filter((id) => allowed.has(id)) : [];
  const order = [...new Set([...requestedOrder, ...ids])];
  const hidden = Array.isArray(candidate.hidden)
    ? [...new Set(candidate.hidden.filter((id) => allowed.has(id)))]
    : sourceCatalog.filter((item) => item.defaultVisible === false).map((item) => item.id);
  const titles = {};
  if (candidate.titles && typeof candidate.titles === "object") {
    for (const [id, title] of Object.entries(candidate.titles)) {
      if (allowed.has(id) && typeof title === "string" && title.trim()) titles[id] = title.trim().slice(0, 40);
    }
  }
  return { order, hidden, titles };
}

export function pivotSeries(series, options = {}) {
  const dates = [...new Set(series.flatMap((item) => (item.rows || []).map(([time]) => String(time))))].sort();
  if (options.descending) dates.reverse();
  const rows = series.map((item) => {
    const values = new Map((item.rows || []).map(([time, value]) => [String(time), String(value)]));
    return [item.label, ...dates.map((date) => values.get(date) ?? "")];
  });
  return { dates, rows };
}

export function tableMatrixForCategory(categoryId, series) {
  if (["stock", "trade"].includes(categoryId)) {
    const { dates, rows } = pivotSeries(series.map((item) => ({ label: item.name, rows: item.rows })), { descending: true });
    return { header: ["항목", ...dates], body: rows };
  }
  const dates = [...new Set(series.flatMap((item) => item.rows.map(([time]) => time)))].sort();
  const maps = series.map((item) => new Map(item.rows));
  if (series.length === 1) return { header: ["항목", ...dates], body: [[series[0].name, ...dates.map((date) => maps[0].get(date) ?? "")]] };
  return { header: ["일자", ...series.map((item) => item.name)], body: dates.map((date) => [date, ...maps.map((map) => map.get(date) ?? "")]) };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function pad2(value) { return String(value).padStart(2, "0"); }
function compactDate(date) { return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`; }
function displayDate(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function loadQuerySettings() {
  try { return JSON.parse(localStorage.getItem(QUERY_SETTINGS_KEY) || "null"); }
  catch { return null; }
}

function saveQuerySettings() {
  localStorage.setItem(QUERY_SETTINGS_KEY, JSON.stringify({
    mode: document.querySelector('input[name="dateMode"]:checked').value,
    single: document.getElementById("dateSingle").value,
    start: document.getElementById("dateStart").value,
    end: document.getElementById("dateEnd").value,
  }));
}

function syncDateMode(mode) {
  const single = mode !== "range";
  document.querySelector(`input[name="dateMode"][value="${single ? "single" : "range"}"]`).checked = true;
  document.getElementById("singleDateField").hidden = !single;
  document.getElementById("rangeDateField").hidden = single;
}

function initDates() {
  const today = new Date();
  const start = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
  const saved = loadQuerySettings();
  document.getElementById("dateSingle").value = saved?.single ?? displayDate(compactDate(today));
  document.getElementById("dateStart").value = saved?.start ?? displayDate(compactDate(start));
  document.getElementById("dateEnd").value = saved?.end ?? displayDate(compactDate(today));
  syncDateMode(saved?.mode === "single" ? "single" : "range");
}

function attachDateMask(input) {
  input.addEventListener("input", () => {
    const caretAtEnd = input.selectionStart === input.value.length;
    input.value = displayDate(input.value);
    if (caretAtEnd) input.setSelectionRange(input.value.length, input.value.length);
    saveQuerySettings();
  });
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveSettings(next) {
  settings = normalizeAdminSettings(catalog, next);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function visibleCategories() {
  const map = new Map(catalog.map((category) => [category.id, category]));
  return settings.order.filter((id) => !settings.hidden.includes(id)).map((id) => map.get(id)).filter(Boolean);
}

function titleFor(category) { return settings.titles[category.id] || category.title; }

function queryRange(cycle) {
  const mode = document.querySelector('input[name="dateMode"]:checked').value;
  const single = document.getElementById("dateSingle").value.replace(/\D/g, "");
  const startRaw = mode === "single" ? single : document.getElementById("dateStart").value.replace(/\D/g, "");
  const endRaw = mode === "single" ? single : document.getElementById("dateEnd").value.replace(/\D/g, "");
  if (startRaw.length !== 8 || endRaw.length !== 8) throw new Error("날짜를 YYYYMMDD 형식으로 입력해 주세요.");
  if (startRaw > endRaw) throw new Error("시작일이 종료일보다 늦습니다.");
  return { start: cycleBoundary(startRaw, cycle), end: cycleBoundary(endRaw, cycle), startRaw, endRaw };
}

function buildCard(category) {
  const card = document.createElement("section");
  card.className = "card";
  card.id = `card-${category.id}`;
  const itemControls = category.items.length > 1 ? `
    <div class="item-list">
      <label class="select-all"><input type="checkbox" data-select-all /> 전체</label>
      ${category.items.map((item) => `<label><input type="checkbox" data-item="${escapeHtml(item.id)}" ${item.checked ? "checked" : ""} /> ${escapeHtml(item.name)}</label>`).join("")}
    </div>` : "";
  card.innerHTML = `
    <div class="card-head">
      <div><div class="card-title"><span>${category.icon}</span><span class="card-title-text">${escapeHtml(titleFor(category))}</span></div><div class="card-sub">${escapeHtml(category.sub)}</div></div>
      <div class="card-actions"><button class="btn btn-ghost btn-sm" data-action="copy">COPY</button><button class="btn btn-ghost btn-sm" data-action="excel">엑셀 다운로드</button><button class="btn btn-primary btn-sm" data-action="query">조회</button></div>
    </div>
    ${itemControls}
    <div class="result-summary" data-role="summary"></div>
    <div class="chart-box" data-role="chart"></div>
    <div class="table-wrap" data-role="table"><table><thead></thead><tbody><tr><td class="empty-msg">조회 버튼을 눌러 데이터를 가져오세요.</td></tr></tbody></table></div>`;

  const selectAll = card.querySelector("[data-select-all]");
  if (selectAll) {
    const itemBoxes = [...card.querySelectorAll("[data-item]")];
    const sync = () => { selectAll.checked = itemBoxes.every((box) => box.checked); selectAll.indeterminate = itemBoxes.some((box) => box.checked) && !selectAll.checked; };
    selectAll.addEventListener("change", () => { itemBoxes.forEach((box) => { box.checked = selectAll.checked; }); });
    itemBoxes.forEach((box) => box.addEventListener("change", sync));
    sync();
  }
  card.querySelector('[data-action="query"]').addEventListener("click", () => queryCategory(category));
  card.querySelector('[data-action="copy"]').addEventListener("click", () => copyCategory(category));
  card.querySelector('[data-action="excel"]').addEventListener("click", () => exportCategory(category));
  return card;
}

function renderCards() {
  grid.innerHTML = "";
  for (const category of visibleCategories()) grid.appendChild(buildCard(category));
  if (!grid.children.length) grid.innerHTML = '<div class="panel admin-empty">표시 중인 통계가 없습니다. 관리자 설정에서 조회항목을 추가해 주세요.</div>';
}

function checkedItems(category) {
  const card = document.getElementById(`card-${category.id}`);
  if (category.items.length === 1) return category.items;
  const selected = new Set([...card.querySelectorAll("[data-item]:checked")].map((box) => box.dataset.item));
  return category.items.filter((item) => selected.has(item.id));
}

async function fetchItem(category, item, range) {
  const response = await fetch(`${category.dataRoot}/${item.file}`, { cache: "no-cache" });
  if (!response.ok) throw new Error(`${item.name} 데이터(${response.status})`);
  const payload = await response.json();
  return { ...item, generatedAt: payload.generatedAt, rows: filterRowsByRange(payload.rows || [], range.startRaw, range.endRaw, category.cycle) };
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

function renderTable(card, category, series) {
  const { header, body } = tableMatrixForCategory(category.id, series);
  const thead = card.querySelector("thead");
  const tbody = card.querySelector("tbody");
  thead.innerHTML = `<tr>${header.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr>`;
  tbody.innerHTML = body.map((row) => `<tr>${row.map((cell, index) => `<td>${index === 0 ? escapeHtml(cell) : formatNumber(cell)}</td>`).join("")}</tr>`).join("");
  requestAnimationFrame(() => {
    const wrap = card.querySelector("[data-role=table]");
    wrap.scrollLeft = ["stock", "trade"].includes(category.id) ? 0 : wrap.scrollWidth;
  });
}

function renderSummary(card, series) {
  const summary = card.querySelector("[data-role=summary]");
  summary.innerHTML = series.map((item) => {
    const values = item.rows.map((row) => Number(row[1])).filter(Number.isFinite);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return `<span class="avg-item"><strong>${escapeHtml(item.name)}</strong> 평균: ${formatNumber(average)}</span>`;
  }).join("");
  summary.style.display = "flex";
}

function chartSvg(series) {
  const width = 600, height = 96, left = 20, right = 8, top = 8, bottom = 17;
  const dates = [...new Set(series.flatMap((item) => item.rows.map(([time]) => time)))].sort();
  const allValues = series.flatMap((item) => item.rows.map((row) => Number(row[1]))).filter(Number.isFinite);
  if (!dates.length || !allValues.length) return "";
  let min = Math.min(...allValues), max = Math.max(...allValues);
  const padding = (max - min || Math.abs(max) || 1) * .08;
  min -= padding; max += padding;
  const x = (date) => left + (dates.indexOf(date) / Math.max(1, dates.length - 1)) * (width - left - right);
  const y = (value) => top + (1 - (Number(value) - min) / (max - min)) * (height - top - bottom);
  const gridLines = [0, .25, .5, .75, 1].map((ratio) => `<line class="chart-grid" x1="${left}" y1="${top + ratio * (height - top - bottom)}" x2="${width - right}" y2="${top + ratio * (height - top - bottom)}"/>`).join("");
  const paths = series.map((item, index) => {
    const path = item.rows.filter((row) => Number.isFinite(Number(row[1]))).map((row, point) => `${point ? "L" : "M"}${x(row[0]).toFixed(1)},${y(row[1]).toFixed(1)}`).join(" ");
    return `<path d="${path}" fill="none" stroke="${COLORS[index % COLORS.length]}" stroke-width="1.8" stroke-linejoin="round"/>`;
  }).join("");
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="통계 추이 차트">${gridLines}<line class="chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}"/><line class="chart-axis" x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}"/>${paths}<text class="chart-label" x="${left}" y="${height - 4}">${escapeHtml(dates[0])}</text><text class="chart-label" text-anchor="end" x="${width - right}" y="${height - 4}">${escapeHtml(dates.at(-1))}</text></svg><div class="chart-legend">${series.map((item, index) => `<span><b style="color:${COLORS[index % COLORS.length]}">●</b> ${escapeHtml(item.name)} ${formatNumber(item.rows[0]?.[1])} → ${formatNumber(item.rows.at(-1)?.[1])}</span>`).join("")}</div>`;
}

function renderError(card, message) {
  card.querySelector("[data-role=summary]").style.display = "none";
  card.querySelector("[data-role=chart]").style.display = "none";
  card.querySelector("thead").innerHTML = "";
  card.querySelector("tbody").innerHTML = `<tr><td class="error-msg">${escapeHtml(message)}</td></tr>`;
}

async function queryCategory(category) {
  const card = document.getElementById(`card-${category.id}`);
  if (!card) return false;
  const items = checkedItems(category);
  if (!items.length) { showToast(`${titleFor(category)}에서 항목을 선택해 주세요.`); return false; }
  card.classList.add("is-loading");
  card.querySelector('[data-action="query"]').innerHTML = '<span class="spinner"></span>조회';
  try {
    const range = queryRange(category.cycle);
    const series = await Promise.all(items.map((item) => fetchItem(category, item, range)));
    const available = series.filter((item) => item.rows.length);
    if (!available.length) throw new Error("선택한 기간에 발표된 데이터가 없습니다.");
    category._lastSeries = available;
    category._lastRange = range;
    category._lastRows = available.flatMap((item) => item.rows.map(([time, value]) => ({ time, item_name: item.name, value })));
    renderSummary(card, available);
    const chart = card.querySelector("[data-role=chart]");
    chart.innerHTML = chartSvg(available);
    chart.style.display = "block";
    renderTable(card, category, available);
    return true;
  } catch (error) {
    renderError(card, location.protocol === "file:" ? "공개 웹 주소에서 열어 주세요. 로컬 파일은 데이터를 불러올 수 없습니다." : error.message);
    return false;
  } finally {
    card.classList.remove("is-loading");
    card.querySelector('[data-action="query"]').textContent = "조회";
  }
}

function sheetFor(category) {
  const items = (category._lastSeries || []).map((item) => ({ code: item.code, name: item.name }));
  return { sheetName: category.exportName || titleFor(category), items, rows: category._lastRows || [], preferredItemName: items[0]?.name, chartLabel: `${titleFor(category)} 추이` };
}

function copyCategory(category) {
  if (!category._lastSeries?.length) return showToast("먼저 조회를 실행하세요.");
  const matrix = tableMatrixForCategory(category.id, category._lastSeries);
  const text = [matrix.header, ...matrix.body].map((row) => row.join("\t")).join("\n");
  navigator.clipboard.writeText(text).then(() => showToast(`${titleFor(category)} 결과를 복사했습니다.`), () => showToast("복사에 실패했습니다."));
}

function exportCategory(category) {
  if (!category._lastSeries?.length) return showToast("먼저 조회를 실행하세요.");
  if (!window.EcosXlsx) return showToast("엑셀 생성 모듈을 불러오지 못했습니다.");
  const name = category.exportName || titleFor(category);
  window.EcosXlsx.downloadWorkbook({ sheets: [sheetFor(category)], filename: `${name}_${category._lastRange.start}_${category._lastRange.end}.xlsx` });
  showToast(`${name} 엑셀 파일을 만들었습니다.`);
}

async function queryAll() {
  const button = document.getElementById("btnQueryAll");
  button.disabled = true; button.textContent = "조회 중...";
  const results = [];
  for (const category of visibleCategories()) results.push(await queryCategory(category));
  button.disabled = false; button.textContent = "전체 조회";
  showToast(results.every(Boolean) ? "전체 조회가 완료되었습니다." : "일부 통계는 선택 기간의 데이터가 없습니다.");
}

async function exportAll() {
  const categories = visibleCategories();
  const button = document.getElementById("btnExportAll");
  button.disabled = true; button.textContent = "조회 및 생성 중...";
  for (const category of categories) if (!category._lastSeries?.length) await queryCategory(category);
  const available = categories.filter((category) => category._lastSeries?.length);
  if (available.length && window.EcosXlsx) {
    window.EcosXlsx.downloadWorkbook({ sheets: available.map(sheetFor), filename: `ECOS확장통계_${compactDate(new Date())}.xlsx` });
    showToast("전체 엑셀 파일을 만들었습니다.");
  } else showToast("다운로드할 조회 결과가 없습니다.");
  button.disabled = false; button.textContent = "전체 엑셀 다운로드";
}

function openAdmin(open) {
  const panel = document.getElementById("adminPanel");
  panel.hidden = !open;
  document.getElementById("btnAdmin").setAttribute("aria-expanded", String(open));
  if (open) { renderAdmin(); panel.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
}

function renderAdmin() {
  const map = new Map(catalog.map((category) => [category.id, category]));
  const list = document.getElementById("adminList");
  list.innerHTML = settings.order.map((id) => {
    const category = map.get(id);
    return `<div class="admin-row" data-admin-id="${escapeHtml(id)}"><label><input type="checkbox" data-admin-visible ${settings.hidden.includes(id) ? "" : "checked"} /> ${category.icon} ${escapeHtml(category.title)}</label><input type="text" data-admin-title value="${escapeHtml(titleFor(category))}" aria-label="${escapeHtml(category.title)} 표시 이름"/><div class="admin-move"><button type="button" data-move="up" aria-label="위로 이동">↑</button><button type="button" data-move="down" aria-label="아래로 이동">↓</button></div></div>`;
  }).join("");
  list.querySelectorAll("[data-move]").forEach((button) => button.addEventListener("click", () => {
    const row = button.closest(".admin-row");
    const sibling = button.dataset.move === "up" ? row.previousElementSibling : row.nextElementSibling;
    if (sibling) list.insertBefore(button.dataset.move === "up" ? row : sibling, button.dataset.move === "up" ? sibling : row);
  }));
}

function applyAdminFromForm() {
  const rows = [...document.querySelectorAll("[data-admin-id]")];
  const next = { order: [], hidden: [], titles: {} };
  for (const row of rows) {
    const id = row.dataset.adminId;
    next.order.push(id);
    if (!row.querySelector("[data-admin-visible]").checked) next.hidden.push(id);
    const title = row.querySelector("[data-admin-title]").value.trim();
    const original = catalog.find((category) => category.id === id)?.title;
    if (title && title !== original) next.titles[id] = title;
  }
  saveSettings(next); renderCards(); openAdmin(false); queryAll();
}

function bindEvents() {
  ["dateSingle", "dateStart", "dateEnd"].forEach((id) => attachDateMask(document.getElementById(id)));
  document.querySelectorAll('input[name="dateMode"]').forEach((radio) => radio.addEventListener("change", () => {
    if (radio.checked) {
      syncDateMode(radio.value);
      saveQuerySettings();
    }
  }));
  document.getElementById("btnQueryAll").addEventListener("click", queryAll);
  document.getElementById("btnExportAll").addEventListener("click", exportAll);
  document.getElementById("btnClearDates").addEventListener("click", () => {
    ["dateSingle", "dateStart", "dateEnd"].forEach((id) => { document.getElementById(id).value = ""; });
    saveQuerySettings();
  });
  document.getElementById("btnAdmin").addEventListener("click", () => openAdmin(document.getElementById("adminPanel").hidden));
  document.getElementById("btnAdminClose").addEventListener("click", () => openAdmin(false));
  document.getElementById("btnAdminSave").addEventListener("click", applyAdminFromForm);
  document.getElementById("btnAdminReset").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); settings = normalizeAdminSettings(catalog, {}); renderAdmin(); showToast("기본 설정으로 복원했습니다."); });
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

async function init() {
  try {
    settings = normalizeAdminSettings(catalog, loadSettings());
    initDates(); bindEvents(); renderCards(); await queryAll();
  } catch (error) {
    grid.innerHTML = `<div class="panel error-msg">${escapeHtml(error.message)}</div>`;
  }
}

if (hasDocument) init();
