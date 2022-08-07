---
title: 【Jest】ユニットテストが書きやすいコードを書きたい
date: "2022-08-07T11:12:03.284Z"
description: "ユニットテスト書いてますか？"
tags: ["React", "Next", "Jest", "Typescript", "Unit Test"]
---

最近作った<a href="https://github.com/chanfuku/next-contentful-typescript-blog" target="_blank">
Reactのアプリケーション
</a>
に、ユニットテストを追加しようとしたところ、一部の関数がReact Hooksに依存してしまっていたので、テストコードが書き辛いことになっていました。

React Hooksのテストコード実装方法もあるにはあるのですが、`@testing-library/react-hooks`をインストールしないといけなかったり少し手間がかかるので今回は、React Hooksに依存させないように関数を外部のモジュールに切り出して、テストコードが書きやすくなるようにリファクタリングした、という内容です。

## リファクタリング前
`pages/index.tsx`

```js
import { useState } from 'react'
import { Entry, Tag } from 'contentful'
import { SearchType } from '../types/search'
import { IBlogPostFields } from '../@types/generated/contentful'

type Props = {
  allPosts: Entry<IBlogPostFields>[]
  allTags: Tag[]
}

const Index = ({ allPosts, allTags }: Props) => {
  const [posts, setPosts] = useState<Entry<IBlogPostFields>[]>(allPosts);

  // React Hooksに依存していてテストコードが書きづらい
  const search = ({ keyword, selectedTags }: SearchType) => {
    if (!keyword && !selectedTags.length) {
      setPosts(allPosts)
      return
    }
    const filtered = allPosts.filter((post: Entry<IBlogPostFields>) => {
      const keywordFound = keyword.length && (post.fields.title.includes(keyword) || post.fields.slug.includes(keyword) || post.fields.body.includes(keyword))
      if (keywordFound) return true
      return selectedTags.some((tag: string) => post.metadata.tags.map(v => v.sys.id).includes(tag))
    })
    setPosts(filtered)
  }

  // React Hooksに依存していてテストコードが書きづらい
  const addOrRemove = (value: string) => {
    const categorySet: Set<string> = new Set(selectedTags);
    if (categorySet.has(value)) {
      categorySet.delete(value)
    } else {
      categorySet.add(value)
    }
    const array = Array.from(categorySet)
    setSelectedCategories(array)
    routerPush({ keyword, selectedTags: array })
  }
  .
  .
  .
```

## リファクタリング後
`pages/index.tsx`
```js
import { useState } from 'react'
import { Entry, Tag } from 'contentful'
import { SearchType } from '../types/search'
import { IBlogPostFields } from '../@types/generated/contentful'
import { getSearchResult, getSelectedTags } from '../lib/search'

type Props = {
  allPosts: Entry<IBlogPostFields>[]
  allTags: Tag[]
}

const Index = ({ allPosts, allTags }: Props) => {
  const [posts, setPosts] = useState<Entry<IBlogPostFields>[]>(allPosts);

  const setSearchResult = ({ keyword, selectedTags }: SearchType) => {
    const searchResult = getSearchResult({ keyword, selectedTags }, allPosts)
    setPosts(searchResult)
  }

  const addOrRemove = (value: string) => {
    const currentSelectedTags = getSelectedTags(selectedTags, value)
    setSelectedTags(currentSelectedTags)
    routerPush({ keyword, selectedTags: currentSelectedTags })
  }
  .
  .
  .

```

`lib/search.ts`
```js
import { SearchType } from '../types/search'
import { Entry } from 'contentful'
import { IBlogPostFields } from '../@types/generated/contentful'

export const getSearchResult = ({ keyword, selectedTags }: SearchType, allPosts: Entry<IBlogPostFields>[]): Entry<IBlogPostFields>[] => {
  if (!keyword && !selectedTags.length) {
    return allPosts
  }
  const filtered = allPosts.filter((post: Entry<IBlogPostFields>) => {
    const keywordFound = keyword.length && 
      (post.fields.title.includes(keyword) || post.fields.slug.includes(keyword) || post.fields.body.includes(keyword) || post.fields.description.includes(keyword))
    if (keywordFound) return true
    return selectedTags.some((tag: string) => post.metadata.tags.map(v => v.sys.id).includes(tag))
  })
  return filtered
}

export const getSelectedTags = (selectedTags: string[], value: string): string[] => {
  const tagSet: Set<string> = new Set(selectedTags)
  if (tagSet.has(value)) {
    tagSet.delete(value)
  } else {
    tagSet.add(value)
  }
  return Array.from(tagSet)
}
```

`pages/index.tsx`から`lib/search.ts`に一部処理を切り出したので、各関数の責務も明確になり、可読性が大幅に上がったのではないでしょうか。

また、`lib/search.ts`に切り出した`getSearchResult`と`getSelectedTags`は、React Hooksに依存していないのでユニットテストも簡単に書くことができました。

`search.spec.ts`
```js
import { getSearchResult, getSelectedTags } from '../../lib/search'
import { Entry } from 'contentful'
import { IBlogPostFields } from '../../@types/generated/contentful'

test('getSearchResult', () => {
  const post1 = {
    fields: {
      body: 'test1',
      description: 'test1',
      title: 'test1',
      slug: 'test1',
    },
    metadata: {
      tags: [
        {
          sys: {
            id: 'tag1'
          }
        }
      ]
    }
  }
  const post2 = {
    fields: {
      body: 'test2',
      description: 'test2',
      title: 'test2',
      slug: 'test2',
    },
    metadata: {
      tags: [
        {
          sys: {
            id: 'tag2'
          }
        }
      ]
    }
  }
  const post3 = {
    fields: {
      body: 'test3',
      description: 'test3',
      title: 'test3',
      slug: 'test3',
    },
    metadata: {
      tags: [
        {
          sys: {
            id: 'tag1'
          }
        },
        {
          sys: {
            id: 'tag2'
          }
        }
      ]
    }
  }

  const allPosts = [post1, post2, post3] as Entry<IBlogPostFields>[]
  let actual = getSearchResult({keyword: 'test1', selectedTags: ['tag1']}, allPosts)
  expect(actual).toStrictEqual([post1, post3])
});

test('getSelectedTags', () => {
  let actual = getSelectedTags(['tag1', 'tag2'], 'tag3')
  expect(actual).toStrictEqual(['tag1', 'tag2', 'tag3'])

  actual = getSelectedTags(['tag1', 'tag2'], 'tag2')
  expect(actual).toStrictEqual(['tag1'])
});
```

今回はReact Hooksに依存している関数の一部の処理を外部のモジュールに切り出してテストコードを書きました。

React Hooksに依存している関数のテストコードも書きたいのですが...そこは次回以降に`@testing-library/react-hooks`をinstallする方法で対応してみたいと思います。
