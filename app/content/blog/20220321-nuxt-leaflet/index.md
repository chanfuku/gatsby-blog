---
title: nuxt-leafletで写真に目印を付ける
date: "2022-03-21T22:12:03.284Z"
description: "nuxt-leafletで写真に目印を付ける"
tags: ["Nuxt", "Typescript", "leaflet", "Vue"]
---

Leaflet.jsというJS製の地図描画ライブラリがあります。

今回はこのLeafletのvue版ライブラリを使って、地図ではなく、写真上に線や四角形を描く、ということをやりました。業務でLeafletを使ったのですが中々大変だったのでホットなうちに備忘録を、ということで遊びも兼ねて

「ランダムで表示される猫の写真にお絵かきするツール」を作ってみました。

実用性は0ですが、ランダムで表示されるにゃんこ達には癒やされること間違いなしです。

### Demo(pcのみ)
<a href="https://nuxt-spa-ebato.herokuapp.com/leaflet" target="_blank">`https://nuxt-spa-ebato.herokuapp.com/leaflet`</a>

### リポジトリ
<a href="https://github.com/chanfuku/docker_nuxt_spa" target="_blank">`https://github.com/chanfuku/docker_nuxt_spa`</a>

### 学んだこと
* leafletはSSRでは動作しないので、SPAモードで開発した方が良い。SSRで動かすには色々とハマりポイントがある。
* vueライブラリも存在するが、pure jsで作られている大本のLeaflet.jsと比較すると機能的に不足している部分も多い。そこは自前でなんとかするしかない。例えば、図を描画するために必要なDrawToolbarを追加する部分は、pluginはあるがカスタマイズ出来ない等不便なことが多いので、自分でLeafletのmapObjectを操作する必要がある。また、そのDrawToolbarで描いた図の座標等の情報を取得するためには、イベントリスナーを登録する必要がある。など辛い部分が多い。
* leafletのキャンバス枠サイズを表すboundsという概念がとても重要。boundsが正しくないと図が表示されなかったり、ずれて表示されてしまったりする。
* 画像上に図を描画し終えた後、画面サイズの異なる環境で表示すると位置がずれる問題は、画像の縦横pxをboundsに設定し、leafletのmapObjectをfitBounds(bounds)すればOK。
* 一般的にはxは横軸yは縦軸を表すが、leafletはlat(緯度)lng(経度)を用いて座標を特定する。左下が(0, 0)で(lat, lng)で表現するが、lat=y、lng=x、つまりx, yが逆なので要注意。
* Leaflet公式ドキュメント
<a href="https://vue2-leaflet.netlify.app/" target="_blank">`https://vue2-leaflet.netlify.app/`</a>
<a href="https://leafletjs.com/SlavaUkraini/" target="_blank">`https://leafletjs.com/SlavaUkraini/`</a>

