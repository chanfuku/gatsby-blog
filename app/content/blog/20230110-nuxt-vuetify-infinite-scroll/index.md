---
title: 【Vuetify】無限スクロールを実装した
date: "2023-01-22T11:12:03.284Z"
description: "Vuetifyのv-virtual-scrollとv-intersectを使って無限スクロールを実装しました"
tags: ["Nuxt", "Vue", "Vuetify", "SSR", "Express"]
---

業務でVuetifyのv-virtual-scrollとv-intersectを使って無限スクロールを実装したので備忘録として残します。

スクロールの一番下に辿り着くと次のページの分をAPIでfetchして表示するという、よくある無限スクロールです。

APIをfetchしている間はローディングアイコンが表示されます。

ApiはNuxt.js(SSR) + express.jsで簡易的に作りました。vueは2系です。

## demo
![img1](./img1.gif)

## 今回の成果物
※とにかく動けばOKというノリで作ったので、typescript使ってるのになぜ型定義してないんだ、等ツッコミどころが多々あります。

<a href="https://github.com/chanfuku/docker_nuxt_ssr02/blob/main/pages/infinite-scroll.vue" target="_blank">
https://github.com/chanfuku/docker_nuxt_ssr02/blob/main/pages/infinite-scroll.vue
</a>
