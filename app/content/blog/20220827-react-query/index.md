---
title: 【状態管理】React QueryとReact Hooksを組み合わせる
date: "2022-08-27T11:12:03.284Z"
description: "Reactの状態管理ライブラリはReduxが有名ですが、今回はReact Queryを使ってみました"
tags: ["React"]
---

Reactの状態管理ライブラリはReduxが有名ですが、今回はReact QueryとReact Hooksを組み合わせて状態管理を実現してみました。

## React Query
<a href="https://react-query-v3.tanstack.com/" target="_blank">
https://react-query-v3.tanstack.com/
</a>

React Queryはfetchや状態管理が簡単に実現出来るライブラリです。

正直私もまだまだ全然理解出来ていないですが、ひとまず、React Queryの<a href="https://react-query-v3.tanstack.com/overview" target="_blank">Overview</a>

を一読した上で、クライアントの状態管理を実装してみました。

## やったこと
<a href="https://next-typescript-blog-with-search.vercel.app/" target="_blank">こちらのdemoサイト</a>で、

入力した検索キーワードとチェックしたタグをsession storageに保存し詳細画面のヘッダーから戻ってきた時に、キーワードとタグが入力された状態で表示されるようになっているが、

session storageはやめてReact Queryを使うようにした。汎用的に使えるように、状態管理用のhooksを作成した。

## repo
<a href="https://github.com/chanfuku/next-contentful-typescript-blog" target="_blank">
https://github.com/chanfuku/next-contentful-typescript-blog
</a>

### step1. React Queryをinstallします
```bash
$ npm i react-query
# or
$ yarn add react-query
```

次に、以下の様に、アプリケーション内のどこからでもreact-queryを使えるようにしたいので、`<QueryClientProvider client={queryClient}>`で囲みます。

#### step2. pages/_app.tsx
```js
import { AppProps } from 'next/app'
import { UserProvider } from '@auth0/nextjs-auth0';
import { QueryClient, QueryClientProvider } from 'react-query'
import '../styles/index.css'

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {/* @ts-ignore */}
        <Component {...pageProps} />
      </UserProvider>
    </QueryClientProvider>
  )
}
```

次に、globalなstateに保存/取得するために必要な一意な`key`を型定義します。まだkeyが一つしかないですが、他にも状態管理が必要になったら新たな`key`を追加します。
未定義のkeyを使って保存/取得しようとすると、コンパイルエラーが出てくれるようになります。

#### step3. types/search.ts
```js
export const GlobalStateKeys = {
  searchQuery: 'searchQuery',
} as const
export type GlobalStateKeyType = typeof GlobalStateKeys[keyof typeof GlobalStateKeys]
```

次にCustom Hooksを作成し、queryClientを使って状態をget/setする関数を実装します。

#### step4. components/use-query-data.tsx
```js
import { useQueryClient } from 'react-query'
import { GlobalStateKeyType } from '../types/search'

export function useQueryData<T>(key: GlobalStateKeyType):[() => T | undefined, (value: T) => void] {
  const queryClient = useQueryClient()

  const getStateValue = (): T | undefined => {
    return queryClient.getQueryData(key)
  }
  const setStateValue = (value: T): void => {
    queryClient.setQueryData(key, value)
  }

  return [getStateValue, setStateValue]
}
```

次に上記で作成した`useQueryData`を使って、setする側を実装します。

#### step5. pages/index.tsx
```js
// 省略...
import { useQueryData } from '../components/use-query-data'
import { SearchType, GlobalStateKeys } from '../types/search'

const Index = ({ allPosts, allTags }: Props) => {
  // 省略...
  const [_, setSearchQuery] = useQueryData<SearchType>(GlobalStateKeys.searchQuery)
  // 省略...

  // save in global state
  setSearchQuery({ keyword, selectedTags })
  // 省略...
```

次に`useQueryData`を使って、getする側を実装します。

#### step6. components/header.tsx
```js
import { useQueryData } from '../components/use-query-data'
import { SearchType, GlobalStateKeys } from '../types/search'
// 省略..

const Header = ({ logoPosFixed = false }: Props) => {
  // 省略..
  const [getSearchQuery, _] = useQueryData<SearchType>(GlobalStateKeys.searchQuery)

  const toTopPage = () => {
    router.push({
      pathname: '/',
      query: makeQuerySearchParams(getSearchQuery() as SearchType)
    })
  }
  // 省略..
```

## 感想
key, valueの形式でcacheのような感覚で直感的に状態管理が出来ました。

<a href="https://react-query-v3.tanstack.com/" target="_blank">React Query</a>、これから深堀りしていけたらと思います。
