---
title: 【PostgreSQL】氏名曖昧検索用のカラムを作成した
date: "2026-05-30T11:12:03.284Z"
description: "氏名の曖昧検索用に、ひらがな・全角英数などを正規化した translate_full_name カラムをマイグレーションで追加し、検索時に使う方法をメモした"
tags: ["Postgresql", "TypeORM", "Typescript"]
---

ユーザー氏名の曖昧検索では、入力側と DB 側で文字の揺れ（ひらがな／カタカナ、全角／半角など）が揃っていないとヒットしにくくなります。

そのため `users` テーブルに、氏名を正規化して保持する `translate_full_name` カラムを追加し、曖昧検索時は検索キーワードも同じルールで変換したうえで、このカラムに対して検索するようにしました。

## マイグレーションでカラムを追加する

マイグレーションでは、下記の SQL を実行して生成列（STORED）を追加します。

`first_name` と `last_name` を連結し、PostgreSQL の `TRANSLATE` で正規化した値が自動的に入ります。

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

TypeORM のマイグレーションで実行する場合は、例えば次のように `queryRunner.query` で流します。

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

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
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "translate_full_name"`
    );
  }
}
```

マイグレーションの実行は `typeorm migration:run`（DataSource の設定に応じた CLI）です。生成列は Entity の `@Column` だけでは表現しづらいため、今回のように生 SQL で追加する形にしています。

`GENERATED ALWAYS AS ... STORED` にしているので、`first_name` や `last_name` が更新されると `translate_full_name` も追従して更新されます。アプリ側で正規化値を書き込む必要はありません。

## translate_full_name とは

`translate_full_name` は **GENERATED ALWAYS AS … STORED** の生成列です。

式では `first_name` と `last_name` を `||` で連結した文字列（区切り文字は入れません）を入力とし、PostgreSQL の `TRANSLATE` で正規化した結果を格納します。`STORED` なので計算結果はディスク上に物理保存され、検索時は毎回 `TRANSLATE` を掛け直す必要はありません。

アプリ側で同じ置換ルールを定数化している場合（例: `fuzzyNameSearchTranslate` の from / to）は、**DB の `TRANSLATE` と検索クエリで同じ文字列を使う**ことが重要です。

## 正規化で揃える内容

正規化の内容は、会社名の曖昧検索などで既に使っている `TRANSLATE` の置換表と同じ想定です。ざっくり次の揺れを揃えます。

- **ひらがな → カタカナ**（置換表に含まれる文字）
- **全角英数字 → 半角英数字**（`０１２…` → `012…`、`ＡＢＣ…` → `ABC…` など）
- **全角記号 → 半角記号**（`！＃＄…` → `!#$…` など、表に載っている記号）

`TRANSLATE` は置換表にない文字はそのまま残します。**漢字**（例: 「山田」の「山」「田」）や、表に無い記号・空白などはこの処理では変わりません。氏名に漢字が含まれる場合は、ひらがな／カタカナ・全角半角の揺れは揃えやすくなりますが、漢字そのものの表記ゆれ（異体字・旧字体など）は別途検討が必要です。

## 既存データがある場合のマイグレーション

`users` に既存行がある状態で、初回の `ALTER TABLE … ADD COLUMN` を実行すると、**全行分**について生成列の式が評価され、`translate_full_name` が埋められます。`STORED` 列のため、行数が多いテーブルでは **マイグレーションに時間がかかる**可能性があります。本番適用時はメンテナンス時間やロックの影響も念頭に置いておくとよいです。

また、マイグレーション後も `first_name` / `last_name` を更新するたびに、その行の `translate_full_name` は自動で再計算されます。

`first_name` や `last_name` が **NULL** の行があると、連結結果が NULL になり `NOT NULL` 制約と矛盾してマイグレーションが失敗することがあります。適用前に NULL の有無を確認するか、データを直してから実行してください。

## 曖昧検索の考え方

検索時は次の2点を揃えます。

1. 氏名はすでに `translate_full_name` に正規化済み
2. ユーザーが入力した検索文字列も、**同じ `TRANSLATE` の置換ルール**で変換する

例えば DB に「ヤマダタロウ」（姓・名をカタカナで登録し、検索用に正規化済み）と入っているユーザーに対し、画面上で「やまだ」「ヤマダ」などと入力しても、正規化後の文字列同士で部分一致しやすくなります。姓・名を漢字で持っている場合は、入力も漢字を含めないとヒットしない点に注意してください。

## 検索クエリのサンプル（SQL）

プレースホルダに渡すキーワードを、カラム生成時と同じ `TRANSLATE` で変換し、`translate_full_name` に部分一致させる例です。

```sql
SELECT
  "users"."id",
  "users"."first_name",
  "users"."last_name"
FROM
  "users"
WHERE
  "users"."translate_full_name" LIKE '%' || TRANSLATE(
    :keyword,
    'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゕゖ０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ！＃＄％＆（）＊＋，－．／：；＜＝＞？＠［］＾＿｛｜｝～',
    'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヵヶ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_{|}~'
  ) || '%';
```

`:keyword` にはフロントから送られた氏名の一部（例: `やまだ`）をそのまま渡します。

## 検索クエリのサンプル（TypeORM）

`createQueryBuilder` の `where` に同じ条件を書く例です。置換文字列が長いので、マイグレーションと同様に定数ファイルや private メソッドに切り出しておくと読みやすくなります。

```typescript
import { DataSource } from "typeorm";
import { User } from "../entity/User";

const TRANSLATE_FROM =
  "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゕゖ０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ！＃＄％＆（）＊＋，－．／：；＜＝＞？＠［］＾＿｛｜｝～";
const TRANSLATE_TO =
  "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヵヶ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_{|}~";

export async function searchUsersByName(
  dataSource: DataSource,
  keyword: string
): Promise<User[]> {
  return dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where(
      `user.translate_full_name LIKE '%' || TRANSLATE(:keyword, :from, :to) || '%'`,
      { keyword, from: TRANSLATE_FROM, to: TRANSLATE_TO }
    )
    .getMany();
}
```

Entity 側では `translate_full_name` を読み取り専用としてマッピングしておきます（INSERT / UPDATE では触らない想定です）。

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "first_name" })
  firstName!: string;

  @Column({ name: "last_name" })
  lastName!: string;

  @Column({ name: "translate_full_name", insert: false, update: false })
  translateFullName!: string;
}
```

## 補足

- `LIKE '%...%'` はインデックスが効きにくいので、件数が増えたら `pg_trgm` や検索専用の仕組みを検討する余地があります。
- 置換用の文字列は、生成列の定義・検索クエリ・アプリの定数で**必ず同一**にしてください。片方だけ変えるとヒットしなくなります。

以上です。
