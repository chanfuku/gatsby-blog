---
title: 【Laravel】悪いこと言わないからSelect * はやめとこう
date: "2024-08-24T11:12:03.284Z"
description: "改めて...."
tags: ["Laravel", "PHP"]
---

最近業務で改めて`Select *`は危険だなと思ったのでメモしておきます。

下記の様に、userテーブルとuser_profileテーブルが1対1の関係であるとします。

```sql
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_profiles_user_id_foreign` (`user_id`),
  CONSTRAINT `user_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Userモデルには下記のようにuserProfileを取得するためのrelationが定義されているとします。

```php
<?php

namespace App\Models;

class User
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function userProfile()
    {
        return $this->hasOne(UserProfile::class);
    }
}
```

例えば、ユーザーに荷物を送付するために、伝票にユーザーの住所を記載するプログラムを想像します。

```php

// 伝票に住所を記載する
public function writeAddressToInvoice(int $user_id)
{
// ユーザーがいない、または住所がない場合はエラーを返します
$user = User::join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
    ->whereNotNull('user_profiles.address')
    ->findOrFail($user_id);

// UserProfileを取得する
$user_profile = $user->userProfile;

// 伝票テーブルに住所を書き込みます
Invoice::create([
  'user_id' => $user->id,
  'address' => $user_profile->address,
]);
.
.
.
}
```

いざ運用していると、伝票に記載されている住所が全然違うよ！という問い合わせがどこかのタイミングから頻発しそうです（想像）。

どこかのタイミングというのは、

何らかのエラーによって、usersテーブルのidとuser_profilesテーブルのidがずれてしまった時です。

usersテーブルとuser_profilesテーブルのidが一致している場合は上記のコードは運良くちゃんと動作するのでテストで気付かれなかったりします。

なぜ、usersテーブルのidとuser_profilesテーブルのidがずれるとエラーになってしまうでしょうか。

下記のように、usersテーブルのidとuser_profilesテーブルのidがずれたデータを準備します。

```sql
-- users.id = 1を登録
insert into `users` (`id`, `name`, `email`) values (1, '名前1', '111@111.com');
-- users.id = 1のuser_profileを登録 ※但し、user_profiles.id = 1は欠番になっていると仮定し、user_profiles.id = 2で登録する
insert into `user_profiles` (`id`, `user_id`, `address`) values (2, 1, '住所1');

-- users.id = 2を登録
insert into `users` (`id`, `name`, `email`) values (2, '名前2', '222@222.com');
-- users.id = 2のuser_profileを登録 ※但し、user_profiles.id = 2は埋まっているので、user_profiles.id = 3で登録する
insert into `user_profiles` (`id`, `user_id`, `address`) values (3, 2, '住所2');
```

writeAddressToInvoice($user_id)を実行し、発行されるクエリをデバッグしてみます。

```sql
-- users.id = 1と仮定します
-- クエリ1: userを取得
select * from `users`
inner join
  `user_profiles` on `users`.`id` = `user_profiles`.`user_id`
where
  `user_profiles`.`address` is not null
  and `users`.`id` = 1 limit 1

-- クエリ2: userProfileを取得
select * from `user_profiles`
where
  `user_profiles`.`user_id` = 2
  and `user_profiles`.`user_id` is not null limit 1
```

クエリ1はuser_id = 1のデータを取得しているので、意図した通りになっていそうでぱっと見問題なさそうです。

一旦置いておいて、クエリ2で`where `user_profiles`.`user_id` = 2`が指定されているので、

user_id = 1のデータを取得したつもりが、user_id = 2という別のユーザのデータを取得してしまっています。

これは、クエリ1でselect * をしているため、クエリ結果にidが2つ(`users.id`, `user_profiles.id`)が存在するため、

idが`user_profiles.id`の値で上書きされたことで、

結果的に`$user->userProfile`で、意図せず`user_profiles.user_id` = 2のデータを取得してしまった、ということになります。

このバグは下記のように２つの回避策があります。

1は1回のクエリ発行で済むのに対して、2は2回発行することになるので1の方がパフォーマンス面では良さそうですが、可読性は2の方が良さそうなので、好みになるかもしれません。

1. select * をやめてカラムを指定する

```php
$user = User::select(['users.id as user_id', 'user_profiles.address'])
    ->join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
    ->whereNotNull('user_profiles.address')
    ->findOrFail($user_id);

$address = $user['address'];
```

2. joinをやめてwithを使う

```php
$user = User::with([
    'userProfile' => function ($query) {
        $query->whereNotNull('address');
    }
])->findOrFail($user_id);

$address = $user->userProfile->address;
```

withを使えばSelect * でも問題なさそうですが、誰かがjoinを追加したらバグになってしまう、ということは日々の運用・改修の中でありえそうです。

なので、いずれにしてもselect *をしていると思わぬバグを生みかねないため、

結論、<strong>Select * は危険だからやめといた方が無難</strong>というお話でした。

### 今回の検証のために作成したgithub repo
<a href="https://github.com/chanfuku/docker-laravel11-nginx-mysql8" target="_blank">
https://github.com/chanfuku/docker-laravel11-nginx-mysql8
</a>
