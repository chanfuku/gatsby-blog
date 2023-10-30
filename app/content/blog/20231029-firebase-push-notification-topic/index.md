---
title: Firebase Admin SDK for PHPの使い方メモ
date: "2023-10-29T11:12:03.284Z"
description: ""
tags: ["Firebase"]
---

業務で`Firebase Admin SDK for PHP`を使ったPUSH通知を実装したのでメモしておきます。

### Firebase Admin SDK for PHP

https://firebase-php.readthedocs.io/en/latest/index.html


### サンプルコード

```php
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;

class MyService
{
    public function __construct(Messaging $messaging)
    {
        $this->messaging = $messaging;
    }

    // 一つのデバイスに送信する
    public function sentToOneDevice()
    {
      $notification = [
        'title' => 'タイトルです',
        'body' => 'ボディです',
      ];
      $data = [
        '何らかのkey' => '何らかのvalue'
      ];
      $deviceToken = 'xxxxxxxxxxx';
      $message = CloudMessage::withTarget('token', $deviceToken)
          ->withNotification($notification)
          ->withData($data)

      $this->messaging->send($message);
    }

    // 複数のデバイスに送信する
    public function sendToMultiDevices()
    {
      $notification = [
        'title' => 'タイトルです',
        'body' => 'ボディです',
      ];
      $message = CloudMessage::new()->withNotification($notification);
      $deviceTokens = [
        'xxxxxxxx',
        'yyyyyyyy',
      ];
      $this->messaging->sendMulticast($message, $deviceTokens);
    }

    // デバイストークンをトピックに登録する
    public function subscribeToTopic()
    {
      $topic = 'news';
      $deviceToken = 'xxxxxxxxxxx';
      $this->messaging->subscribeToTopic($topic, $deviceToken);
    }

    // トピックを使って送信する
    public function sendToTopic()
    {
      $topic = 'news';
      $notification = [
        'title' => 'タイトルです',
        'body' => 'ボディです',
      ];
      $message = CloudMessage::withTarget('topic', $topic)
          ->withNotification($notification);
      $this->messaging->send($message);
    }
}

```

めちゃめちゃざっくりですが大体こんな感じです。

Firebase Admin SDK for PHPのインストール方法やセットアップ方法は省略してます。

### トピックを使うと大量送信が出来そう

Firebase のCloudMessagingを使って複数端末に同じ内容のPUSH通知を送信したいという時は、「トピック」を使うと結構簡単に出来ます。

- トピックについて
<a href="https://firebase.google.com/docs/cloud-messaging/js/topic-messaging?hl=ja" target="_blank">
https://firebase.google.com/docs/cloud-messaging/js/topic-messaging?hl=ja
</a>

たとえば、地域の潮汐予測アプリのユーザーは、「潮流アラート」トピックを選択し、指定した地域が海釣りに最適な状況になったときに通知を受信することができます。

スポーツアプリのユーザーは、お気に入りのチームの実況ゲームスコアの自動更新にサブスクライブできます。(以下公式ドキュメントから引用)

要するに、複数の端末に対して、トピック単位でメッセージを通知することが出来る、という便利な機能です。

### クライアントアプリをトピックにサブスクライブします。

- ios(swift)
https://firebase.google.com/docs/cloud-messaging/ios/topic-messaging?hl=ja

```
Messaging.messaging().subscribe(toTopic: "weather") { error in
  print("Subscribed to weather topic")
}
```

- android(Kotlin)
https://firebase.google.com/docs/cloud-messaging/android/topic-messaging?hl=ja

```
Firebase.messaging.subscribeToTopic("weather")
    .addOnCompleteListener { task ->
        var msg = "Subscribed"
        if (!task.isSuccessful) {
            msg = "Subscribe failed"
        }
        Log.d(TAG, msg)
        Toast.makeText(baseContext, msg, Toast.LENGTH_SHORT).show()
    }
```

- Flutter

```
await FirebaseMessaging.instance.subscribeToTopic("topic");
```

- Web (Javascript)
https://firebase.google.com/docs/cloud-messaging/js/topic-messaging?hl=ja

```js
// These registration tokens come from the client FCM SDKs.
const registrationTokens = [
  'YOUR_REGISTRATION_TOKEN_1',
  // ...
  'YOUR_REGISTRATION_TOKEN_n'
];

// Subscribe the devices corresponding to the registration tokens to the
// topic.
getMessaging().subscribeToTopic(registrationTokens, topic)
  .then((response) => {
    // See the MessagingTopicManagementResponse reference documentation
    // for the contents of response.
    console.log('Successfully subscribed to topic:', response);
  })
  .catch((error) => {
    console.log('Error subscribing to topic:', error);
  });
```

Firebsae Client SDKではなく、Firebase Admin SDKのメソッドなので、Node.jsのサーバー環境が必要です。

なぜWebだけClient SDKでtopicのサブスクライブを実装出来ないのかは分からないですが、なんかセキュリティの懸念があるのかも（知らんけど）
