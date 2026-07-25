import re
f=open('client/src/Components/Shell/Sidebar.jsx','r',encoding='utf-8')
c=f.read()
f.close()

# Find sidebar link entries
pattern = r"to:\s*'([^']+)'[^,]+,\s*label:\s*'([^']+)'"
matches = re.findall(pattern, c)
print('Sidebar links:')
for to, label in matches:
    print(f'  {to:30s} -> {label}')
