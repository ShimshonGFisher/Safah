import glob

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'G-YOUR_TRACKING_ID' in content:
        content = content.replace('G-YOUR_TRACKING_ID', 'G-9PE6C1NP7N')
        with open(file, 'w') as f:
            f.write(content)

print("Tracking ID updated.")
