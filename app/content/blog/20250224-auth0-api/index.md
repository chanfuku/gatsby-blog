---
title: 【Auth0】デフォルトのConnection名を使うのはやめた方が良さそうというお話
date: "2025-02-24T11:12:03.284Z"
description: "デフォルトのConnection名を使うのはやめた方が良さそうというお話"
tags: ["Auth0"]
---

Auth0のユーザー情報を操作するには、下記2種類があります。

- Management Api
- Authentication Api

デフォルトのConnection名(`Username-Password-Authentication`)を使い続けている場合は、

Authentication Apiがちょっと危険そうというお話です。

まずは、Management Apiの使い方を記載していきます。

## Access Token取得API

Management Apiを使うためにはAccess TokenをHeaderにセットする必要があるため、

下記APIを使ってTokenを取得します。※Tokenはデフォルト`86400`秒(1日)でexpiredします

<a href="https://auth0.com/docs/secure/tokens/access-tokens/management-api-access-tokens" target="_blank">
Get Access Tokens
</a>

```bash
curl --request POST \
  --url 'https://{yourDomain}/oauth/token' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data grant_type=client_credentials \
  --data client_id=YOUR_CLIENT_ID \
  --data client_secret=YOUR_CLIENT_SECRET \
  --data audience=YOUR_API_IDENTIFIER
```

## ユーザー作成

Management Api, Authentication APIの2通りあります。

Management ApiはHeaderにTokenをセットする必要がありますが、Authentication ApiはTokne不要です。

### POST /api/v2/users

<a href="https://auth0.com/docs/api/management/v2/users/post-users" tareget="_blank">Create a user</a>

Management Api Access Tokenで取得したTokenをHeaderにセットします。

```bash
curl --location 'https://{yourDomain}/api/v2/users' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {yourAccessToken}' \
--data-raw '{
    "email": "EMAIL",
    "password": "PASSWORD",
    "connection": "CONNECTION",
    "given_name": "John",
    "family_name": "Doe",
    "name": "John Doe",
    "nickname": "johnny",
    "email_verified": true,
    "verify_email": false,
    "picture": "http://example.org/jdoe.png",
    "user_metadata": {
        "plan": "silver",
        "team_id": "a111"
    }
}'
```

### POST /dbconnections/signup

これが危険な香りがするAuthentication Apiその1です。

<a href="https://auth0.com/docs/api/authentication#signup" tareget="_blank">Signup Api</a>

```bash
curl --location 'https://{yourDomain}/dbconnections/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "client_id": "{yourClientId}",
    "email": "EMAIL",
    "password": "PASSWORD",
    "connection": "CONNECTION",
    "username": "johndoe",
    "given_name": "John",
    "family_name": "Doe",
    "name": "John Doe",
    "nickname": "johnny",
    "picture": "http://example.org/jdoe.png",
    "user_metadata": {
        "plan": "silver",
        "team_id": "a111"
    }
}'
```
email, password, connectionのみrequiredです。

domainはAuth0ログイン画面のURLのdomainです。

Auth0でアプリケーションを作るとconnectionのdefault値は`Username-Password-Authentication`になるので、

<strong>そのまま変更せずに使っていると、悪意を持った誰かがイタズラで非常に簡単に大量にユーザーが作れてしまうという、ちょっと危険な香りがするAPIです。</strong>

そして、同様に危険な香りがするAPIが下記のchange passwordです。

### Change Password

ユーザーのパスワード変更メールを送信するAPIです。パスワードを変更することは出来ないですが、

別ユーザーのメールアドレスさえ分かれば、このAPIを使って「あれ、なぜかパスワード変更メールが飛んできたなー」なんてイタズラが可能です。

```bash
curl --location 'https://{yourDomain}/dbconnections/change_password' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "EMAIL",
    "connection": "CONNECTION"
}'
```

CONNECTION名はdefaultのまま使っている場合は`Username-Password-Authentication`なので、

<strong>やはりAuth0でアプリケーションを構築する場合は新規にDatabase Connectionを作成した方が良さそうです。</strong>

Authentication APIを無効にすることも出来るのかもしれませんが、少し調べたけどやり方が分かりませんでした。

そもそも各connectionにはIdentifierという識別子があるのに、何でconnection名を指定する設計になっているのかが謎。

というお話でした。
