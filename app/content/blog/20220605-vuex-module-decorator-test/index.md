---
title: 【Nuxt】Vuex Module Decoratorで書かれたStoreをテストする
date: "2022-06-05T11:12:03.284Z"
description: "【Nuxt】Vuex Module Decoratorで書かれたStoreをテストする"
---



<a href="https://github.com/chanfuku/nuxt-openapi" target="_blank">`こちら`</a>のリポジトリのfrontに


jestとvue-test-utilsをインストールして、Vux Module Decoratorsで書かれたStoreをテストしてみました。

### Vuex Module Decoratorsとは
Vuex Storeをいい感じにmodule化してくれる + TypeScriptでスマートに書けるようになる、ライブラリです。

<a href="https://www.npmjs.com/package/vuex-module-decorators" target="_blank">`https://www.npmjs.com/package/vuex-module-decorators`</a>

`front/store/Pet.ts`
```typescript
import * as ApiClient from '~/api-client'
import { apiClientWrapper } from '~/utils/api'
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'Pet',
  stateFactory: true,
  namespaced: true
})

export default class Pet extends VuexModule {
  private _pets: ApiClient.Pet[] = []
  private _pet: ApiClient.Pet = {
    id: 0,
    name: ''
  }

  public get pets () {
    return this._pets
  }

  public get pet () {
    return this._pet
  }

...以下省略
}
```

上記Storeのテストを書いてみます。

`front/test/Pet.spec.js`
```javascript
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { initializeStores } from '~/store/index.ts';
import Pet from '~/store/Pet';
import { petStore } from '~/store'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('store/Pet.ts', () => {
  beforeEach(() => {
    const modules = {
      Pet 
    }
    initializeStores(new Vuex.Store({ modules }))
  })

  test('get pet() が正しい値を返すこと', () => {
    const pet =  { id: 1, name: 'あああ' }
    petStore.setPet(pet)
    expect(petStore.pet).toStrictEqual(pet)
  })

})
```

ポイントは、`initializeStores(new Vuex.Store({ modules }))`でpetStoreを作成している部分です。

テスト自体は、petStoreに値をセットして、getterで取り出した値と比較して同値かどうかをテストしているだけです。

続いて、petStoreを利用しているコンポーネントのテストを書いてみます。

`front/pages/index.vue`
```javascript
<script lang="ts">
import { computed, defineComponent, useFetch } from '@nuxtjs/composition-api'
import { petStore } from '~/store'

export default defineComponent({
  name: 'Top',
  setup () {
    const pets = computed(() => petStore.pets)
    useFetch(async () => {
      await petStore.fetchPets()
    })

    const countPet = () => {
      return `${pets.value.length}匹です`
    }
    return { pets, countPet }
  },
})
</script>
```

`test/pages/index.spec.js`

```javascript
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import { initializeStores } from '~/store/index.ts';
import { cloneDeep } from 'lodash'
import Pet from '~/store/Pet';
import Index from '~/pages/index'

const localVue = createLocalVue()
localVue.use(Vuex)

const pets = [
  {id: 1, name: 'あああ'},
  {id: 2, name: 'いいい'},
]

describe('store/Pet.ts', () => {
  let mockPet

  beforeEach(() => {
    mockPet = cloneDeep(Pet)
  })

  test('get pet() が正しい値を返すこと', () => {
    // PetStoreのmockを作成する
    mockPet = {
      ...mockPet,
      getters: {
        pets: () => pets
      },
      actions: {
        fetchPets: async () => await {}
      }
    }
    const modules = {
      Pet: mockPet 
    }
    // Vuex Storeが作成される
    initializeStores(new Vuex.Store({ modules }))

    const wrapper = shallowMount(Index, {
      mocks: {
        $nuxt: {
          context: {}, // useFetchがエラーになるので空で定義しておく
        },
      },
      stubs: {
        NuxtLink: true, // <Nuxtlink>を使ったComponentはエラーになるので空で定義しておく
      },
      localVue,
    })

    const expected = '2匹です'
    expect(wrapper.vm.countPet()).toBe(expected)
  })

})
```

ポイントは、2点です。

* petStoreのmockを定義している部分です。 gettersのpetsやactionsのfetchPetsというメソッドをmockしてます。
```
    mockPet = {
      ...mockPet,
      getters: {
        pets: () => pets
      },
      actions: {
        fetchPets: async () => await {}
      }
    }
```

* composition apiのuseFetchがcomponent内にあるとエラーになるので、空のcontextを定義しておく必要があります。また、NuxtLinkもエラーになるので空で定義しておきます。
```
      mocks: {
        $nuxt: {
          context: {}, // useFetchがエラーになるので空で定義しておく
        },
      },
      stubs: {
        NuxtLink: true, // <Nuxtlink>を使ったComponentはエラーになるので空で定義しておく
      },
```

テスト内容はwapper.vm.メソッド名で返却される値が期待する結果と同値かどうかをtestしているだけです。

次は<a href="https://nestjs.com/" target="_blank">`nestjs`</a>を使って書かれてたAPIのテスコードを書いてみたいと思います。

