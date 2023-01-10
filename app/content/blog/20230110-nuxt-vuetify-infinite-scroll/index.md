---
title: 【Vuetify】無限スクロールを実装した
date: "2023-01-22T11:12:03.284Z"
description: "Vuetifyのv-virtual-scrollとv-intersectを使って無限スクロールを実装しました"
tags: ["Nuxt", "Vue", "Vuetify", "SSR", "Express"]
---


業務でVuetifyのv-virtual-scrollとv-intersectを使って無限スクロールを実装したので備忘録として、簡易版を再度実装しました。

スクロールの一番下に辿り着くと次のページの分をAPIでfetchして表示するという、よくある無限スクロールです。

APIをfetchしている間はローディングアイコンが表示されます。

ApiはNuxt.js(SSR) + express.jsで簡易的に作りました。vueは2系です。

こういうやつです↓残念ながら動画の埋め込み方が分からなかったのでただの画像です。

![img1](./img1.png)

## v-virtual-scroll と v-intersect が何をしているのか

v-virtual-scrollは、スクロールのビューポートを埋めるために必要なものだけをレンダリングすることで、パフォーマンスを損なうことなく無制限のアイテムを表示することが出来るコンポーネントです。

v-intersectは、対象の要素がビューポート内に表示されたタイミングを検知してくれるコンポーネントです。

v-virtual-scrollは、APIで大量のデータを取得し、リストでレンダリングする場合に活躍しそうです。

今回はAPIで1ページあたり20件ずつ取得&レンダリングする仕組みで実装したので、v-virtual-scrollがなくても問題なさそうですが、使った方がbetterだろうということでv-virtual-scrollも使いました。

## git repo
※とにかく動けばOKというノリで作ったので、typescript使ってるのになぜ型定義してないんだ、等ツッコミどころが多々あります。

<a href="https://github.com/chanfuku/docker_nuxt_ssr02/blob/main/pages/infinite-scroll.vue" target="_blank">
https://github.com/chanfuku/docker_nuxt_ssr02/blob/main/pages/infinite-scroll.vue
</a>

## ソースコード

<details>
<summary>詳細を見る</summary>

```js
<template>
  <div>
    <v-virtual-scroll class="item-wrapper" :item-height="50" :items="items">
      <template v-slot:default="{ item, index }">
        <span v-if="index === items.length - 1" v-intersect.once="onIntersect"></span>
        <v-list-item>
          {{ item.name }}
        </v-list-item>
      </template>
    </v-virtual-scroll>
    <v-list-item v-if="isLoading" class="loading">
      <v-progress-circular indeterminate width="3" />
    </v-list-item>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return { 
      page: 1,
      isLoading: false,
    }
  },
  computed: {
    items () {
      return this.$store.state.items
    },
  },
  async fetch(): Promise<void> {
    await this.$store.dispatch('fetchPaginationItems', { page: this.page })
  },
  methods: {
    async onIntersect() {
      try {
        this.page = this.page + 1;
        this.isLoading = true;
        // ローディングアイコンが目立つ様にあえて0.5秒待たせる
        await new Promise(resolved => setTimeout(resolved, 500));
        await this.$store.dispatch('fetchPaginationItems', { page: this.page })
      } catch (e) {
        console.error(e)
      } finally {
        this.isLoading = false;
      }
    }
  }
})
</script>

<style scoped>
.item-wrapper {
  height: calc(100vh - 30px);
  width: 200px;
  margin: 0 auto;
  overflow-y: scroll;
}
.item {
  height: 50px;
}
.loading {
  display: flex;
  justify-content: center;
  bottom: 45px;
}
</style>
```
</details>
