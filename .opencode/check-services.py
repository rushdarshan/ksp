import os
checks = [
    ('Face Analytics', 'face'),
    ('Object Recognition', 'objectrecognition'),
    ('Text Analytics', 'textanalytics'),
    ('OCR', 'ocr'),
    ('Auto ML', 'automl'),
    ('Logs', 'logger'),
    ('APM', 'apm'),
    ('Alerts', 'applicationalert'),
]
for svc, kw in checks:
    found = False
    for root, dirs, files in os.walk('functions'):
        for f in files:
            if f.endswith('.js'):
                fp = os.path.join(root, f)
                with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    content = fh.read().lower()
                if kw in content:
                    found = True
                    break
        if found:
            break
    status = 'USED' if found else 'NOT USED'
    print(f'{svc}: {status}')
