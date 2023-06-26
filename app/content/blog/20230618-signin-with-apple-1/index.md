---
title: 【Nuxt】Sign in with Apple フロントエンド編
date: "2023-06-18T11:12:03.284Z"
description: "ボリューム的にフロントエンド編とバックエンド編に分けます"
tags: ["Vue", "Nuxt"]
---

Nuxt等のJSフレームワーク製のWebアプリケーションに`Sign in with Apple`を実装しようとするとどんな感じになるか、を書いていきます。

ちなみにNuxtは2系です。

### Appleログインに関するライブラリが少ない

まず最初にnpmやyarnで導入出来るapple login系のライブラリを探したのですが、以下の理由で断念しました

- 個人開発で作られているものばかりでどこかでメンテされなくなる恐れがある

- スターが100以下のものばかりで実績面に不安がある

### Sign in with Apple

というわけで、今回はAppleが提供している`Apple JS`を`<script`タグで埋め込んで使ってみました。

ClientId(AppId or ServiceID)とRedirectURIを、事前にApple Developer Programで作成する必要がありますがそこは割愛します。

- Web向けに「Appleでサインイン」を設定する

<a target="_blank" href="https://developer.apple.com/jp/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web/">
https://developer.apple.com/jp/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web/
</a>

- Apple JSについて

<a target="_blank" href="https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple">
https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple
</a>

- sign in ボタン周りの仕様について

<a target="_blank" href="https://developer.apple.com/documentation/sign_in_with_apple/displaying_sign_in_with_apple_buttons_on_the_web">
https://developer.apple.com/documentation/sign_in_with_apple/displaying_sign_in_with_apple_buttons_on_the_web
</a>

### ソースコード

早速まずはApple ログインボタンのコンポーネントを作ります。

#### AppleLogin.vue
```js
<template>
  <div>
    <div id="appleid-signin" data-color="white" data-border="true" data-type="sign in" data-height="55" @click="loginClick()"></div>
    <script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/ja_JP/appleid.auth.js"></script>
    <script type="text/javascript">
      AppleID.auth.init({
        clientId : {{ `'${$config.appleClientId}'` }},
        redirectURI : {{ `'${$config.appleRedirectUri}'` }},
        scope: 'name email',
        usePopup : true
      });
    </script>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  useContext,
} from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'AppleLogin',
  setup(_, { emit }) {
    const { $config } = useContext();

    const initAppleAuth = () => {
      // @ts-ignore for AppleID
      AppleID.auth.init({
        clientId : $config.appleClientId,
        redirectURI : $config.appleRedirectUri,
        scope: 'name email',
        usePopup : true
      });
    }

    const loginClick = () => {
      // Error: The "init" function must be called first. を回避するためここでもinitする
      initAppleAuth();
      emit('appleSocialLogin');
    }

    return { loginClick };
  },
});
</script>
```

.envとnuxt.config.jsにClientIdとRedirectURLを記載します。

#### .env

```js
APPLE_CLIENT_ID=test1234
APPLE_REDIRECT_URL=https://testsite.com/mypage
```

#### nuxt.config.js

```js
export default {
  .
  head: {
    // 画面遷移後にAppleログインボタンが表示されない事象を回避する
    script: [
      {
        type: 'text/javascript',
        src: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/ja_JP/appleid.auth.js',
        body: true,
      },
    ]
  },

  // .envの値を`publicRuntimeConfig`に定義して、template内で使えるようにします
  // https://v2.nuxt.com/docs/directory-structure/nuxt-config/#runtimeconfig
  publicRuntimeConfig: {
    appleClientId: process.env.APPLE_CLIENT_ID,
    appleRedirectUri: process.env.APPLE_REDIRECT_URL
  },
}
```

#### 親コンポーネントでAppleLogin.vueを使う

