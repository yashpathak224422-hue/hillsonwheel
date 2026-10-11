import glob
import re

for fpath in ["assets/css/base.css", "assets/css/layout.css", "Hillsonwheels — The World of Uttarakhand.html"]:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    print(f"File {fpath}:")
    for m in re.finditer(r'#app\s*\{[^}]*\}', content):
        print("  ", m.group(0))
    for m in re.finditer(r'(?:html|body)[^{]*\{[^}]*\}', content):
        print("  ", m.group(0))
