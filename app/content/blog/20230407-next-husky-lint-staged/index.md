---
title: 【Next.js】husky + lint-stagedを使ってpre-commit時にlintを実行する
date: "2023-04-07T11:12:03.284Z"
description: "Next.jsがReactのデファクトスタンダードだと信じているのでNext.jsで試してみました"
tags: ["React", "Next.js"]
---

### husky

Git hooksをより使いやすくしてくれるライブラリです。簡単に設定内容をチームで共有することが出来ます。

<a href='https://typicode.github.io/husky/#/' target='_blank'>https://typicode.github.io/husky/#/</a>

### lint-staged

stagedのファイルに対してのみlintを実行してくれるライブラリです。

<a href='https://github.com/okonet/lint-staged' target='_blank'>https://github.com/okonet/lint-staged</a>

### 今回作ったgit repo

<a href='https://github.com/chanfuku/next-husky' target='_blank'>https://github.com/chanfuku/next-husky</a>

では、手順を載せていきます。

### Next.jsのアプリケーションを作成します

まず、`npx create-next-app@latest`でnext.jsのアプリケーションを作成します。質問に対する回答は全部デフォルトの回答を選択すればOKです。

### huskyをinstallします

```bash
npm install husky --save-dev
or
yarn add husky
```

### Git hooksを有効化します

```bash
npx husky install
```

### 自動でGit hooksが有効化するようにpackage.jsonに追記するためのコマンドを実行します

```bash
npm pkg set scripts.prepare="husky install"
```

すると、package.jsonに以下の設定が記載されます。

```json
  "scripts": {
    "prepare": "husky install"
  }
```

### lint-stagedをinstallする

```bash
npm install --save-dev lint-staged 
or
yarn add lint-staged
```

### huskyでpre-commit時にyarn lint-stagedを実行するように設定する

```bash
yarn husky add .husky/pre-commit "yarn lint-staged"
```

すると、`.husky/pre-commit`が生成されます。中身はこんな感じ↓

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

yarn lint-staged
```

### lint-stagedで行うことを定義する

package.jsonに定義します。tsとtsxファイルにlintを実行する設定です。

lintだでなくpretieerも入れて、`"*.{ts,tsx,json,yml}": "yarn format"`を追加してもOKです。

```json
  "lint-staged": {
    "*.{ts,tsx}": "yarn lint"
  },
```

### .lintstagedrc.jsをprojectのrootに作成する

このまま何かコミットしようとすると、下記のエラーが出ます。

```
error - Failed to load env from .env.production.local Error: ENOTDIR: not a directory, ...
```

公式のNext.jsを確認すると、next lintを実行する場合はprojectのrootに.lintstagedrc.jsを作成してね、と記載されているので、その通りすると解決します。

<a href='https://nextjs.org/docs/basic-features/eslint#lint-staged' tareget='_blank'>
https://nextjs.org/docs/basic-features/eslint#lint-staged
</a>

### 試しに何かおかしなものをコミットしてみる

試しに、`<Head>`と書いているあるところを`<Dead>`に変えてコミットしてしまいそうになる場面を想定します（こんなミスはしないと思いますが...)

コミットしてみると、以下の様にエラーを吐いてくれるのでうまく動いてそうです。

```bash
✔ Preparing lint-staged...
❯ Running tasks for staged files...
  ❯ .lintstagedrc.js — 1 file
    ❯ *.{js,jsx,ts,tsx} — 1 file
      ✖ next lint --fix --file pages/index.tsx [FAILED]
↓ Skipped because of errors from tasks. [SKIPPED]
✔ Reverting to original state because of errors...
✔ Cleaning up temporary files...

✖ next lint --fix --file pages/index.tsx:

./pages/index.tsx
16:8  Error: Parsing error: Expected corresponding JSX closing tag for 'Dead'.

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
husky - pre-commit hook exited with code 1 (error)
```

問題なくコミットできる時はこんな感じ↓

```bash
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
✨  Done in 1.14s.
[main 7bbffc2] test
 1 file changed, 1 insertion(+), 1 deletion(-)
```

他にもpush時にテストコードを走らせたりすることも出来るので活用していきたいです。
