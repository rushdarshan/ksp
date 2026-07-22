import os

# Map of var(--color-X)YY -> original hex color
FIXES = {
    'var(--color-green-alt)30': '#4ade8030',
    'var(--color-green-alt)20': '#4ade8020',
    'var(--color-green-alt)08': '#4ade8008',
    'var(--color-green-alt)60': '#4ade8060',
    'var(--color-green-alt)40': '#4ade8040',
    'var(--color-green-alt)10': '#4ade8010',
    'var(--color-red-soft)30': '#f8717130',
    'var(--color-red-soft)20': '#f8717120',
    'var(--color-red-soft)08': '#f8717108',
    'var(--color-red-soft)40': '#f8717140',
    'var(--color-red-soft)10': '#f8717110',
    'var(--accent)08': '#1a3a5c08',
    'var(--color-surface-red)08': '#fef2f208',
    'var(--color-surface-green)08': '#f0fdf408',
}

total_files = 0
total_fixes = 0

for root, dirs, files in os.walk('client/src'):
    for f in files:
        if not (f.endswith('.jsx') or f.endswith('.scss') or f.endswith('.css')):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
            content = fh.read()
        
        new_content = content
        changed = False
        for old, new in FIXES.items():
            if old in new_content:
                new_content = new_content.replace(old, new)
                changed = True
                total_fixes += 1
        
        if changed:
            total_files += 1
            with open(fp, 'w', encoding='utf-8') as fh:
                fh.write(new_content)

print(f'Files fixed: {total_files}')
print(f'Alpha values reverted: {total_fixes}')
