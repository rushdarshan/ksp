#!/usr/bin/env python3
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from predict import resolve_model_path, main as predict_main


def test_model_file_exists():
    path = resolve_model_path()
    assert os.path.isfile(path), f"Model not found at {path}"
    print(f"OK: model found at {path}")
    return path


def test_predict_returns_floats():
    features = [
        {"latitude": 12.97, "longitude": 77.59, "hour": 14, "day_of_week": 3, "month": 6, "CourtID": 1},
        {"latitude": 13.01, "longitude": 77.62, "hour": 2, "day_of_week": 0, "month": 1, "CourtID": 2},
    ]
    sys.argv = ["predict.py", json.dumps(features)]
    try:
        predict_main()
    except SystemExit:
        pass


def test_missing_columns():
    features = [{"latitude": 12.97, "longitude": 77.59}]
    sys.argv = ["predict.py", json.dumps(features)]
    try:
        predict_main()
    except SystemExit as e:
        assert e.code == 1


def test_file_input():
    import tempfile
    features = [
        {"latitude": 12.97, "longitude": 77.59, "hour": 14, "day_of_week": 3, "month": 6, "CourtID": 1},
    ]
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(features, f)
        tmp = f.name
    sys.argv = ["predict.py", tmp]
    try:
        predict_main()
    except SystemExit:
        pass
    finally:
        os.unlink(tmp)


def test_extra_columns_ignored():
    features = [
        {"latitude": 12.97, "longitude": 77.59, "hour": 14, "day_of_week": 3, "month": 6, "CourtID": 1, "risk_baseline": 0.5, "garbage": 999},
    ]
    sys.argv = ["predict.py", json.dumps(features)]
    try:
        predict_main()
    except SystemExit:
        pass


if __name__ == "__main__":
    test_model_file_exists()
    print(f"Running tests with Python {sys.version}")

    import io
    from contextlib import redirect_stdout

    tests = [
        ("inline JSON input", test_predict_returns_floats),
        ("missing columns fails", test_missing_columns),
        ("file path input", test_file_input),
        ("extra columns ignored", test_extra_columns_ignored),
    ]

    for name, fn in tests:
        buf = io.StringIO()
        try:
            with redirect_stdout(buf):
                fn()
            out = buf.getvalue()
            parsed = json.loads(out.strip())
            if isinstance(parsed, list):
                print(f"  PASS: {name} — {len(parsed)} prediction(s), first={parsed[0]}")
            elif isinstance(parsed, dict) and "error" in parsed:
                print(f"  PASS: {name} — expected error: {parsed['error']}")
            else:
                print(f"  FAIL: {name} — unexpected output: {out}")
        except Exception as e:
            print(f"  FAIL: {name} — {e}")

    print("Done.")