---
title: 【Python】全てのテキストファイル内のある文字列を置換する
date: "2022-06-18T11:12:03.284Z"
description: "このブログの記事は全てMarkdownのファイルで管理しているのですが...."
tags: ["Gatsby", "React", "Python"]
---

このブログの記事は全てMarkdownのファイルで管理しているのですが、

先日全てのMarkdownファイル内の外部ページへのリンクタグをbackquoteで囲みたい(理由は割愛します...)ということがあり、

以前からPythonがさくっと書けるエンジニアに憧れを抱いていた私にとっては丁度良い難易度のタスクなのでは、

ということでPythonでチャレンジしてみました。

## やりたいこと

↓の様なフォルダ構成になっていて

```
└── blog
    ├── 20220509-kubernetes-basics
    │   └── index.md
    ├── 20220529-hugo-corporate-website
    │   └── index.md
    ├── 20220605-vuex-module-decorator-test
    │   └── index.md
    ├── 20220618-gatsby-external-link
    │   └── index.md

```

全てのindex.md内の↓の様な外部リンクタグを

```html
<a href="aaa.com" target="_blank">リンクです</a>
```

↓の`リンクです`の様に「`」で囲みたい
```html
<a href="aaa.com" target="_blank">`リンクです`</a>
```

## 作ったプログラム

```python
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
```

* 実際のファイルはこちら
<a href="https://github.com/chanfuku/gatsby-blog/blob/main/bin/add-back-quote-to-link.py" target="_blank">`https://github.com/chanfuku/gatsby-blog/blob/main/bin/add-back-quote-to-link.py`</a>

* 実行 ※python3系が必要です
```
$ cd gatsby-blog/bin
$ python3 add-back-quote-to-link.py
```

## 解説

1. `folders = os.listdir(<フォルダのpath>)`でフォルダ一覧を取得する
1. `for folder in folders` で フォルダ一覧をループ処理する
1. `file_path = Path(blog_path + folder + "/index.md")`で対象ファイルのpathを取得する
1. `content = file_path.read_text()` で対象ファイルのテキストを取得する 
1. テキストを置換する
```
content = content.replace('_blank">', '_blank">`')
content = content.replace('</a>', '`</a>')
```
6. 置換後のテキストを`file_path.write_text(content)`で対象ファイルに書き込む

これからはPython力を上げるためにも、

程よい難易度の単純作業系タスクがあればまたPythonでチャレンジしたいと思います。
