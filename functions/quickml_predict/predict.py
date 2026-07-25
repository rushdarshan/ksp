import sys
import os
import pickle
import json
import pandas as pd

try:
    # Read incoming JSON features from file path or inline JSON
    arg = sys.argv[1]
    if os.path.isfile(arg):
        with open(arg) as f:
            features = json.load(f)
    else:
        features = json.loads(arg)
    
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
