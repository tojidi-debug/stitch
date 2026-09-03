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

export function normalizeAdminSettings(catalog, candidate = {}) {
  const ids = catalog.map((item) => item.id);
  const allowed = new Set(ids);
  const requestedOrder = Array.isArray(candidate.order) ? candidate.order.filter((id) => allowed.has(id)) : [];
  const order = [...new Set([...requestedOrder, ...ids])];
  const hidden = Array.isArray(candidate.hidden)
    ? [...new Set(candidate.hidden.filter((id) => allowed.has(id)))]
    : catalog.filter((item) => item.defaultVisible === false).map((item) => item.id);
  const titles = {};
  if (candidate.titles && typeof candidate.titles === "object") {
    for (const [id, title] of Object.entries(candidate.titles)) {
      if (allowed.has(id) && typeof title === "string" && title.trim()) titles[id] = title.trim().slice(0, 40);
    }
  }
  return { order, hidden, titles };
}

export function pivotSeries(series) {
  const dates = [...new Set(series.flatMap((item) => (item.rows || []).map(([time]) => String(time))))].sort();
  const rows = series.map((item) => {
    const values = new Map((item.rows || []).map(([time, value]) => [String(time), String(value)]));
    return [item.label, ...dates.map((date) => values.get(date) ?? "")];
  });
  return { dates, rows };
}
