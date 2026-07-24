import os, re

findings = []

# --- Scan functions/ ---
for root, dirs, files in os.walk('functions'):
    for f in files:
        if not f.endswith('.js'):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
            content = fh.read()
        lines = content.split('\n')
        
        # Check for empty/trivial functions (just boilerplate)
        if len(lines) < 10 and 'express' in content and 'app.' in content:
            findings.append(('delete', f'{f} is boilerplate with <10 lines', 'merge into parent or remove', fp))

        # Check for large switch-case / if-else chains
        iface_count = content.count('if (')
        if iface_count > 20:
            findings.append(('shrink', f'{iface_count} if-statements', 'use lookup object or early returns', fp))

# --- Scan static function files that are just mocks ---
mock_only = ['daily_brief', 'beat_optimizer', 'transit_detection', 'exceedance_curve', 'solvability_index', 'accused_at_large']
for func in mock_only:
    fp = f'functions/{func}/index.js'
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
            content = fh.read()
        if 'seededRand' in content or 'Math.random' in content or 'synthetic' in content:
            findings.append(('yagni', f'{func} is entirely synthetic mock data', 'merge into shared mock utility or remove', fp))

# --- Scan for duplicated Express boilerplate ---
express_count = 0
for root, dirs, files in os.walk('functions'):
    for f in files:
        if f == 'index.js':
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
            if 'express.Router' in content or 'express()' in content:
                express_count += 1

if express_count > 20:
    findings.append(('shrink', f'{express_count} Express apps (one per function)', 'use a single router or merge small functions', 'functions/*/'))

# --- Scan for try/catch that just re-throws ---
for root, dirs, files in os.walk('functions'):
    for f in files:
        if f.endswith('.js'):
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
            catches = re.findall(r'catch\s*\((\w+)\)\s*\{[^}]*\}', content, re.DOTALL)
            for c in catches:
                if 'console.error' in c and len(c) < 50:
                    findings.append(('shrink', f'catch that only console.errors in {f}', 'let it crash or use global handler', fp))

# --- Scan for package.json with no real deps ---
for root, dirs, files in os.walk('functions'):
    if 'package.json' in files:
        fp = os.path.join(root, 'package.json')
        with open(fp, 'r', encoding='utf-8') as fh:
            content = fh.read()
        if '"zcatalyst-sdk-node"' not in content and '"express"' not in content:
            findings.append(('delete', f'empty package.json in {os.path.basename(root)}', 'remove, no real dependencies', fp))

# Print findings sorted by tag
tag_order = {'delete': 0, 'yagni': 1, 'stdlib': 2, 'native': 3, 'shrink': 4}
findings.sort(key=lambda x: (tag_order.get(x[0], 5), x[1]))

print('PONYTAIL AUDIT')
print('='*80)
for tag, what, replacement, path in findings:
    print(f'{tag:8s} {what}')
    print(f'          -> {replacement}')
    print(f'          [{path}]')
    print()

print(f'Total: {len(findings)} findings')
