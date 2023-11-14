---
title: 【Flutter】はじめての環境構築
date: "2023-11-14T11:12:03.284Z"
description: "はじめてFlutterの環境構築したのでメモ"
tags: ["Flutter"]
---

業務でFlutterアプリのローカル環境を構築したのでメモ。

iOS用のセットアップのみです。Androidは必要になった時に対応します。

### Flutter

公式Documentは
<a href="https://docs.flutter.dev/" target="_blank">
https://docs.flutter.dev/
</a>

### fvmを使ってFlutterのversion管理

公式doc通りにFlutterを入れるとversion管理が面倒なので、fvm等のバージョン管理ツールを入れたほうがいいです。

fvmとは、`Flutter Version Management`の略で、Flutter のversionを簡単に切り替えられるCLIツールです。

Rubyのrbenvやnode.jsのnvmに相当するアレです。

<a href="https://fvm.app/docs/getting_started/installation" target="_blank">
https://fvm.app/docs/getting_started/installation
</a>

```bash
# fvm install
brew tap leoafarias/fvm
brew install fvm
dart pub global activate fvm
# flutter version指定install
fvm install <バージョン>
# flutter version設定
fvm use <バージョン>
fvm flutter --version
# flutterコマンドはfvm flutterのあとに入力する
fvm flutter {コマンド｝
# global 設定
fvm global <バージョン>
flutter {コマンド｝
```

私の場合は、最初にFlutterをhomebrewでインストールしてしまったため、以下のように`.zhsrc`にてPATHをhomebrewからfvmに修正しました。

```bash
### Flutter
# export PATH="/opt/homebrew/bin/flutter:$PATH"
export PATH="/Users/{your name}/fvm/default/bin:$PATH"
```

書き換えたら`source ~/.zshrc`を忘れずに。

### XCode/Simulator/cocoapodsをインストールする

iOS Flutterアプリ開発の必須アイテム達。

<a href="https://docs.flutter.dev/get-started/install/macos#ios-setup" target="_blank">
https://docs.flutter.dev/get-started/install/macos#ios-setup
</a>

```bash
# Simulatorをインストールする
xcodebuild -downloadPlatform iOS
# Simulatorを起動する
open -a Simulator
# cocoapodsをインストールする
sudo gem install cocoapods
```

# Flutterコマンド

```bash
# Flutterアプリ開発に必要な環境が整っているかどうかをチェックしてくれる
$ flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.7.2, on macOS 14.0 23A344 darwin-arm64, locale ja-JP)
[✗] Android toolchain - develop for Android devices
    ✗ Unable to locate Android SDK.
      Install Android Studio from: https://developer.android.com/studio/index.html
      On first launch it will assist you in installing the Android SDK components.
      (or visit https://flutter.dev/docs/get-started/install/macos#android-setup for detailed
      instructions).
      If the Android SDK has been installed to a custom location, please use
      `flutter config --android-sdk` to update to that location.

[✓] Xcode - develop for iOS and macOS (Xcode 15.0.1)
[✓] Chrome - develop for the web
[!] Android Studio (not installed)
[✓] VS Code (version 1.83.1)
[✓] Connected device (2 available)
[✓] HTTP Host Availability
```

```bash
# キャッシュクリア ※プロジェクトのルートフォルダ直下で実行する
$ flutter clean && flutter pub cache repair
```

```bash
# deviceId表示
fvm flutter devices
# アプリ起動
fvm flutter run -d {deviceId}
```
