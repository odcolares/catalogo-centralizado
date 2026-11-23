with open('src/app.ts', 'rb') as f:
    data = f.read()
idx = data.find(b'data-dt-delete=')
print(data[idx:idx+80])