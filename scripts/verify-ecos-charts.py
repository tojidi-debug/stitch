import sys
import unittest
import zipfile
import xml.etree.ElementTree as ET

CHART = "http://schemas.openxmlformats.org/drawingml/2006/chart"
DRAWING = "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
C = f"{{{CHART}}}"
XDR = f"{{{DRAWING}}}"
WORKBOOK_PATH = sys.argv.pop(1)


class EcosChartLayoutTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.path = WORKBOOK_PATH
        cls.archive = zipfile.ZipFile(cls.path)

    @classmethod
    def tearDownClass(cls):
        cls.archive.close()

    def chart(self, number):
        return ET.fromstring(self.archive.read(f"xl/charts/chart{number}.xml"))

    def drawing_anchor(self, number):
        root = ET.fromstring(self.archive.read(f"xl/drawings/drawing{number}.xml"))
        origin = root.find(f".//{XDR}from")
        return int(origin.find(f"{XDR}col").text), int(origin.find(f"{XDR}row").text)

    @staticmethod
    def series_titles(root):
        return [node.text for node in root.findall(f".//{C}ser/{C}tx/{C}v")]

    @staticmethod
    def formulas(root):
        return [node.text for node in root.findall(f".//{C}ser//{C}f")]

    @staticmethod
    def label_skip(root):
        node = root.find(f".//{C}catAx/{C}tickLblSkip")
        return int(node.attrib["val"]) if node is not None else None

    def test_exchange_chart_floats_at_aa1_and_uses_two_y_axes(self):
        chart = self.chart(1)
        self.assertEqual(self.drawing_anchor(1), (26, 0))
        self.assertEqual(len(chart.findall(f".//{C}lineChart")), 2)
        self.assertEqual(len(chart.findall(f".//{C}valAx")), 2)
        self.assertGreater(self.label_skip(chart), 1)
        titles = set(self.series_titles(chart))
        self.assertTrue({"CNY", "EUR", "JPY(100)", "USD"}.issubset(titles))
        self.assertTrue(all("'환율'" in formula for formula in self.formulas(chart)))
        sheet = ET.fromstring(self.archive.read("xl/worksheets/sheet1.xml"))
        spreadsheet = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
        aa1 = sheet.find(f".//{spreadsheet}c[@r='AA1']")
        self.assertIsNotNone(aa1)
        self.assertTrue("".join(aa1.itertext()).strip())

    def test_base_sheet_chart_contains_only_interest_rate_series(self):
        chart = self.chart(3)
        self.assertEqual(self.drawing_anchor(3)[1], 9)
        self.assertEqual(
            set(self.series_titles(chart)),
            {"국고채(10년)", "국고채(3년)", "국고채(5년)", "회사채(3년,AA-)", "기준금리", "예대금리"},
        )
        self.assertTrue(all(any(sheet in formula for sheet in ("'금리'", "'기준금리'", "'예대금리'")) for formula in self.formulas(chart)))
        self.assertGreater(self.label_skip(chart), 1)

    def test_consumer_price_sheet_combines_cpi_and_ppi(self):
        chart = self.chart(5)
        self.assertEqual(self.drawing_anchor(5)[1], 9)
        self.assertEqual(set(self.series_titles(chart)), {"소비자물가", "생산자물가"})
        self.assertTrue(all(any(sheet in formula for sheet in ("'소비자물가'", "'생산자물가'")) for formula in self.formulas(chart)))
        self.assertGreater(self.label_skip(chart), 1)

    def test_chart_titles_axes_gridlines_and_legends_are_readable(self):
        expected_titles = {
            1: "환율 추이",
            3: "금리 비교",
            5: "물가지수 비교",
        }
        drawing = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
        for number, expected_title in expected_titles.items():
            with self.subTest(chart=number):
                chart = self.chart(number)
                title = chart.find(f".//{C}chart/{C}title")
                self.assertIsNotNone(title)
                self.assertIn(expected_title, "".join(title.itertext()))

                gridlines = chart.findall(f".//{C}majorGridlines")
                self.assertGreaterEqual(len(gridlines), 2)
                for gridline in gridlines:
                    color = gridline.find(f".//{drawing}srgbClr")
                    dash = gridline.find(f".//{drawing}prstDash")
                    self.assertIsNotNone(color)
                    self.assertEqual(color.attrib.get("val"), "D9E2EC")
                    self.assertIsNotNone(dash)
                    self.assertEqual(dash.attrib.get("val"), "dash")

                axes = chart.findall(f".//{C}catAx") + chart.findall(f".//{C}valAx")
                for axis in axes:
                    dash = axis.find(f"./{C}spPr/{drawing}ln/{drawing}prstDash")
                    self.assertIsNotNone(dash)
                    self.assertEqual(dash.attrib.get("val"), "solid")

                legend = chart.find(f".//{C}legend")
                legend_bold = legend.find(f".//{drawing}defRPr") if legend is not None else None
                self.assertIsNotNone(legend_bold)
                self.assertEqual(legend_bold.attrib.get("b"), "1")
                self.assertIn("일자", "".join(chart.itertext()))

if __name__ == "__main__":
    unittest.main()