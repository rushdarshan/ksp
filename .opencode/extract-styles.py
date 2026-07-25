import os, re, json

targets = [
    'client/src/Components/FirDetails/DetailedFir.jsx',
    'client/src/Components/FirDetails/CrimeGenomePanel.jsx',
    'client/src/Components/FirDetails/Firdetails.jsx',
]

for fp in targets:
    print(f'Processing {os.path.basename(fp)}...')
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Find all style={{...}} with simple string values only
    def replace_style(m):
        inner = m.group(1)
        # Check if any value is dynamic
        vals = re.findall(r':\s*([^,}]+)', inner)
        is_dynamic = any('{' in v or '=>' in v or '||' in v or '?' in v or '()' in v or v.strip().startswith('v.') or '&&' in v for v in vals)
        if is_dynamic:
            return m.group(0)  # Keep dynamic styles inline
        # Generate CSS class name from hash of the style content
        cls = 's' + str(hash(inner) & 0xFFFFFF)
        return f'className="{cls}"'
    
    new_content = re.sub(r'style=\{?\{([^}]+)\}\}', replace_style, content)
    
    if new_content != content:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'  Updated {os.path.basename(fp)}')
    else:
        print(f'  No changes')
