---
title: 【Terraform】tfenvでバージョン管理する
date: "2024-11-20T11:12:03.284Z"
description: "tfenvを使えば簡単にTerraformのバージョンを管理出来ます"
tags: ["Terraform"]
---

rbenvやnodenvの様に、各技術のバージョンマネージャーは十中八九世の中に存在する。

Terraformのバージョンマネージャーはtfenv、ということを恥ずかしながら今日初めて知ったのでメモ。

### tfenv

<a href="https://github.com/tfutils/tfenv" target="_blank">
https://github.com/tfutils/tfenv
</a>

### よく使うコマンド

- インストール済のterraformをunlink(解除)する

```bash
brew unlink terraform
```

- tfenvをインストール

```bash
brew install tfenv
```

- インストール済のTerraformバージョン確認

```bash
tfenv list
```

- インストール可能なTerraformバージョン確認

```bash
tfenv list-remote
```

- バージョンを指定してインストール

```bash
tfenv install {version}
```

- Terraformのバージョン変更

```bash
tfenv use {version}
```

- Terraformのバージョン確認

```bash
terraform --version
```
