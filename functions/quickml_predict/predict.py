import sys
import pickle
import json
import pandas as pd

try:
    # Read incoming JSON features from stdin or args
    features_json = sys.argv[1]
    features = json.loads(features_json)
    
    # Load model
    # The path will be relative to the function directory
    with open('../../xgboost_hotspot_model.pkl', 'rb') as f:
        model = pickle.load(f)
        
    # Prepare DataFrame matching the expected columns
    df = pd.DataFrame(features)
    
    # Run prediction
    preds = model.predict(df)
    
    print(json.dumps(preds.tolist()))
except Exception as e:
    print(json.dumps({"error": str(e)}))
