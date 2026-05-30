---
title: 【PostgreSQL】氏名曖昧検索用のカラムを作成した
date: "2026-05-30T11:12:03.284Z"
description: "氏名の曖昧検索用に、ひらがな・全角英数などを正規化した translate_full_name カラムをマイグレーションで追加し、検索時に使う方法をメモした"
tags: ["Postgresql", "TypeORM", "Typescript"]
---

ユーザー氏名を曖昧検索する機能を作るとき、検索欄では「やまだ」、DB には「ヤマダ」…みたいに文字の揺れがあるとヒットしません。

サンプルとして、`users` テーブルに `translate_full_name` という生成列を足して、検索時は入力文字列も同じルールで変換してから、このカラムに `ILIKE` で検索をかけます。

## マイグレーション

生成列（`STORED`）を 1 本の SQL で追加します。`first_name` と `last_name` を `||` でつないだ文字列を `TRANSLATE` した結果が入ります（姓と名の間にスペースなどは入れていません）。

```sql
ALTER TABLE "users"
ADD COLUMN "translate_full_name" text GENERATED ALWAYS AS (
  TRANSLATE(
    "first_name" || "last_name",
    'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゕゖ０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ！＃＄％＆（）＊＋，－．／：；＜＝＞？＠［］＾＿｛｜｝～',
    'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヵヶ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_{|}~'
  )
) STORED NOT NULL;
```

TypeORM なら `queryRunner.query` で流すだけです。生成列は Entity の `@Column` だけだと表現しづらかったので、生 SQL にしています。

```typescript
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddTranslateFullName1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "translate_full_name" text GENERATED ALWAYS AS (
        TRANSLATE(
          "first_name" || "last_name",
          'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゕゖ０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ！＃＄％＆（）＊＋，－．／：；＜＝＞？＠［］＾＿｛｜｝～',
          'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヵヶ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_{|}~'
        )
      ) STORED NOT NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "translate_full_name"`,
    )
  }
}
```

`GENERATED ALWAYS AS ... STORED` なので、`first_name` / `last_name` を更新すれば `translate_full_name` も勝手に追従します。アプリから正規化後の文字列を書き込む必要はありません。

### 正規化で何が揃うか

だいたい次の揺れが揃います。

- ひらがな → カタカナ
- 全角英数字 → 半角
- 全角記号 → 半角（表に載っているもの）

`TRANSLATE` は表にない文字はそのままです。漢字（「山」「田」など）や、表に無い記号は変わりません。なので「やまだ」で「山田」姓の人はヒットしません。ひらがな・カタカナ・全角半角の話はかなり楽になります。

### 既存データがあるとき

`users` に既に行がある状態で `ADD COLUMN` すると、全行ぶん式が走って `translate_full_name` が埋まります。件数が多いとマイグレーションだけで結構時間がかかるので、本番はその辺も見ておいた方がよさそうです。

あと、`first_name` / `last_name` が NULL の行があると `NOT NULL` でコケることがあるので、先に NULL がないかだけ確認しておくと安心です。

## 検索

DB 側は `translate_full_name` に正規化済みの値が入っているので、検索キーワードだけ同じ `TRANSLATE` をかけて、`translate_full_name` に `ILIKE` で部分一致させます。

部分一致は `LIKE` ではなく `ILIKE` にしています。`TRANSLATE` では半角英字の大文字小文字は揃わないので（`Yamada` と `yamada` など）、ローマ字が混ざる氏名用です。日本語だけなら `LIKE` でもだいたい同じですが、英字が入る可能性があるなら `ILIKE` の方が無難かな、という感じです。

### SQL

```sql
SELECT
  "users"."id",
  "users"."first_name",
  "users"."last_name"
FROM
  "users"
WHERE
  "users"."translate_full_name" ILIKE '%' || TRANSLATE(
    :keyword,
    'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゕゖ０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ！＃＄％＆（）＊＋，－．／：；＜＝＞？＠［］＾＿｛｜｝～',
    'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヵヶ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_{|}~'
  ) || '%';
```

`:keyword` には画面から送ってきた文字列（例: `やまだ`）をそのまま渡します。

### TypeORM

置換文字列が長いので、定数に切り出しておくのがおすすめです。マイグレーションと検索で同じ文字列を使うのを忘れるとヒットしなくなるので注意です。

```typescript
import { DataSource } from "typeorm"
import { User } from "../entity/User"

const TRANSLATE_FROM =
  "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゕゖ０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ！＃＄％＆（）＊＋，－．／：；＜＝＞？＠［］＾＿｛｜｝～"
const TRANSLATE_TO =
  "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヵヶ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_{|}~"

export async function searchUsersByName(
  dataSource: DataSource,
  keyword: string,
): Promise<User[]> {
  return dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where(
      `user.translate_full_name ILIKE '%' || TRANSLATE(:keyword, :from, :to) || '%'`,
      { keyword, from: TRANSLATE_FROM, to: TRANSLATE_TO },
    )
    .getMany()
}
```

Entity では `translate_full_name` は読むだけにします。

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: "first_name" })
  firstName!: string

  @Column({ name: "last_name" })
  lastName!: string

  @Column({ name: "translate_full_name", insert: false, update: false })
  translateFullName!: string
}
```

`ILIKE '%...%'` は先頭に `%` があるのでインデックスが効きにくいです。ユーザー数が増えてきたら `pg_trgm` など別途検討する、くらいのメモにしておきます。

以上です。
