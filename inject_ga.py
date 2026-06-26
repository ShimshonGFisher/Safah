import glob

ga_script = """
  <!-- AMIRA TELEMETRY: Google Analytics Radar -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_TRACKING_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    // The eye in the sky. Replace G-YOUR_TRACKING_ID when ready.
    gtag('config', 'G-YOUR_TRACKING_ID');
  </script>
"""

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'AMIRA TELEMETRY' not in content:
        content = content.replace('</head>', ga_script + '</head>')
        with open(file, 'w') as f:
            f.write(content)

print("Telemetry injected into all files.")
