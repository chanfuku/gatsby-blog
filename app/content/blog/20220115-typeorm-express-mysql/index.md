---
title: 【TypeORM, Express, Mysql】Docker環境を構築した
date: "2022-01-15T22:12:03.284Z"
description: "【TypeORM, Express, Mysql】Docker環境を構築した"
tags: ["Docker", "OpenApi", "Typescript", "Express", "TypeORM"]
---

成果物↓

### github
[https://github.com/chanfuku/docker-typeorm-express]

各種バージョン↓

| node | TypeORM | typescript | express | mysql |
| :--- | :------ |:------ |:------ | ---: |
| 16.13.2 | 0.2.41 |  4.4.3 | 4.15.4 | 5.7.10 |

```bash
$ git clone git@github.com:chanfuku/docker-typeorm-express.git
$ docker-compose up -d
$ docker-compose exec node sh
$ cd examples/basic-example
$ npm install
$ npm run start

> start
> ts-node src/index.ts

Express server has started on port 3000. Open http://localhost:3000/users to see results
```

Express server has started....と表示されたらサーバー起動成功です。http://localhost:3000/usersにアクセスすると、こんなレスポンスが返ってきます。↓

```json
[
{
id: 1,
firstName: "Timber",
lastName: "Saw",
age: 27
},
{
id: 2,
firstName: "Phantom",
lastName: "Assassin",
age: 24
},
{
id: 3,
firstName: "Timber",
lastName: "Saw",
age: 27
}
]
```

今回学んだことを書いていきます。

### ormconfig.jsonに記述するDBのhostの値は、docker-compose.ymlのservice名。

node/app/ormconfig.jsonはこんな感じ↓

```json
{
   "type": "mysql",
   "host": "mysql",
   "port": 3306,
   "username": "test",
   "password": "test",
   "database": "test",
   "synchronize": true,
   "logging": false,
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}
```

DBの接続情報やentity,migrationなどの設定を記載します。hostの値がmysqlとなっていますが、最初ここをlocalhostにしていました。その状態でnpm run startを実行すると、こんなエラーが発生します。DBに接続できないよ、という旨のエラーです。

```bash
Error: connect ECONNREFUSED 127.0.0.1:3306
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1161:16)
    --------------------
    at Protocol._enqueue (/app/node_modules/mysql/lib/protocol/Protocol.js:144:48)
```

docker.compose.ymlに記述したDBのservice名をormconfig.jsonのhostに記述すると解決しますが、知らないとハマりそうですね。

### routes、controller定義

私自身expressで開発したことはあったのですが、小規模だったためかindex.tsが全てのリクエストの入り口となるような作りしか見たことがありませんでした。ただ、アプリケーションの規模が大きくなるとそのままでは流石に厳しいので、routesやconrollerを使いたいというニーズが出てくるかと思います。今回はroutesやcontrollerを使って中規模？程度には耐えられるような構成にしてます。

routesファイルはこんな感じです↓リクエスト毎にmethod, route, controller,actionを指定できます。actionの値 = controller内のメソッド名です。

```javascript
import {UserController} from "./controller/UserController";

export const Routes = [{
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all"
}, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one"
}, {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "save"
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove"
}];
```

controllerはこんか感じです↓メソッド名がroutesのactionに対応していることが分かります。

```javascript
import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";

export class UserController {

    private userRepository = getRepository(User);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOne(request.params.id);
        await this.userRepository.remove(userToRemove);
    }

}
```

リポジトリからデータを取得する形になっています。マイグレーションも出来るようなのでそのうちやってみたいと思います。
