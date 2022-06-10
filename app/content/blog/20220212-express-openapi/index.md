---
title: express-openapiでAPIを実装してみた
date: "2022-02-12T22:12:03.284Z"
description: "express-openapiでAPIを実装してみた"
---

成果物↓

### github
<a href="https://github.com/chanfuku/docker-typeorm-express/tree/main/node/examples/openapi-express">https://github.com/chanfuku/docker-typeorm-express/tree/main/node/examples/openapi-express</a>

### 動作確認手順
```bash
$git clone git@github.com:chanfuku/docker-typeorm-express.git
$cd docker-typeorm-express
$docker-compose up -d
$docker-compose exec node sh
$cd examples/openapi-express
$npm install
$npm run start
> start
> ts-node src/index.ts

express-openapi: /pets.get has already been defined as /pets.GET. Ignoring the 2nd definition...
express-openapi: /pets.post has already been defined as /pets.POST. Ignoring the 2nd definition...
Express server has started on port 3000. please check http://localhost:3000/v1/pets
```

http://locahost:3000/v1/petsを表示し、こんなレスポンスが返ればOK

```json
[{"id":1,"name":"aaa"},{"id":2,"name":"bbb"}]
```

### 解説
<a href="https://github.com/kogosoftwarellc/open-api/tree/master/packages/express-openapi" target="_blank">express-openapi</a>というライブラリがありまして、こいつを使うとopenapiやswaggerのフォーマットで記載されたyamlを基に、expressで実装したAPIのルーティングを行ってくれます。更に、yamlの定義に従ってvalidationまでしてくれます。つまり、自前でroutingやvalidationを実装する必要がなくなるのです。openapiのyamlをAPIの仕様書として利用できる上に、コード量も減らすことができるという一石二鳥の旨味がある訳です。

### 導入手順
まず、以下の様にexpress-openapiをインストールします。

```bash
npm install express-openapi
```

次に、yamlを用意します。今回はswaggerの公式が用意している<a href="https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.0/petstore.yaml" target="_blank">こちら</a>のyamlファイルをコピーして使いました。

上記のファイルを私は<a href="https://github.com/chanfuku/docker-typeorm-express/tree/main/node/examples/openapi-express/src/v1">こちら</a>に置きました。v1というフォルダに置きましたが、v2でもv3でもOKです。

ポイントは、yamlの中で定義しているserversの部分です。以下の様に各環境のurlを定義します。

```yml
servers:
  - url: http://petstore.swagger.io/v1
  - url: http://localhost:3000/v1
    description: for local development
```

次にindex.tsを作ります。ポイントは、以下のapiDoc、paths、dependenciesの部分です。それぞれ、yamlファイルの場所とpath handlerのファイルとpath handlerが依存するモジュールを指定してします。

```js
 // src/index.ts
.
.
.

 initialize({
    app,
    apiDoc: 'src/v1/api-doc.yml', // ymlファイルの場所
    paths: 'src/paths', // path handlerの場所
    dependencies: {
      petService,
    },
    routesGlob: '**/*.{ts,js}',
    routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
    errorMiddleware: function(err, req, res, next) { // only handles errors for /v3/*
        res.status(err.status).json(err)
        next()
    }
  });
```

次にpathハンドラーを作成します。作成したファイルは<a href="https://github.com/chanfuku/docker-typeorm-express/blob/main/node/examples/openapi-express/src/paths/pets.ts" target="_blank">こちら</a>

以下の様にsrc/paths/pets.ts、GETとPOSTを定義しました。petServiceへの依存を注入しています。※POSTが一律200を返したりと、処理自体は適当なので無視してOKです。

```js
// src/paths.ts
export default (petService) => {

  const GET = (req, res, next) => {
    res.status(200).json(petService.getPets());
  }

  const POST = (req, res, next) => {
    res.status(200);
  }

  return {
    GET,
    POST,
  }
}
```

最後にsrc/servicesにserviceクラスを作成します。これはあってもなくてもexpress-openapiには直接関係ないので作らなくてもOKですが、一応作りました。こんな感じ↓

```js
// src/services/petService.ts

const pets = [
  {id: 1, name: 'aaa'},
  {id: 2, name: 'bbb'},
]

export const petService = {
  getPets() {
    return pets
  },
  getPet(id: number) {
    return pets.find(pet => pet.id === id)
  }
}
```

これで、GET /v1/petsは完成です。api-doc.ymlのここで/petsにはparameterでlimitがint型で指定できると定義されているので、試しにlimit=1とlimit=hogeを試したところ、GETでここまでバリデーションする必要あるのかは置いておいて、ちゃんとバリデーションされました。

```bash
// バリデーションOK
$curl http://localhost:3000/v1/pets\?limit\=1
[{"id":1,"name":"aaa"},{"id":2,"name":"bbb"}]

// バリデーションNG
$curl http://localhost:3000/v1/pets\?limit\=hoge
{"status":400,"errors":[{"path":"limit","errorCode":"type.openapi.requestValidation","message":"must be integer","location":"query"}]}
```

次に、GET /pets/{id}を実装してみました。<a href="https://github.com/chanfuku/docker-typeorm-express/blob/main/node/examples/openapi-express/src/paths/pets/%7Bid%7D.ts" target="_blank">src/paths/pets/{id}.tsです</a>

paths以下のフォルダ名とファイル名でroutingを表現してくれています。

express-openapiを業務で使ったので備忘録として残しました。

以上、
