---
title: 【OpenApi】 ymlを使って開発効率 & 品質アップ
date: "2022-04-10T22:12:03.284Z"
description: "【OpenApi】 ymlを使って開発効率 & 品質アップ"
---

業務の備忘録。いくつかのライブラリを使うと、apiを定義したymlファイルをベースに、

* Typescriptの型を自動生成
* APIのclientコードを自動生成
* APIのrouting定義の簡略化

が出来るようになり、これによって、

* 今まで手動で実装していた部分が自動化されるので開発効率アップ
* 型に守られたバグの少ないコードを実装出来るようになる

というメリットがあります。

では、どんなライブラリを使ったのかというと、

### フロント
- **openapitools/openapi-generator-cli**

↑APIクライアントを生成するために使ったライブラリです。JVMが必要なのが少し手間ですが、以下のDockerfileの様にnodeのimageにopenjdk8をインストールすればOKです。

```bash
FROM node:16.13-alpine

RUN apk update && apk add --no-cache openjdk8
```

自動生成したAPIクライアントを使ってAPIを実行する処理の例↓

```js
public async register (petNew: ApiClient.PetNew) {
  await apiClientWrapper().createPet(petNew)
}
```

自動生成したApiClientの型を利用できますし、また、ApiClientが保持する関数(以下の例ではcreatePet)を実行すると、ApiClientが内部で$axiosを使ってHttp Requestを投げてくれます。

### API

- **express-openapi**

express-openapiは前々回投稿したものと同じです。このライブラリにymlを読み込ませると、フォルダ名・ファイル名・関数名の組み合わせでroutingを表現することが出来るので、routing定義を書かなくて済むようになります。

- **openapi-typescript-code-generator**

openapi-typescript-code-generatorはapi.ymlからtypescriptの型を生成してくれるので、RequestやResponseの型を縛ることができます。

### 成果物
<a href="https://github.com/chanfuku/nuxt-openapi" target="_blank">https://github.com/chanfuku/nuxt-openapi</a>

README通りにDockerで環境を起動すれば、http://localhostでCRUDの一連の流れが動作確認できる、はずです。

### 各種ライブラリ詳細
```
## front
* nuxt:2.15
* typescript
* openapitools/openapi-generator-cli
* vuex-module-decorators

## api
* ts-node:10.4
* typescript
* typeorm:0.2
* express:4.17
* express-openapi
* openapi-typescript-code-generator

## middleware
* nginx:1.21.4
* mysql:5.7.1
```

### 環境構築手順
```bash
git clone https://github.com/chanfuku/nuxt-openapi.git
cd nuxt-openapi
cp .env.example .env
cp ./front/.env.local ./front/.env
docker-compose up
.
.
.
it will take about 5 min to build...

please visit http://localhost
```

### 感想
openapiの仕様に沿ってymlを書くだけではApiClientコードの自動生成がコケることが結構あるので、この書き方はOK、この書き方はNGと、細かく検証する作業をしていた時は、このライブラリは採用しない方が良いのではと思いました。

しかしながら、開発中あるあるですが、フロントとAPIのインターフェースが異なることで発生する不具合を未然に防げますし、これまでエンジニアが作成していたソースコードの一部が自動生成されることで開発効率が大幅アップしたので、終わってみれば採用して良かったと思います。余談ですが、OpenAPIの仕様に沿ってymlを作成し、その後APIとfrontの実装を進めることをスキーマ駆動開発と言うみたいです。
