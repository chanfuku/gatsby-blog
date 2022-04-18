---
title: 【React】Next.jsの公式チュートリアルをやって学んだこと
date: "2021-11-14T22:12:03.284Z"
description: "【React】Next.jsの公式チュートリアルをやって学んだこと"
---

Reactの公式チュートリアルはさらっと読んだ上で、Next.js(Reactのフレームワーク）のチュートリアルをやってみました。
成果物↓

### github

https://github.com/chanfuku/docker-nextjs-blog

上記リポジトリでNext.jsのdocker環境も構築しました。以前構築した、nuxtのdocker環境がほぼそのまま使えました。変更点はyarnをnpmに変えたくらいです。

### 学んだことメモ
* next.jsはデフォルトでページ描画がpre-renderingになるので、javascript無効にしても表示できるが、pure React.jsはpre-renderingではないので表示できない。
* Static Generation vs Server-side Renderingだと、Static Generationが推奨されている。CDNで配信するならその方が早いという理由。なので、まずStatic Generationの採用を選択し、要件次第でServer side Renderingを選択する。頻繁に変わるページはStatic Generationには向いていない。最新のデータを表示する様なページはServerSideRenderingにする。
* ImageコンポーネントがデフォルトでNext.jsに含まれている。Nuxtだとプラグインを追加する必要があるのでありがたい。
* CSSModulesを使うとcssのスコープをコンポーネントレベルに抑えることができる。
* globalなcssはpages/_app.js以外では定義できない。
* getStaticsPropsでページに出力するデータを取得する。pagesファイル以外では使えない。server-sideで実行される。
* ユーザのダッシュボード等のページ内容は頻繁に変わるのでpre-renderingではなく、fetch data on the client-side。
* client-sideでデータ取得が必要な場合はReact hook (SWR)を推奨。
* markdwonをhtmlに変換してくれるremarkというライブラリがある。
* githubがtokenを指定しないとpushできないようになっていた。つい1週間前位まではいけたのに。
* ページのHTMLを部分をReactではjavascriptの関数の中に記述するので、vueのtemplate構文よりも柔軟性があり、templateがカオスになりがち問題を回避できそうな気がする。
