---
title: 【状態管理】React Queryのキャッシュを使ってAPI通信を最小限に抑えたPaginationを実装した
date: "2022-09-03T11:12:03.284Z"
description: "Paginationを実装する方法は色々ありますが、どのタイミングでどれ位の量のデータを..."
tags: ["React"]
---

前回は「【状態管理】React QueryとReact Hooksを組み合わせる」を書きました。
* [【状態管理】React QueryとReact Hooksを組み合わせる](../20220827-react-query/)

今回は、React QueryでAPIレスポンスをキャッシュして、API通信を最小限に抑えたPaginationを実装しました。

## React Queryの紹介
<a href="https://react-query-v3.tanstack.com/" target="_blank">
https://react-query-v3.tanstack.com/
</a>

## demo
<a href="https://react-playground-one-theta.vercel.app/" target="_blank">
https://react-playground-one-theta.vercel.app/
</a>

## ポイント
- 各ページのデータ(APIレスポンス)はReact Queryでキャッシュされます。そのため、前のページに移動する際は、キャッシュから取得したデータを瞬時に表示します。同時に、一度目にフェッチしてから30秒以上経過していた場合は、バックグラウンドで再フェッチを行いフレッシュなデータに差し替えてキャッシュに保存します。
- 各ページを表示時に、次のページのデータもフェッチします。そのため、次のページを表示する際はキャッシュから取得したデータを瞬時に表示することができます。
- リロードするとキャッシュは削除されます。

Paginationを実装する方法は色々ありますが、どのタイミングでどれ位の量のデータをフェッチするかで、UI/UXが大きく変わります。
例えば、
1. 初期表示時に全データをフェッチし、ClientでPaginationする。-><strong>データ量が多くなると初期表示が重くなる。</strong>
1. 初期表示は1ページ分のみフェッチし、「次へ」「戻る」を押下したタイミングで必要な量のデータをAPIでフェッチし、Clientで表示する。-><strong>ページングの度にloadingが発生するのでUXが悪化する。</strong>

React Queryを使うと、上記の問題を簡単に回避できます。

## github repo
<a href="https://github.com/chanfuku/next-contentful-typescript-blog" target="_blank">
https://github.com/chanfuku/react-playground
</a>

## 実装ポイント1
```js
// ...省略

const queryOptions = {
  // 次のページのデータがフェッチできるまで、今のページを表示する
  keepPreviousData: true,
  // データの賞味期限が切れるまでの時間(ms)
  staleTime: 30 * 1000,
}

async function fetchProjects(page = 0) {
  const { data } = await axios.get('/api/projects?page=' + page)
  return data
}

function Example() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)

  const { status, data, error, isFetching, isPreviousData } = useQuery(
    ['projects', page],
    () => fetchProjects(page),
    queryOptions,
  )
  // ...省略
```

useQuery()の第一引数にあたる部分、つまり、`['projects', page]`がキャッシュのkeyになる部分です。

`() => fetchProjects(page)`で取得したAPIレスポンスを`['projects', page]`というキーでキャッシュに保存しています。

そして、`queryOptions`というオブジェクトの`staleTime`オプションで、データの賞味期限が切れるまでの時間等も設定できます。

データの賞味期限内の場合は再度そのデータにアクセスすると、キャッシュから返却されますが、賞味期限切れの場合はまずキャッシュを返却しつつ、APIから新鮮なデータを取得し、既存のデータを書き換えて再度キャッシュに保存します。

この`staleTime`はどの位の時間を設定すべきか、が結構悩みどころになりそうですが、そのアプリケーションがどれだけリアルタイムなデータを必要としているかで判断が分かれそうです。

特にリアルタイム性を求めない場合は、`staleTime: Infinity`にすれば、再フェッチされなくなります。

ちなみに、microCMSさんではInfinityに設定しているようです。

<a href="https://blog.microcms.io/optimize-cache-with-react-query/" target="_blank">ReactQueryでキャッシュを最大限利用する</a>

## 実装ポイント2
```js
  // Prefetch the next page!
  React.useEffect(() => {
    if (data?.hasMore) {
      queryClient.prefetchQuery(
        ['projects', page + 1],
        () => fetchProjects(page + 1),
        queryOptions,
      )
    }
  }, [data, page, queryClient])
```

`queryClient.prefetchQuery`を使うと、表示しているページの次のページのデータを事前にAPIからフェッチしてキャッシュに保存しておくことができます。
これにより、「次へ」ボタンを押した時に瞬時に次のページを表示することが出来ます。

## 感想

React Queryはサーバーサイドとクライアントサイドの両方の状態を出来るだけ同期させたい、けれどもAPI通信が増えるとUI/UX悪化するからbackgroundで同期しますよ。という、VuexやReduxとは全く異なるコンセプトから生まれたライブラリのようです。

ちなみに、vue-queryは<a href="https://github.com/DamianOsipiuk/vue-query" target="_blank">こちら</a>にありますが、<a href="https://tanstack.com/query/v4/docs/overview" target="_blank">TanStack Query公式</a>ではcomming soonと記載されています。

個人的には、もし今後業務で状態管理ライブラリを選定出来るチャンスがあれば、是非react query(TanStack Query)を推したいと思います。
