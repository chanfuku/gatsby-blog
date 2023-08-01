---
title: 【Next.js】SSGでOGP画像やdescriptionを出し分ける
date: "2022-12-22T11:12:03.284Z"
description: "SSGで静的HTMLを量産し、OGP画像やdescriptionを出し分ける"
tags: ["React", "Next", "Typscript", "AWS"]
---


## 何をしたいのか？

「SNSでシェアする際に表示されるOGP画像やdescriptionを条件によって出し分けたい」

ある条件というのは、例えば脳年齢診断の様なウェブサービスの診断結果が1歳〜100歳まであると過程して、

その診断結果100通りのOGP画像とdescriptionを、Twitter等のSNSでシェアした時に動的に出し分けたいというイメージです。

脳年齢診断結果ページでTwitterシェアリンクをクリックすると

- OGP画像
- title
- description

がツイート内に展開される、というイメージです。

19歳と診断され、Tweetボタンをクリックしてツイートされた時のイメージはこんな感じ↓

![img1](./img1.jpg)

## 最初に思いついて試した方法

まず最初にシェアされるURLを`https://..../index.html?score=19`の様にリクエストパラメータで診断結果の値を渡して、

`score`の値に応じて、javascript等でmetaタグを書き換える、という方法が思いつきました。

しかしながら実際に実行してみると、SNSのクローラー？はHTMLのjavascriptを解釈してくれず、OGP画像やdescriptionが動的に変更出来ませんでした。

これがSPAのデメリットである、SEOやSNSシェアに弱い、と言われている理由のようです。

## 次に思いついたけどやらなかった方法

愚直に100枚のHTMLを手作業で作成する方法です。

イメージとしては、以下のように診断年齢の数だけ一つ一つHTMLを作成する、という気合いが必要な方法です。

`https://..../1/index.html`

`https://..../2/index.html`

`https://..../3/index.html`

.

.

.

`https://..../200/index.html`

これはちょっと、、、あまりにも辛いので却下。

## じゃあどうやる？

Next.jsのSSGを使いました。SSGが出来ればNext.jsじゃなくても良いです。

metaタグだけが異なる静的HTMLを必要な条件の数だけSSGで生成しておくと、

そのHTMLのURLがシェアされた際に表示されるOGPやdescriptionを動的に出し分けることが可能です。

ちなみに、OGP画像は全パターン(今回は100枚)手作業で作成しておく必要があります。

これが例えばOGP画像1000枚とかだったら、HTMLだけでなく画像も大量に生成する方法を考えないといけなさそう(Jimp等のライブラリ？)ですが、今回は幸い不要でした。

descriptionに関しては、ベースの文言は同じで、診断結果に応じて一部を置換するような仕様であれば要件を満たせます。

## 実際のソースコード

<details>
<summary>コードの詳細を見る</summary>

#### pages/[age].tsx
```ts
import _ from 'lodash';
import Meta from '@/components/meta'

type Params = {
  params: {
    age: string,
  }
}

type Props = {
  age: string,
}

export async function getStaticPaths() {
  const minAge = 1;
  const maxAge = 100;
  return {
    paths: _.range(minAge, maxAge + 1).map(age => {
      return {
        params: {
          age: age.toString(),
        }
      }
    }),
    fallback: false, // can also be true or 'blocking'
  }
}

export async function getStaticProps({ params }: Params) {
  return {
    props: {
      age: params.age
    }
  }
}

function Age({ age }: Props) {
  const imageUrl = `${process.env.BASE_URL}/ages/banner${age}.png`
  const description = `脳年齢は${age}歳でした！`

  return (
    <Meta
      imageUrl={imageUrl}
      description={description}
    />
  )
}

export default Age
```
</details>

ポイントしては、getStaticPropsとgetStaticPathsを使って、1歳から100歳までの静的HTMLを生成している点です。

年齢数に応じて出し分けるOGP画像は`public/ages/banner{age}.png`に格納しておいて、その画像のURLとdescriptionをMetaコンポーネント(metaタグ用)にPropsで渡します。

Metaコンポーネントは下記になります。

<details>
<summary>コードの詳細を見る</summary>

#### components/meta.tsx
```ts
import Head from 'next/head'

type Props = {
  imageUrl: string,
  description: string,
}

const Meta = ({ imageUrl, description }: Props) => {
  const topPageUrl = `${process.env.LP_TOP_PAGE}/`
  const title = '簡単 脳年齢チェック'
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={topPageUrl} />
      {/* sumary or summary_large_image */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  )
}

export default Meta
```
</details>


### build & export
これであとは、`next build && next export`を実行すると`/out`に下記のように年齢数の分のフォルダとindex.htmlが生成されます。

```bash
├── 18
│   └── index.html
├── 19
│   └── index.html
├── 20
│   └── index.html
├── 21
│   └── index.html
├── 22
│   └── index.html
├── 23
│   └── index.html
```

シェア用のURLは/{age}/index.htmlになります。{age}の部分が年齢です。

あとはCloudfront + S3やAmplifyで簡単に公開出来ます。

以上、
