import os
files = [
    'client/src/Pages/Homepage/landingpage.css',
    'client/src/Pages/Homepage/Components/Hero.jsx',
    'client/src/Pages/Homepage/Components/Navigation.jsx',
    'client/src/Pages/Homepage/Components/Footer.jsx',
    'client/src/Pages/Homepage/Landingpage.jsx',
]
for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    lines = content.split('\n')
    print(f'=== {fp.split(chr(47))[-1]} ({len(lines)} lines) ===')
    for i, line in enumerate(lines, 1):
        low = line.lower()
        if any(k in low for k in ['transition', 'animation', '@keyframes', 'transform', 'ease', 'scale(', 'translate', 'opacity', 'filter:', '@media']):
            print(f'  {i}: {line.strip()[:120]}')
    print()
