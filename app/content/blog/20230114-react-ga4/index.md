---
title: 【React】react-ga4を使ったら簡単にgoogle analyticsを導入できた
date: "2023-01-14T11:12:03.284Z"
description: "Next.jsのアプリケーションにgoogle analyticsを導入したい"
tags: ["React", "Next.js"]
---

### UA と GA4

今回はNext.jsのアプリケーションにGA4を導入する際の手順です。

ちなみに、google analytics には2種類あるらしく、

従来のgoogle analyticsはUniversal Analytics Property (UA)と呼ばれ、最新バージョンはGoogle Analytics 4 Property(GA4)と呼ばれています。

### できるだけ早くGoogle Analytics 4に切り替えることを強く推奨します

とGoogleが言っています(下記参照)。2023年7月1日をもって、UAはサポート終了するそうです。

<a href="https://support.google.com/analytics/answer/11583528" target="_blank">
https://support.google.com/analytics/answer/11583528
</a>

* GA4公式docはこちら

<a href="https://support.google.com/analytics/answer/10089681?hl=ja">
https://support.google.com/analytics/answer/10089681?hl=ja
</a>

### React Google Analytics 4

<a href="https://github.com/PriceRunner/react-ga4" target="_blank">
https://github.com/PriceRunner/react-ga4
</a>

### 導入手順

1. インストールします。
```bash
npm i react-ga4
or
yarn add react-ga4
```

2. _app.tsxに初期化処理を書く

```js
import ReactGA from "react-ga4";

export default function App({ Component, pageProps }: AppProps) {
  ReactGA.initialize("your GA measurement id");
  .
  .

```

3. pageviewを計測したい場合

```js
import ReactGA from "react-ga4";

export default function Home() {
  ReactGA.send({ hitType: "pageview", page: "/my-path" });
  .
  .
```

4. eventを計測したい場合
例えば何かのボタンをクリックした際のeventを計測したい場合は、こんな感じ

```js
import ReactGA from "react-ga4";

const MainContent = () => {
  const clickBtn = () => {
    ReactGA.event({
      category: "click",
      action: "ボタンをクリックした",
    });
  }
  return (
    <div
      onClick={clickBtn}
    />
  )
}
```

これだけなのでとても簡単に実装出来ました。

因みに、`react-ga4`を使わずに自前で実装する場合は、

* htmlの`<head>`要素の直後にGA用のscriptタグを書く
* useEffectの中でwindow.gtag('config', ....)というコードを書く

が必要らしいので、`react-ga4`を使った方が簡単に実装できそうです。
