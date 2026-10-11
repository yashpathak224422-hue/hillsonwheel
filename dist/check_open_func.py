import glob
import re

with open("assets/js/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

# Find open_ and reveal functions
open_match = re.search(r'function open_\(\)\{.*', app_js, re.DOTALL)
if open_match:
    print(open_match.group(0)[:1000])
