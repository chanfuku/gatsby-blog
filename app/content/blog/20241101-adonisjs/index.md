---
title: AdonisJSを少しだけ触ってみた
date: "2024-11-04T11:12:03.284Z"
description: "AdonisJSとはNode.js向けのTypeScriptファーストなWebフレームワークです"
tags: ["Node.js", "AdonisJS"]
---

## AdonisJSとは
AdonisJSは、Node.js向けのTypeScriptファーストなWebフレームワークです。フルスタックのWebアプリケーションやJSON APIサーバーを作成できます。

<a href="https://docs.adonisjs.com/guides/preface/introduction" target="_blank">
AdonisJS
</a>

## Node.jsのバージョン

ver20.6以上が必要です。

## API starter kit を使う
今回はCRUD操作を行うAPIを作りたいのでAPI starter kitを使います。

まずはプロジェクトを作成します。

```bash
npm init adonisjs@latest {プロジェクト名} -- --kit=api --db=mysql --auth-guard=access_tokens
```

各オプションの意味は

- `--kit`: どのstarter kitを使うのかを指定します。web, api, slim, inertiaが指定可能です。今回はapiを指定しました。

- `--db`: DBを指定します. Ysqlite, postgres, mysql, mssqlが指定可能です。今回はmysqlを指定しました。

- `--git-init`: プロジェクト作成時にGitリポジトリを初期化するかどうかを指定します。デフォルトはfalseです。今回はデフォルト(false)にしました。

- `--auth-guard`: 認証手段を指定します. session, access_tokens, basic_authが指定可能です。今回はaccess_tokensを指定しました。


オプションで値を指定する際は、以下の用にプロジェクト名の後ろに`--`をつける必要があります。`--`がない場合はオプションの値がnpm initコマンドに渡されないので、CLI上でポチポチ質問に答えていく必要があります。

```bash
npm init adonisjs@latest {プロジェクト名} --
```

## 起動してみる

プロジェクト作成後、下記のようにnpm run devで起動します。

```bash
cd {プロジェクト名}
npm run dev
```

すると、下記のようにlocalhost:3333で起動するので

```
> adonis-api-sample@0.0.0 dev
> node ace serve --hmr
[ info ] starting HTTP server...
╭─────────────────────────────────────────────────╮
│                                                 │
│    Server address: http://localhost:3333        │
│    Watch Mode: HMR                              │
│    Ready in: 577 ms                             │
│                                                 │
╰─────────────────────────────────────────────────╯
```

curlコマンドでレスポンスが返却されればOKです。

```bash
curl http://localhost:3333
{"hello":"world"}
```

## Controller を作ってみる

次に、下記公式Docを参考にControllerを作成します。

<a href="https://docs.adonisjs.com/guides/basics/controllers" target="_blank">
https://docs.adonisjs.com/guides/basics/controllers
</a>

下記コマンドでusersという名前のControlelrを作成します。

```bash
node ace make:controller users
```

`ace`というのは、どうやらadonisにはデフォルトで組み込まれているコマンドらしいです。

controllerやvalidator等の各種生成を行えます。

<a href="https://v5-docs.adonisjs.com/guides/ace-commandline" target="_blank">
https://v5-docs.adonisjs.com/guides/ace-commandline
</a>

app/controllersに`users_controller.ts`が作成されます。

中身はほぼ何もない状態なので、JSONを返すように修正します。

```js
export default class UsersController {
  index() {
    return [
      {
        id: 1,
        username: '麻生太郎',
      },
      {
        id: 2,
        username: '大谷翔平',
      },
    ]
  }
}
```

最後に、下記のように`routes.ts`を修正し、`/users`というエンドポイントでUserControllerのindexが実行されるようにします。

```js
import router from '@adonisjs/core/services/router'
const UsersController = () => import('#controllers/users_controller')

router.get('users', [UsersController, 'index'])
```

curlコマンドで動作を確認すると、うまく動いてます。

```bash
curl http://localhost:3333/users/
[{"id":1,"username":"麻生太郎"},{"id":2,"username":"大谷翔平"}]
```

### ここまでの感想

- routesとControllerの紐づけが簡単に行える点が魅力的
- デフォルトでTypeScriptが組み込まれているため、環境構築が不要で便利

ExpressとFastifyしか知らないですが、WebAPIを作るとなると、
routesとcontrollerを紐づけるためのライブラリを導入しないといけなかったり、
またその設定が面倒だったり、自由度が高すぎる故に苦労した記憶があります（今は違うのかも）。

その点AdonisJSはしっかりと、仕組みが用意されているので簡単にroutesとcontrollerの紐づけが出来ました。

また、Typescriptがデフォルトで組み込まれているので、Typescriptの環境構築が不要なことも有り難いです。

どうやらAdonisJSには、VueやReact等を使ってSPAやSSRのアプリケーションも作れる機能もあるらしく、そこまで出来るのには驚きました。

また、inertiajsをadonisjsプロジェクト作成時のオプションで指定することも出来るのですが、

inertijsというのが`Build single-page apps, without building an API.(API構築が不要なSPA)`というコンセプトらしく、非常に興味深いです。

ただ、一旦そのあたりはスキップして次回はValidator導入とCRUD機能の実装を進めます。
