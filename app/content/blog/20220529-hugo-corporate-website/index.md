---
title: 【Hugo】コーポレートサイトをNetlifyで公開した
date: "2022-05-29T11:12:03.284Z"
description: "【Hugo】コーポレートサイトをNetlifyで公開した"
---

Hugoを使ってコーポーレートサイト実装して欲しいとの依頼を頂いたので、Netlifyで公開するところまでやってみました。

## Hugo
<a href="https://gohugo.io/" target="_blank">`https://gohugo.io/`</a>

Hugoは比較的簡単に静的サイトを作成出来るフレームワークの一種です。Static Site Generator(SSG)と呼ばれています。

SSGは他にはNext.js, Nuxt.js, Gatsby.js等があります。ちなみに、このブログはGatsby.js製です。

## theme
テーマ(テンプレート)は↓を使いました。

<a href="https://themes.gohugo.io/themes/doks/" target="_blank">`https://themes.gohugo.io/themes/doks/`</a>

## 完成したサイト(デモ版)
<a href="https://serene-gecko-c4716b.netlify.app/" target="_blank">`https://serene-gecko-c4716b.netlify.app/`</a>
![Image](./img1.png)


問い合わせページはNetlifyのformを使いました。Netlifyの管理画面で問い合わせ内容を確認したり、CSVダウンロードも出来ます。
<a href="https://docs.netlify.com/forms/setup/" target="_blank">`https://docs.netlify.com/forms/setup/`</a>

ブログページのページネーションは、今回使ったテンプレートにデフォルトで組み込まれていたページネーションの機能を使いました。

## HugoのTutorial動画
<a href="https://www.youtube.com/watch?v=qtIqKaDlqXo" target="_blank">`https://www.youtube.com/watch?v=qtIqKaDlqXo`</a>

2017年とかの動画なので、手順通り進めても所々動かないのが辛いですが、動画のコメント欄に解決方法が載っています。

## Netlify
静的サイトをホスティングしてくれるサービスです。公開するリポジトリを設定すると、そのリポジトリのmainブランチにmergeしたり、pushしたりすると自動でNetlifyがdeployしてくれます。有料プランにすると独自ドメインを使えるみたいです。
<a href="https://www.netlify.com/" target="_blank">`https://www.netlify.com/`</a>

## Docker
公式のDocker Imageが提供されていないので、Docker環境を構築するなら自前で頑張る必要があります...。
Dockerは諦めて、公式サイトの手順通りMacのbrewを使ってローカル環境を構築しました。
