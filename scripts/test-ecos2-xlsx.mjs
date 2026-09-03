import assert from "node:assert/strict";
globalThis.window = globalThis;
await import("../public/ecos-xlsx.js");

const bytes = globalThis.EcosXlsx.buildWorkbookBytes({
  sheets: [{
    sheetName: "주가지수",
    items: [{ name: "KOSPI" }, { name: "KOSDAQ" }],
    rows: [
      { time: "20260102", item_name: "KOSPI", value: "2500" },
      { time: "20260102", item_name: "KOSDAQ", value: "850" },
      { time: "20260103", item_name: "KOSPI", value: "2520" },
      { time: "20260103", item_name: "KOSDAQ", value: "855" },
    ],
  }],
});

assert.equal(String.fromCharCode(bytes[0], bytes[1]), "PK");
const archiveText = new TextDecoder().decode(bytes);
assert.match(archiveText, /주가지수/);
assert.match(archiveText, /KOSPI/);
assert.match(archiveText, /KOSDAQ/);
assert.match(archiveText, /20260102/);
assert.match(archiveText, /<c:chartSpace/);

console.log("ecos2 xlsx tests passed");
