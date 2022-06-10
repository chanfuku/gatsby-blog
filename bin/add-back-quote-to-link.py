import os
import re
from pathlib import Path

print("start")

blog_path = "../app/content/blog/"
folders = os.listdir(blog_path)

for folder in folders:
    file_path = Path(blog_path + folder + "/index.md")
    # 読み込み
    content = file_path.read_text()
    content = content.replace('_blank">', '_blank">`')
    content = content.replace('</a>', '`</a>')
    # 書き込み
    file_path.write_text(content)

print("end")


