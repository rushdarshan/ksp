f=open('client/src/Components/Shell/Sidebar.jsx','r',encoding='utf-8')
c=f.read()
f.close()

c = c.replace("if (to === 'face-analytics') return 'faceAnalytics';\n", '')
c = c.replace("if (to === 'text-analytics') return 'textAnalytics';\n", '')
c = c.replace("if (to === 'object-recognition') return 'objectRecognition';\n", '')

f=open('client/src/Components/Shell/Sidebar.jsx','w',encoding='utf-8')
f.write(c)
f.close()
print('Done')
