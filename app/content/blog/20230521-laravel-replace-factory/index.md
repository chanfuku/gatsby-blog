---
title: 【Laravel】Class "Database\Factories\XXXFactory" not found　の解決
date: "2023-05-21T11:12:03.284Z"
description: "Laravel8へのアップグレードでは、factoryをクラスベースの書き方に変更する必要があります。（legacy-factoryを使い続ける場合はそのままでOK)"
tags: ["PHP", "Laravel"]
---

## Laravel 8.x にアップグレードする時

特に影響の可能性が高いのが、下記に記載されているファクトリの変更です。

<a target="_blank" href="https://readouble.com/laravel/8.x/ja/upgrade.html#model-factories">https://readouble.com/laravel/8.x/ja/upgrade.html#model-factories</a>

ドキュメントに記載されているように、`laravel/legacy-factories`をインストールすれば、Laravel7.xの書き方のままで問題ありませんが、

`legacy-factory`という名前にも入っているようにlegacyなので、出来ればLaravel8.xのfactoryの書き方に修正したい、となった時に

以下のサイトが参考になります。

<a target='_blank' href='https://tech.sumzap.co.jp/entry/laravel-version-up'>
https://tech.sumzap.co.jp/entry/laravel-version-up
</a>

<a target='_blank' href='https://zenn.dev/naopusyu/articles/e3e8d010c4e245'>
https://zenn.dev/naopusyu/articles/e3e8d010c4e245
</a>

## factoryの書き方修正でのハマりポイントがあったのでメモ

上記のサイトを参考に、一通りfactoryを書き換えて試しにSeederあるいはTestを実行すると、以下のエラーが出ました。

```bash
  Class "Database\Factories\Eloquent\SampleFactory" not found
```

どうやらSampleFactoryが見つからない様子です。

Factoryのnamespaceを`Database\Factories`から`Database\Factories\Eloquent`に修正してみたが解決しません。

続いて、`composer dump-autoload`も試しましたが駄目でした。

<a href="https://readouble.com/laravel/8.x/ja/database-testing.html" target="_blank">factoryについての</a>ドキュメントを改めて読み込むと、以下の文章が記載されています。

```
HasFactoryトレイトのfactoryメソッドは規約に基づいて、その トレイトが割り当てられているモデルに適したファクトリを決定します。具体的には、Database\Factories名前空間の中でモデル名と一致するクラス名を持ち、サフィックスがFactoryであるファクトリを探します。この規約を特定のアプリケーションやファクトリで適用しない場合は、モデルのnewFactoryメソッドを上書きし、モデルと対応するファクトリのインスタンスを直接返してください。
```

```php
use Database\Factories\Eloquent\SampleFactory;

/**
 * モデルの新ファクトリ・インスタンスの生成
 *
 * @return \Illuminate\Database\Eloquent\Factories\Factory
 */
protected static function newFactory()
{
    return SampleFactory::new();
}
```

次に、対応するファクトリで、modelプロパティを定義します。

```php
use App\Eloquent\Sample;
use Illuminate\Database\Eloquent\Factories\Factory;

class SampleFactory extends Factory
{
    /**
     * モデルと対応するファクトリの名前
     *
     * @var string
     */
    protected $model = Sample::class;
}
```

モデルのnamespaceをデフォルトのnamespaceから変更した場合は上記の対応が必要なようです。

ちょっとしたハマりポイントでした。