```js
<template>
  <apple-login
    :key="appleLoginComponentKey"
    @appleSocialLogin="appleSocialLogin"
  />
</template>
<script lang="ts">
  .
  .
  .
  setup(_, context: SetupContext) {
    const appleLoginComponentKey = ref(0);

    /**
     * Apple ソーシャルログインボタン押下時の処理
     */
    const appleSocialLogin = async () => {
      loadingStore.open();
      try {
        // @ts-ignore for AppleID
        const response: AuthAppleAuthorizedResponse = await AppleID.auth.signIn() // Appleログイン認証
        const request = {
          code: response.authorization.code,
        };
        // 登録もしくはログイン
        const res = await authStore.singUpWithAppleId(request);
        authStore.signIn(res.data);
        // マイページに遷移
        router.push('/mypage');
      } catch (err: any) {
        // ログインポップ画面をキャンセル押下で閉じた後、再度ログインを試みるとエラーで動かなくなるkeyを更新して再レンダリングする
        appleLoginComponentKey.value++;
        apiError(err, DEFAULT_ERROR_MESSAGE);
      } finally {
        loadingStore.close();
      }
    }

    return { appleSocialLogin, appleLoginComponentKey };
```

### ログイン時のレスポンスを受け取る方法

認証情報がredicretURLにリダイレクトされる（リクエストが飛ぶ）ので、Appleログイン成功後のレスポンスをフロントで受ける必要は必ずしもないのですが、

フロント側で更に何かしらの追加処理が必要な場合（例えば、Appleログイン成功後のレスポンスに何らかのパラメーターを追加して、バックエンドの登録APIをcallしたりする場合等)は

以下の様にしてレスポンスを受け取ることが出来ます。

```js
const response: AuthAppleAuthorizedResponse = await AppleID.auth.signIn() // Appleログイン認証
```

レスポンスはこんな感じです↓userは初回登録時だけ存在する項目です。

```json
{
     "authorization": {
       "code": "[CODE]",
       "id_token": "[ID_TOKEN]",
       "state": "[STATE]"
     },
     "user": {
       "email": "[EMAIL]",
       "name": {
         "firstName": "[FIRST_NAME]",
         "lastName": "[LAST_NAME]"
       }
     }
}
```

今回はこのレスポンスの中のcodeだけを取り出して、backendにapiを通じて送ります。

ちなみに、リダイレクトはやらないことにしたので、redirectURLは使わなかったですが必須項目なので設定だけはしておきます。

```js
      AppleID.auth.init({
        clientId : {{ `'${$config.appleClientId}'` }},
        redirectURI : {{ `'${$config.appleRedirectUri}'` }},
        scope: 'name email',
        usePopup : true
      });
```

### AppleID is not defined エラー対応

正確な原因は分からなかったのですが、scriptの読み込みを、nuxt.config.jsに定義しないと、画面遷移後に実行されるAppleログインボタン初期化処理で`AppleId is not defined`というエラーでボタンが表示されませんでした。

また、コンポーネント内にも定義しないと、ボタンをクリックした時も同様のエラーが発生してしまいました。

更に、ボタンをクリックした時に`The "init" function must be called first`と表示されることがあるので、AppleID.auth.init()をボタンクリック直後にも実行する必要があります。

そして、更にログインポップ画面をキャンセル押下で閉じた後、再度ログインを試みるとエラーで動かなくなるので、下記の様にエラーが発生した際はAppleLoginコンポーネントに割り当てられるkeyの値を更新すると、

再レンダリングされて回避出来ます。

```js
try {
  const response: AuthAppleAuthorizedResponse = await AppleID.auth.signIn() // Appleログイン認証
} catch (err: any) {
  // ログインポップ画面をキャンセル押下で閉じた後、再度ログインを試みるとエラーで動かなくなるkeyを更新して再レンダリングする
  appleLoginComponentKey.value++;
}
```

テンプレートでは以下ように:key="appleLoginComponentKey"を割り当てます。

```js
<template>
   <apple-login
    :key="appleLoginComponentKey"
    @appleSocialLogin="appleSocialLogin"
  />
```

これで、NuxtにApple JS導入完了です。Nuxtへの導入手順が記載された記事はあまり見つけられなかったので、これが少しでも参考になれば幸いです。

次回はバックエンド(Laravel)で、passportとsocialiteを使って、フロントエンドから受け取ったcodeをどのように扱うのかを書きます。
