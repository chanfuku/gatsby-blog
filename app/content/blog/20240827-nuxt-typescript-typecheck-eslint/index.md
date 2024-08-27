---
title: 【Nuxt3】tscとeslintで型チェック＋構文チェックするミニマルなテンプレートを作った
date: "2024-08-27T11:12:03.284Z"
description: "github repoは..."
tags: ["Nuxt", "Typescript"]
---

eslint, vue-tsc, huskyを使って、コミット時に型チェックと構文チェックを行うミニマル(最低限)なNuxt3のテンプレートを作りました。

### github repo

<a href="https://github.com/chanfuku/nuxt3-typecheck-eslint" target="_blank">
https://github.com/chanfuku/nuxt3-typecheck-eslint
</a>


ミニマルなのでpackage.jsonに定義するフレームワークやライブラリは下記だけです。

```json
  "dependencies": {
    "nuxt": "^3.12.4",
    "typescript": "^5.5.4"
  },
  "devDependencies": {
    "@nuxt/eslint": "^0.5.3",
    "eslint": "^9.9.1",
    "vue-tsc": "^2.0.29",
    "husky": "^9.1.5",
    "lint-staged": "^15.2.9"
  },
```

git commit時にvue-tscの型チェックとeslintの構文チェックが走ります。

### vue-tscの型チェック

```bash
$ git commit -m 'fix'
yarn run v1.22.22
$ vue-tsc --noEmit
app.vue:9:7 - error TS2322: Type 'string' is not assignable to type 'number'.

9 const hoge: number = 'hoge';
        ~~~~


Found 1 error in app.vue:9

error Command failed with exit code 2.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
husky - pre-commit script failed (code 2)
```

### eslintの構文チェック

```bash
$ git commit -m 'fix'
yarn run v1.22.22
$ vue-tsc --noEmit
✨  Done in 1.90s.
yarn run v1.22.22
$ /Users/xxxxxxx/Documents/workspace/chanfuku/nuxt3/nuxt3-typecheck-eslint/node_modules/.bin/lint-staged
✔ Preparing lint-staged...
✔ Hiding unstaged changes to partially staged files...
⚠ Running tasks for staged files...
  ❯ package.json — 3 files
    ❯ * — 3 files
      ✖ yarn lint [FAILED]
↓ Skipped because of errors from tasks.
↓ Skipped because of errors from tasks.
✔ Reverting to original state because of errors...
✔ Cleaning up temporary files...

✖ yarn lint:
error Command failed with exit code 1.
$ eslint . /Users/xxxxxxx/Documents/workspace/chanfuku/nuxt3/nuxt3-typecheck-eslint/.husky/pre-commit /Users/xxxxxxx/Documents/workspace/chanfuku/nuxt3/nuxt3-typecheck-eslint/app.vue /Users/xxxxxxx/Documents/workspace/chanfuku/nuxt3/nuxt3-typecheck-eslint/package.json

/Users/xxxxxxx/Documents/workspace/chanfuku/nuxt3/nuxt3-typecheck-eslint/app.vue
  10:7  error  'hoge' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 1 problems (1 error)

info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
husky - pre-commit script failed (code 1)
```

package.jsonの`lint-staged`で`yarn type-check`を実行したかったのですがよく分からんエラーが出るので

./husky/pre-commitで下記のように、`yarn type-check`を実行した後に`yarn lint-staged`を実行するようにしました。

```bash
#!/usr/bin/env sh

yarn type-check
yarn lint-staged
```

tsconfig.jsonとeslint.config.mjsはnuxtのデフォルトをそのままimport/extendsしてるだけですが、あれこれカスタマイズして複雑化してしまうより良いかもしれません。

* tsconfig.json

```json
{
  // https://nuxt.com/docs/guide/concepts/typescript
  "extends": "./.nuxt/tsconfig.json"
}
```

* eslint.config.mjs

```js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
```
