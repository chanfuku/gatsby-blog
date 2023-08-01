---
title: 【Firebase】dotenv-webpackでを使って環境ごとにデプロイする
date: "2023-07-30T11:12:03.284Z"
description: "webpackで環境ごとにbuild、そしてfirebaseにdeployしたい時のtipsです"
tags: ["Firebase", "webpack"]
---

Firebaseでホスティングしているアプリケーションを、localやstgなどの環境ごとに環境変数を差し替えてデプロイしたい時の対応方法です。

使用したライブラリは`dotenv-webpack`です。

### dotenv-webpack
<a href="https://www.npmjs.com/package/dotenv-webpack" target="blank_">
https://www.npmjs.com/package/dotenv-webpack
</a>

### インストール

```bash
npm i -g firebase-tools
npm i dotenv-webpack
```

### 環境ごとに.env.xxxを用意する

stg用の.envは`.env.stg`、local用は`.env.local`といった様に、環境ごとに.envを作成します。

### package.jsonにscriptを定義する

環境ごとにbuild & deployするコマンドを定義します。

例えば`npm run deploy:stg`を実行すると、`NODE_ENV=stg`を設定した上で、webpack.config.jsをベースにbuildを行い、stg環境にデプロイされます。

local, stg, prod全部を同時にデプロイしたい時は`npm run deploy:all`を実行します。

firebaseにログインしていない場合は`firebase login`でログイン後に実行する必要があります。

```json
  "scripts": {
    "clean": "rimraf ./public/*",
    "build": "npm run clean && webpack --config webpack.config.js",
    "local": "NODE_ENV=local npm run build && firebase serve",
    "deploy:local": "NODE_ENV=local npm run build && firebase use <your-app-id-for-local> && firebase deploy",
    "deploy:stg": "NODE_ENV=stg npm run build && firebase use <your-app-id-for-stg> && firebase deploy",
    "deploy:prod": "NODE_ENV=prod npm run build && firebase use <your-app-id-for-prod> && firebase deploy",
    "deploy:all": "npm run deploy:local && npm run deploy:stg && npm run deploy:prod"
  }
```

### webpack.config.jsを修正する

下記のように、環境ごとに読み込む.envを切り替えてビルドするようにします。

```js
const Dotenv = require('dotenv-webpack');
// NODE_ENVを取得する
const enviroment = process.env.NODE_ENV;

module.exports = {
.
.
.
  plugins: [
    new Dotenv({
      // 例: .env.stg
      path: `./.env.${enviroment}`,
    }),
  ],
```

以上です

