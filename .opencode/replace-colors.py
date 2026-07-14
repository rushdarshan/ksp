import os

REPLACEMENTS = [
    ('#dc2626', 'var(--color-red)'),
    ('#22c55e', 'var(--color-green)'),
    ('#4ade80', 'var(--color-green-alt)'),
    ('#d97706', 'var(--color-amber)'),
    ('#facc15', 'var(--color-amber-alt)'),
    ('#f87171', 'var(--color-red-soft)'),
    ('#6b7280', 'var(--color-gray-500)'),
    ('#94a3b8', 'var(--color-gray-400)'),
    ('#f8fafc', 'var(--color-surface-50)'),
    ('#e2e8f0', 'var(--color-border-200)'),
    # Second batch
    ('#be185d', 'var(--color-pink-brand)'),
    ('#fef2f2', 'var(--color-surface-red)'),
    ('#f0fdf4', 'var(--color-surface-green)'),
    ('#60a5fa', 'var(--color-blue-400)'),
    ('#0d6efd', 'var(--color-blue-500)'),
    ('#e5e7eb', 'var(--color-gray-200)'),
    ('#e0e7ff', 'var(--color-indigo-100)'),
    ('#fecaca', 'var(--color-red-200)'),
    ('#1a3a5c', 'var(--accent)'),
]

total_changed = 0
total_files = 0

for root, dirs, files in os.walk('client/src'):
    for f in files:
        if not (f.endswith('.jsx') or f.endswith('.scss')):
            continue
        fp = os.path.join(root, f)
        # Skip App.scss — it defines the CSS vars themselves
        if fp.endswith('App.scss'):
            continue
        with open(fp, 'r', encoding='utf-8') as fh:
            content = fh.read()

        new_content = content
        changed = False

        for hex_val, var in REPLACEMENTS:
            # In JSX: replace '#hex' or "#hex" or `#hex` (inside template literals)
            # In SCSS: replace hex after : or after , or after ( 
            # But skip if it's part of a CSS var definition
            idx = 0
            while True:
                idx = new_content.find(hex_val, idx)
                if idx == -1:
                    break

                # Check if this is a CSS variable definition (e.g., "--color-red: #dc2626")
                before = new_content[max(0,idx-50):idx]
                if '--' in before and ':' in before:
                    idx += 1
                    continue

                # Check if this is inside a comment
                line_start = new_content.rfind('\n', 0, idx) + 1
                line = new_content[line_start:new_content.find('\n', idx)]
                if line.strip().startswith('//') or line.strip().startswith('/*') or line.strip().startswith('*'):
                    idx += 1
                    continue

                new_content = new_content[:idx] + var + new_content[idx+len(hex_val):]
                idx += len(var)
                changed = True
                total_changed += 1

        if changed:
            total_files += 1
            with open(fp, 'w', encoding='utf-8') as fh:
                fh.write(new_content)

print(f'Files changed: {total_files}')
print(f'Total replacements: {total_changed}')
