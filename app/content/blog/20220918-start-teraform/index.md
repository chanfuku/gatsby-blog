---
title: Terraform + AWSのチュートリアルをやって学んだことメモ
date: "2022-09-19T11:12:03.284Z"
description: "Terraformとは、HashiCorp社により開発されているオープンソースのインフラ自動構築ツールです"
tags: ["AWS", "Terraform"]
---

Terraformとは、HashiCorp社により開発されているオープンソースのインフラ自動構築ツールです。

AWSなどのクラウドサービス上のインフラリソース（サーバやネットワークなど）をコードで定義することで、

オペレーションミスを防ぎ、インフラ構築作業の効率化を図ることが出来ます。

業務でがっつりインフラ構築をする機会はないのですが、多少は知識がないと色々と業務に支障があるので、

まずは最初の一歩ということで、Terraform + AWSのチュートリアルをやってみました。

## チュートリアルの紹介
<a href="https://learn.hashicorp.com/collections/terraform/aws-get-started" target="_blank">
Get Started - AWS
</a>

8つのセクションに分かれていて、大体1時間程で終わるかと思います。

特にハマるポイントもなく、`terraform apply`を実行するとTerraformでEC2インスタンスを作成・更新が出来るので、terraformでインフラ構築してみた感は味わえます。

ただ、Terraformの設定ファイル(main.tf)の記述ルールのボリュームは膨大で相当な学習コストがかかりそうなので、

取り急ぎ、チュートリアルの中で登場するメインどころの３つのブロックについて自分なりの解釈をメモします。

チュートリアルの中で使うmain.tfはこんな感じです↓

#### main.tf
```yaml
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "us-west-2"
}

resource "aws_instance" "app_server" {
  ami           = "ami-830c94e3"
  instance_type = "t2.micro"

  tags = {
    Name = "ExampleAppServerInstance"
  }
}
```

## Terraform Blockについて
<a href="https://www.terraform.io/language/settings" target="_blank">
https://www.terraform.io/language/settings
</a>

`terraform {}`にterraforｍ自体の設定(version等)を記述します。`terraform`内ではvariablesは使えません。

`required_providers`を必ず定義する必要があり、必須のproviderを`required_proviers`に記述します。

チュートリアルではawsをrequired_providersに定義しています。`required_providers`は少なくとも１つのproviderを定義する必要があり、providerの名前はmodule内でユニークである必要があります。チュートリアルでは`aws`と命名していますが、仮に`test`に命名変更し、45行目も`test`に変更しても動作します。

また、`required_provider`は`source`と`version`という子要素を保持します。

`source`は利用するproviderのaddress(例えばhashicorp/aws)を定義します。`version`はsourceのversionです。

`source`は`[<HOSTNAME>/]<NAMESPACE>/<TYPE>`の形式で記述します。

`hashicorp/aws`は`registry.terraform.io/hashicorp/aws`のshorthandです。public registyは<a href="https://registry.terraform.io/" target="_blank">こちら</a>にあります。AWS以外にもAzureやkubernetis等もあります。

## Providersについて
<a href="https://www.terraform.io/language/providers/configuration" target="_blank">
https://www.terraform.io/language/providers/configuration
</a>

terraformとSaaS等のクラウドサービスとを連携させるための定義です。

チュートリアルではawsというproviderと連携するように定義しています。この`aws`は`local name`と呼ばれ、
`terraform {}`内の`required_providers`で定義しておく必要があります。

## Resourcesについて
<a href="https://www.terraform.io/language/resources/syntax" target="_blank">
https://www.terraform.io/language/resources/syntax
</a>

インフラ構成における各コンポーネント(例えばEC2)の定義を`resources`に記述します。

Resouces ブロックは2種類の文字列(resource_typeとresource_name)を並べて記述します。

チュートリアルでは、resouce_typeを`aws_instance`として、resouce_nameを`app_server`と定義しています。

prefixにあたる`aws_`がproviderのname(チュートリアルではaws)を参照します。

また、resource_typeとresource_nameの組み合わせはmodule内でユニークである必要があります。

`aws_instance`は、EC2インスタンスの作成/更新/削除を行う`hashicorp/aws`のモジュールです。

<a href="https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance" target="_blank">
こちら
</a>に公式docがあります。

`aws_instance`以外にもEC2インスタンスの公開鍵/秘密鍵を作成してくれる
<a href="https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/key_pair" target="_blank">`aws_key_pair`</a>や、Elastic IPを付与してくれる<a href="https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eip" target="_blank">`aws_eip`</a>等もあります。

## Terraformの文法
<a href="https://www.terraform.io/language" target="_blank">
https://www.terraform.io/language
</a>

## Providersごとのdocument

* AWS
<a href="https://registry.terraform.io/providers/hashicorp/aws/latest/docs" target="_blank">
https://registry.terraform.io/providers/hashicorp/aws/latest/docs
</a>

* Azure
<a href="https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs" target="_blank">
https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs
</a>

* kubernetes
<a href="https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs" target="_blank">
https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs
</a>

まだ素人に毛が生えた程度でしか理解出来ていませんが、ここから徐々にレベルを上げていきたいと思います。
