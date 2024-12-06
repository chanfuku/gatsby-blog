---
title: 【AdonisJS】Docker環境を構築してCRUD処理を実装した
date: "2024-12-01T11:12:03.284Z"
description: "AdonisJSをもう少し深堀りしてみました"
tags: ["AdonisJS", "Docker"]
---

<a href="/20241101-adonisjs/">以前の記事</a>で、AdonisJSの環境構築とController作成するところまでやってみたので、

今回は「Docker環境構築」「Migration」「Seeding」「Validation」「CRUD処理」あたりを作ってみました。

DBはMySQLでORMは「Lucid」を使いました。

### AdonisJS

<a href="https://adonisjs.com/" target="_blank">
https://adonisjs.com/
</a>

### Lucid

<a href="https://lucid.adonisjs.com/docs/introduction" target="_blank">
https://lucid.adonisjs.com/docs/introduction
</a>

### 今回作った github repo

<a href="https://github.com/chanfuku/adonis-api-sample" target="_blank">
https://github.com/chanfuku/adonis-api-sample
</a>

### set up

```bash
git clone git@github.com:chanfuku/adonis-api-sample.git
cd adonis-api-sample
cp .env.example .env
docker compose up -d
docker compose exec app yarn install
docker compose exec app yarn dev
```

### run migration

```bash
docker compose exec app node ace migration:run
```

if you need to rollback migration, run

```bash
docker compose exec app node ace migration:rollback
```

### seeds

```bash
docker compose exec app node ace db:seed
```

### fetch all

```bash
curl http://localhost:3333/users
```

### find a user by id

```bash
curl http://localhost:3333/users/1
```

### create user

```bash
curl -X POST http://localhost:3333/users \
     -H "Content-Type: application/json" \
     -d '{"firstName":"テスト名","lastName":"テスト姓"}'
```

### update user

```bash
curl -X PATCH http://localhost:3333/users/3 \
     -H "Content-Type: application/json" \
     -d '{"firstName":"テスト名_更新","lastName":"テスト姓_更新"}'
```

### delete a user

```bash
curl -X DELETE http://localhost:3333/users/3
```

### 感想

.envのHOSTが127.0.0.0.1のままだと、APIに外部からアクセス出来ないのでHOST=0.0.0.0(どこからでもアクセス可)に修正する必要があるところが少しハマりポイントかもしれませんが、

そこ以外はAdonisJSやLucidのdocument通りに進めて特にハマるポイントはなかったです。

Lucidに関しては、TypeORMとPrismaは使ったことがあるのですが、特に大きな違いは感じなかったです。

やはり、AdonisJSはTypescript, ORM, Testing Tool等のアプリケーション構築に必要不可欠なライブラリ郡がデフォルトで組み込まれているので、

環境構築で苦労することなくコーディングに専念出来る点がが一番の魅力なのだと感じました。

ちなみに、ORMはLucidではなくPrismaやTypeORMを選択することも可能らしいです。

次はもともと気になっていた`inertijs`(`Build single-page apps, without building an API.(API構築が不要なSPA)`)のアプリケーションを作ってみたいと思います。
