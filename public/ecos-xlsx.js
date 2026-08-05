(function (global) {
  "use strict";

  const encoder = new TextEncoder();
  const chartColors = ["2F91C5", "E0631A", "1A9E6A", "8B5CF6", "E11D48", "0EA5E9", "CA8A04"];

  function escapeXml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function columnName(index) {
    let value = index;
    let result = "";
    while (value > 0) {
      value -= 1;
      result = String.fromCharCode(65 + (value % 26)) + result;
      value = Math.floor(value / 26);
    }
    return result;
  }

  function cellReference(row, column) {
    return `${columnName(column)}${row}`;
  }

  function quotedSheetName(name) {
    return `'${String(name).replace(/'/g, "''")}'`;
  }

  function numericValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function buildWorkbookModel(items, rows) {
    const valuesByDate = new Map();
    rows.forEach((row) => {
      if (!valuesByDate.has(row.time)) valuesByDate.set(row.time, new Map());
      valuesByDate.get(row.time).set(row.item_name, numericValue(row.value));
    });
    const dates = [...valuesByDate.keys()].sort();

    if (items.length === 1) {
      const item = items[0];
      const matrix = [
        ["항목", ...dates],
        [item.name, ...dates.map((date) => valuesByDate.get(date).get(item.name))],
      ];
      return {
        matrix,
        categories: { row: 1, startColumn: 2, endColumn: dates.length + 1 },
        series: [{ itemName: item.name, nameRow: 2, nameColumn: 1, valuesRow: 2, startColumn: 2, endColumn: dates.length + 1 }],
      };
    }

    const matrix = [
      ["일자", ...items.map((item) => item.name)],
      ...dates.map((date) => [date, ...items.map((item) => valuesByDate.get(date).get(item.name))]),
    ];
    return {
      matrix,
      categories: { column: 1, startRow: 2, endRow: dates.length + 1 },
      series: items.map((item, index) => ({
        itemName: item.name,
        nameRow: 1,
        nameColumn: index + 2,
        valuesColumn: index + 2,
        startRow: 2,
        endRow: dates.length + 1,
      })),
    };
  }

  function worksheetXml(model) {
    const rows = model.matrix.map((row, rowIndex) => {
      const cells = row.map((value, columnIndex) => {
        const rowNumber = rowIndex + 1;
        const columnNumber = columnIndex + 1;
        const reference = cellReference(rowNumber, columnNumber);
        const style = rowIndex === 0 ? 1 : columnIndex === 0 ? 2 : 3;
        if (typeof value === "number" && Number.isFinite(value)) {
          return `<c r="${reference}" s="${style}"><v>${value}</v></c>`;
        }
        return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value ?? "")}</t></is></c>`;
      }).join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    }).join("");

    const columnCount = Math.max(...model.matrix.map((row) => row.length));
    const columns = `<cols><col min="1" max="1" width="17" customWidth="1"/><col min="2" max="${columnCount}" width="13" customWidth="1"/></cols>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/>${columns}<sheetData>${rows}</sheetData><drawing r:id="rId1"/></worksheet>`;
  }

  function rangeFormula(sheetName, range) {
    const sheet = quotedSheetName(sheetName);
    if (range.row) {
      return `${sheet}!$${columnName(range.startColumn)}$${range.row}:$${columnName(range.endColumn)}$${range.row}`;
    }
    return `${sheet}!$${columnName(range.column)}$${range.startRow}:$${columnName(range.column)}$${range.endRow}`;
  }

  function seriesFormula(sheetName, series) {
    const sheet = quotedSheetName(sheetName);
    if (series.valuesRow) {
      return `${sheet}!$${columnName(series.startColumn)}$${series.valuesRow}:$${columnName(series.endColumn)}$${series.valuesRow}`;
    }
    return `${sheet}!$${columnName(series.valuesColumn)}$${series.startRow}:$${columnName(series.valuesColumn)}$${series.endRow}`;
  }

  function modelSeriesDefinitions(sheetName, model) {
    const categories = rangeFormula(sheetName, model.categories);
    const pointCount = model.categories.row
      ? Math.max(model.categories.endColumn - model.categories.startColumn + 1, 1)
      : Math.max(model.categories.endRow - model.categories.startRow + 1, 1);
    return model.series.map((series) => ({
      label: series.itemName,
      categories,
      values: seriesFormula(sheetName, series),
      pointCount,
      axis: "primary",
    }));
  }

  function lineSeriesXml(series, index) {
    const color = chartColors[index % chartColors.length];
    return `<c:ser><c:idx val="${index}"/><c:order val="${index}"/><c:tx><c:v>${escapeXml(series.label)}</c:v></c:tx><c:spPr><a:ln w="28575"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:ln></c:spPr><c:marker><c:symbol val="none"/></c:marker><c:cat><c:strRef><c:f>${escapeXml(series.categories)}</c:f></c:strRef></c:cat><c:val><c:numRef><c:f>${escapeXml(series.values)}</c:f></c:numRef></c:val><c:smooth val="0"/></c:ser>`;
  }

  function lineChartGroup(series, categoryAxisId, valueAxisId) {
    const seriesXml = series.map((entry) => lineSeriesXml(entry.series, entry.index)).join("");
    return `<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>${seriesXml}<c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/></c:dLbls><c:axId val="${categoryAxisId}"/><c:axId val="${valueAxisId}"/></c:lineChart>`;
  }

  function richTitleXml(text, fontSize = 1100, bold = false) {
    if (!text) return "";
    return `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="ko-KR" sz="${fontSize}" b="${bold ? 1 : 0}"/><a:t>${escapeXml(text)}</a:t></a:r><a:endParaRPr lang="ko-KR" sz="${fontSize}"/></a:p></c:rich></c:tx><c:layout/><c:overlay val="0"/></c:title>`;
  }

  function gridlinesXml() {
    return '<c:majorGridlines><c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="D9E2EC"><a:alpha val="55000"/></a:srgbClr></a:solidFill><a:prstDash val="dash"/></a:ln></c:spPr></c:majorGridlines>';
  }

  function axisStyleXml() {
    return '<c:spPr><a:ln w="12700"><a:solidFill><a:srgbClr val="7A8793"/></a:solidFill><a:prstDash val="solid"/></a:ln></c:spPr>';
  }

  function axisTextPropertiesXml() {
    return '<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr lang="ko-KR" sz="900"><a:solidFill><a:srgbClr val="52606D"/></a:solidFill></a:defRPr></a:pPr><a:endParaRPr lang="ko-KR" sz="900"/></a:p></c:txPr>';
  }

  function legendTextPropertiesXml() {
    return '<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr lang="ko-KR" sz="1000" b="1"><a:solidFill><a:srgbClr val="25313C"/></a:solidFill></a:defRPr></a:pPr><a:endParaRPr lang="ko-KR" sz="1000" b="1"/></a:p></c:txPr>';
  }

  function valueAxisXml(axisId, position, categoryAxisId, secondary = false, title = "값") {
    const gridlines = secondary ? "" : gridlinesXml();
    const crosses = secondary ? '<c:crosses val="max"/>' : '<c:crosses val="autoZero"/>';
    return `<c:valAx><c:axId val="${axisId}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${position}"/>${gridlines}${richTitleXml(title, 1000, true)}<c:numFmt formatCode="#,##0.00" sourceLinked="0"/><c:majorTickMark val="out"/><c:tickLblPos val="nextTo"/>${axisStyleXml()}${axisTextPropertiesXml()}<c:crossAx val="${categoryAxisId}"/>${crosses}<c:crossBetween val="between"/></c:valAx>`;
  }

  function chartXml(seriesDefinitions, options = {}) {
    const categoryAxisId = 48650112;
    const primaryAxisId = 48672768;
    const secondaryAxisId = 48695552;
    const indexed = seriesDefinitions.map((series, index) => ({ series, index }));
    const primary = indexed.filter((entry) => entry.series.axis !== "secondary");
    const secondary = indexed.filter((entry) => entry.series.axis === "secondary");
    const mainSeries = primary.length ? primary : secondary;
    const secondarySeries = primary.length ? secondary : [];
    const labelSkip = Math.max(1, Math.ceil(Math.max(...seriesDefinitions.map((series) => series.pointCount || 1)) / 12));
    const lineCharts = lineChartGroup(mainSeries, categoryAxisId, primaryAxisId)
      + (secondarySeries.length ? lineChartGroup(secondarySeries, categoryAxisId, secondaryAxisId) : "");
    const secondaryAxis = secondarySeries.length
      ? valueAxisXml(secondaryAxisId, "r", categoryAxisId, true, options.secondaryYTitle || "보조축")
      : "";
    const chartTitle = richTitleXml(options.chartTitle || "ECOS 통계 추이", 1500, true);
    const categoryAxis = `<c:catAx><c:axId val="${categoryAxisId}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/>${gridlinesXml()}${richTitleXml(options.xTitle || "일자", 1000, true)}<c:majorTickMark val="out"/><c:tickLblPos val="nextTo"/>${axisStyleXml()}${axisTextPropertiesXml()}<c:crossAx val="${primaryAxisId}"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:tickLblSkip val="${labelSkip}"/><c:tickMarkSkip val="${labelSkip}"/><c:noMultiLvlLbl val="1"/></c:catAx>`;

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:date1904 val="0"/><c:lang val="ko-KR"/><c:roundedCorners val="0"/><c:chart>${chartTitle}<c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>${lineCharts}${categoryAxis}${valueAxisXml(primaryAxisId, "l", categoryAxisId, false, options.primaryYTitle || "값")}${secondaryAxis}<c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:plotArea><c:legend><c:legendPos val="b"/><c:layout/>${legendTextPropertiesXml()}</c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/><c:showDLblsOverMax val="0"/></c:chart><c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:solidFill><a:srgbClr val="E6EBF0"/></a:solidFill></a:ln></c:spPr><c:printSettings><c:headerFooter/><c:pageMargins b="0.75" l="0.7" r="0.7" t="0.75" header="0.3" footer="0.3"/><c:pageSetup/></c:printSettings></c:chartSpace>`;
  }

  function drawingXml(startRow, startColumn = 0) {
    const fromRow = Math.max(startRow - 1, 0);
    const fromColumn = Math.max(startColumn, 0);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>${fromColumn}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${fromRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${fromColumn + 10}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${fromRow + 18}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="ECOS 데이터 차트"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`;
  }

  function stylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts><fonts count="2"><font><sz val="10"/><name val="Arial"/><family val="2"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F91C5"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9E2EC"/></left><right style="thin"><color rgb="FFD9E2EC"/></right><top style="thin"><color rgb="FFD9E2EC"/></top><bottom style="thin"><color rgb="FFD9E2EC"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
      table[index] = value >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function littleEndian(values) {
    const bytes = new Uint8Array(values.reduce((sum, item) => sum + item[1], 0));
    const view = new DataView(bytes.buffer);
    let offset = 0;
    values.forEach(([value, size]) => {
      if (size === 2) view.setUint16(offset, value, true);
      else view.setUint32(offset, value >>> 0, true);
      offset += size;
    });
    return bytes;
  }

  function concatBytes(parts) {
    const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0;
    parts.forEach((part) => { output.set(part, offset); offset += part.length; });
    return output;
  }

  function zipStore(files) {
    const locals = [];
    const centrals = [];
    let localOffset = 0;
    Object.entries(files).forEach(([name, contents]) => {
      const nameBytes = encoder.encode(name);
      const dataBytes = typeof contents === "string" ? encoder.encode(contents) : contents;
      const crc = crc32(dataBytes);
      const localHeader = littleEndian([[0x04034b50, 4], [20, 2], [0x0800, 2], [0, 2], [0, 2], [0, 2], [crc, 4], [dataBytes.length, 4], [dataBytes.length, 4], [nameBytes.length, 2], [0, 2]]);
      const local = concatBytes([localHeader, nameBytes, dataBytes]);
      locals.push(local);
      const centralHeader = littleEndian([[0x02014b50, 4], [20, 2], [20, 2], [0x0800, 2], [0, 2], [0, 2], [0, 2], [crc, 4], [dataBytes.length, 4], [dataBytes.length, 4], [nameBytes.length, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 4], [localOffset, 4]]);
      centrals.push(concatBytes([centralHeader, nameBytes]));
      localOffset += local.length;
    });
    const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
    const end = littleEndian([[0x06054b50, 4], [0, 2], [0, 2], [centrals.length, 2], [centrals.length, 2], [centralSize, 4], [localOffset, 4], [0, 2]]);
    return concatBytes([...locals, ...centrals, end]);
  }

  function safeSheetName(name, usedNames) {
    const base = String(name || "ECOS").slice(0, 31).replace(/[\\/?*:[\]]/g, "_") || "ECOS";
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate)) {
      const ending = `_${suffix}`;
      candidate = `${base.slice(0, 31 - ending.length)}${ending}`;
      suffix += 1;
    }
    usedNames.add(candidate);
    return candidate;
  }

  function median(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function exchangeSeriesWithAxes(sheet) {
    const series = modelSeriesDefinitions(sheet.name, sheet.model);
    const medians = new Map();
    sheet.items.forEach((item) => {
      const values = sheet.rows
        .filter((row) => row.item_name === item.name)
        .map((row) => numericValue(row.value))
        .filter((value) => value !== null);
      medians.set(item.name, median(values));
    });
    const positive = series.map((entry) => medians.get(entry.label)).filter((value) => value > 0);
    if (positive.length < 2) return series;
    const minimum = Math.min(...positive);
    const maximum = Math.max(...positive);
    if (maximum / minimum < 2) return series;
    const threshold = Math.sqrt(minimum * maximum);
    return series.map((entry) => ({
      ...entry,
      axis: medians.get(entry.label) < threshold ? "secondary" : "primary",
    }));
  }

  function relabelSeries(series, label) {
    return { ...series, label };
  }

  function chartPlanForSheet(sheet, prepared) {
    if (sheet.name === "환율") {
      return { series: exchangeSeriesWithAxes(sheet), startRow: 1, startColumn: 26, chartTitle: "환율 추이", xTitle: "일자", primaryYTitle: "환율(주축)", secondaryYTitle: "환율(보조축)" };
    }

    if (sheet.name === "기준금리") {
      const market = prepared.find((entry) => entry.name === "금리");
      const loan = prepared.find((entry) => entry.name === "예대금리");
      if (market && loan) {
        const marketSeries = modelSeriesDefinitions(market.name, market.model);
        const baseSeries = modelSeriesDefinitions(sheet.name, sheet.model).map((entry) => relabelSeries(entry, "기준금리"));
        const loanSeries = modelSeriesDefinitions(loan.name, loan.model).map((entry) => relabelSeries(entry, "예대금리"));
        return { series: [...marketSeries, ...baseSeries, ...loanSeries], startRow: 10, startColumn: 0, chartTitle: "금리 비교 (시장금리·기준금리·예대금리)", xTitle: "일자", primaryYTitle: "금리(%)" };
      }
    }

    if (sheet.name === "소비자물가") {
      const producer = prepared.find((entry) => entry.name === "생산자물가");
      if (producer) {
        const consumerSeries = modelSeriesDefinitions(sheet.name, sheet.model).map((entry) => relabelSeries(entry, "소비자물가"));
        const producerSeries = modelSeriesDefinitions(producer.name, producer.model).map((entry) => relabelSeries(entry, "생산자물가"));
        return { series: [...consumerSeries, ...producerSeries], startRow: 10, startColumn: 0, chartTitle: "물가지수 비교 (소비자·생산자)", xTitle: "일자", primaryYTitle: "지수" };
      }
    }

    const isRate = ["금리", "기준금리", "예대금리"].includes(sheet.name);
    const isPrice = ["소비자물가", "생산자물가"].includes(sheet.name);
    return {
      series: modelSeriesDefinitions(sheet.name, sheet.model),
      startRow: Math.max(sheet.model.matrix.length + 3, 10),
      startColumn: 0,
      chartTitle: `${sheet.name} 추이`,
      xTitle: "일자",
      primaryYTitle: isRate ? "금리(%)" : isPrice ? "지수" : "값",
    };
  }

  function buildWorkbookBytes({ sheets }) {
    const usedNames = new Set();
    const prepared = sheets.map((sheet) => ({
      ...sheet,
      name: safeSheetName(sheet.sheetName, usedNames),
      model: buildWorkbookModel(sheet.items, sheet.rows),
    }));
    const now = new Date().toISOString();

    const contentOverrides = prepared.map((sheet, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/drawings/drawing${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/><Override PartName="/xl/charts/chart${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`).join("");
    const workbookSheets = prepared.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("");
    const workbookRelationships = prepared.map((sheet, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");

    const files = {
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${contentOverrides}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
      "docProps/core.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>ECOS 통계 조회</dc:creator><cp:lastModifiedBy>ECOS 통계 조회</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`,
      "docProps/app.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>ECOS 통계 조회</Application><Sheets>${prepared.length}</Sheets></Properties>`,
      "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets><calcPr calcId="191029" calcMode="auto"/></workbook>`,
      "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${workbookRelationships}<Relationship Id="rId${prepared.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
      "xl/styles.xml": stylesXml(),
    };

    prepared.forEach((sheet, index) => {
      const partNumber = index + 1;
      const chartPlan = chartPlanForSheet(sheet, prepared);
      files[`xl/worksheets/sheet${partNumber}.xml`] = worksheetXml(sheet.model);
      files[`xl/worksheets/_rels/sheet${partNumber}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${partNumber}.xml"/></Relationships>`;
      files[`xl/drawings/drawing${partNumber}.xml`] = drawingXml(chartPlan.startRow, chartPlan.startColumn);
      files[`xl/drawings/_rels/drawing${partNumber}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${partNumber}.xml"/></Relationships>`;
      files[`xl/charts/chart${partNumber}.xml`] = chartXml(chartPlan.series, chartPlan);
    });
    return zipStore(files);
  }

  function downloadWorkbook({ sheets, filename }) {
    const bytes = buildWorkbookBytes({ sheets });
    const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return { bytes, filename };
  }

  global.EcosXlsx = { buildWorkbookBytes, downloadWorkbook };
})(window);