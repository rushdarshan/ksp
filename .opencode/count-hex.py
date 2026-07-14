import os, re
from collections import Counter

hex_counts = Counter()
ALREADY_REPLACED = {'var(--color-red)','var(--color-green)','var(--color-green-alt)','var(--color-amber)','var(--color-amber-alt)','var(--color-red-soft)','var(--color-gray-500)','var(--color-gray-400)','var(--color-surface-50)','var(--color-border-200)'}

for root, dirs, files in os.walk('client/src'):
    for f in files:
        if not (f.endswith('.jsx') or f.endswith('.scss') or f.endswith('.css')):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'r', encoding='utf-8') as fh:
            for line in fh:
                # Skip lines that are CSS var definitions or comments
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*') or stripped.startswith('--'):
                    continue
                # Find all hex colors
                for m in re.finditer(r'#[0-9a-fA-F]{6}\b', line):
                    # Skip if this is a CSS var definition
                    if '--' in line[:m.start()] and ':' in line[:m.start()]:
                        continue
                    hex_counts[m.group().lower()] += 1

print('Most common remaining hex values:')
for hex_val, count in hex_counts.most_common(30):
    if count >= 5:
        print(f"  '{hex_val}': {count}")
