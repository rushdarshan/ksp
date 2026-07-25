import sys
import os
import pickle
import json
import pandas as pd


def resolve_model_path():
    model_path = os.environ.get('XGBOOST_MODEL_PATH')
    if model_path:
        return model_path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(script_dir, '../../xgboost_hotspot_model.pkl'))


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input provided. Pass a JSON string or path to a JSON file."}))
        sys.exit(1)

    arg = sys.argv[1]
    if os.path.isfile(arg):
        with open(arg) as f:
            features = json.load(f)
    else:
        features = json.loads(arg)

    model_path = resolve_model_path()
    if not os.path.isfile(model_path):
        print(json.dumps({"error": f"Model file not found at {model_path}"}))
        sys.exit(1)

    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    df = pd.DataFrame(features)

    expected_cols = list(model.feature_names_in_)
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        print(json.dumps({"error": f"Missing expected columns: {missing}"}))
        sys.exit(1)

    df = df[expected_cols]

    preds = model.predict(df)

    print(json.dumps([round(p, 6) for p in preds.tolist()]))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
