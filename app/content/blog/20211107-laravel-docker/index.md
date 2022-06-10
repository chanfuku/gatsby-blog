---
title: Laravelのdocker環境を作った
date: "2021-11-07T22:12:03.284Z"
description: "Laravelのdocker環境を作った"
---

仕事でLaravelをよく触るのですが、自分で0から環境構築したことがなかったのでやってみました。マイグレーション・テストデータ投入、そしてGetとPostのAPIを一本ずつ作ったので動作確認もできます。

### github

<a href="https://github.com/chanfuku/docker-laravel-nginx-mysql" target="_blank">https://github.com/chanfuku/docker-laravel-nginx-mysql</a>

### 各種ミドルウェアやFWの詳細です。※2021/11/07時点
```
php 8.0.12
nginx 1.21.3
mysql8.0
composer 2.1.11
laravel 8.65
```

以下の手順でGetとPostのAPIを投げるところまで確認できます。

```
0. リポジトリをクローンしてくる
git clone https://github.com/chanfuku/docker-laravel-nginx-mysql.git

1. コンテナ起動 ※初回は5分ほどかかります
cd docker-laravel-nginx-mysql && docker-compose up -d

2. phpコンテナに入る
docker-compose exec php bash

3. 必要なパッケージをインストール
cd /var/www/laravel && composer install

4. /var/www/laravel/.envを作成し、下記を記入する。
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=mysql
DB_USERNAME=mysql
DB_PASSWORD=mysql

5. マイグレーション実行
cd /var/www/laravel && php artisan migrate

6. テストデータ投入
cd /var/www/laravel && php artisan db:seed

7. メモ取得APIを実行
curl localhost/api/note/1

8. メモ登録APIを実行
curl -X POST -H "Content-Type: application/json" -d '{"title":"あああ", "body":"いいい\nううう"}' localhost/api/note
```

本当は、ここから更に

* AWS ECSにデプロイしたり、
* コードパイプラインを作ったり、
* RDSインスタンスを書き込み専用・読み込み専用に分けたり、

というところまでやってみたかったのですが、そこは結構時間がかかるのでまずはここまでとします。
