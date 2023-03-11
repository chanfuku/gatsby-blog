---
title: 【MySQL】開発環境のDBをexport(dump)してローカル環境のDBにimportしたい時のコマンド
date: "2023-03-11T11:12:03.284Z"
description: "開発環境や本番環境等のリモートにあるDBをまるっとローカルに持ってきたい時に使えるネタです"
tags: ["MySQL", "Docker"]
---

開発環境や本番環境等のリモートにあるDBをまるっとローカルに持ってきたい時に使えるネタです。

migrationやseederが整備されていればこんなことはやらないと思いますが、そうでない開発現場では必要になったりします。

MySQLのGUIクライントでDB接続してエクスポート&インポートすれば済む話ですが、何度もやるならコマンド打つ方が早いのやってみた時のメモです。

### ローカル環境にMySQLを構築するためのdocker-compose.ymlを用意する

まずは、ローカル環境にデータベースがないと話にならないので

```yml
version: '3'

services:

  sample-db:
    image: mysql:8.0
    container_name: sample-db
    restart: always
    ports:
      - 3306:3306
    volumes:
      - ./.data/db:/var/lib/mysql
      - ./.data/init:/init
    environment:
      MYSQL_DATABASE: sample-db
      MYSQL_ROOT_PASSWORD: root
      MYSQL_USER: test
      MYSQL_PASSWORD: test
    command: >
      mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_bin &&
      mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` ;" &&
      mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "GRANT ALL ON \`$MYSQL_DATABASE\`.* TO 'root'@'%' ;"
```

これで、`docker-compose up -d`を実行するとローカル環境に`sample-db`というデータベースが入ったコンテナが起動します。

## DBをdumpするコマンド

MySQLが入ってるコンテナ内で`mysqldump`を叩き、開発環境のddlを`./init/dump.sql`に出力するコマンドです↓

```bash
$ docker-compose exec sample-db sh -c "mysqldump -u {ユーザー名} -p -h {ホスト名} --add-drop-table --set-gtid-purged=OFF {DB名} > ./init/dump.sql"
```

開発環境のDBのユーザー名、ホスト名、DB名は環境に合わせて適宜置き換えてください。

実行するとパスワードを聞かれるので入力してEnterを押すだけです。

`--add-drop-table`はdrop tableを出力するオプションです。これがないとimportする際にテーブルが既に存在していたらエラーになってしまいます。

`--set-gtid-purged=OFF`はdumpしたSQL内にgtidというIDを出力しないようにするためのオプションです。これをoffにしないと、２回目以降のimport時にgtidは上書きできませんよ的なエラーになってしまうのでoffにします。

## dump.sqlをローカルDBにimportするコマンド

上記で出力した`./init/dump.sql`をローカルDBにimportするコマンドです↓

```bash
$ docker-compose exec sample-db sh -c "mysql -u root -proot -h localhost sample-db < ./init/dump.sql"
```

以上、開発環境のDBをローカル環境にimportしたくなった時に使えるコマンドでした。
