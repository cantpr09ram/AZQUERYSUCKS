# -*- coding: utf-8 -*-
import unittest

import main as m


class TestParseHtml(unittest.TestCase):
    def test_parse_html_extracts_course_fields(self):
        html = """
        <table>
          <tr><td>系別(Department)：CS</td></tr>
          <tr>
            <td>1</td>
            <td>01</td>
            <td>CS101</td>
            <td>CS</td>
            <td>1</td>
            <td>A</td>
            <td></td>
            <td>必修</td>
            <td>3</td>
            <td>Group</td>
            <td>Intro to CS</td>
            <td>30</td>
            <td>Prof (PHD)</td>
            <td>Mon 1</td>
            <td>Wed 2</td>
          </tr>
        </table>
        """
        records = m.parse_html(html, source="sample.htm")
        self.assertEqual(len(records), 1)

        rec = records[0]
        self.assertEqual(rec["source"], "sample.htm")
        self.assertEqual(rec["dept_block"], "CS")
        self.assertEqual(rec["grade"], "1")
        self.assertEqual(rec["seq"], "01")
        self.assertEqual(rec["code"], "CS101")
        self.assertEqual(rec["major"], "CS")
        self.assertEqual(rec["term_order"], "1")
        self.assertEqual(rec["class"], "A")
        self.assertIsNone(rec["group_div"])
        self.assertEqual(rec["required"], "必修")
        self.assertEqual(rec["credits"], 3)
        self.assertEqual(rec["group"], "Group")
        self.assertEqual(rec["title"], "Intro to CS")
        self.assertEqual(rec["cap"], 30)
        self.assertEqual(rec["teacher"], "Prof")
        self.assertEqual(rec["times"], ["Mon 1", "Wed 2"])


class TestTaMergeHelpers(unittest.TestCase):
    def test_is_ta(self):
        self.assertTrue(m.is_ta("TA"))
        self.assertTrue(m.is_ta("助教"))
        self.assertFalse(m.is_ta("Dr. A"))
        self.assertFalse(m.is_ta(""))

    def test_merge_into_combines_times_teachers_and_meta(self):
        base = {
            "times": ["Mon1"],
            "teacher": "Alice",
            "cap": "30",
            "seq": None,
            "source": "a.html",
        }
        ta = {
            "times": ["Tue2", "Mon1"],
            "teacher": "Bob,Bob",
            "cap": 40,
            "seq": "02",
            "source": "b.html",
        }

        m.merge_into(base, ta)

        self.assertEqual(base["times"], ["Mon1", "Tue2"])
        self.assertEqual(base["teacher"], "Alice,Bob")
        self.assertEqual(base["cap"], 40)
        self.assertEqual(base["seq"], "02")
        self.assertEqual(base["source"], "a.html;b.html")

    def test_dedupe_by_seq_keeps_first(self):
        records = [
            {"seq": "01", "code": "A"},
            {"seq": "01", "code": "B"},
            {"seq": None, "code": "C"},
        ]
        result = m.dedupe_by_seq(records)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["code"], "A")
        self.assertEqual(result[1]["code"], "C")


if __name__ == "__main__":
    unittest.main()
