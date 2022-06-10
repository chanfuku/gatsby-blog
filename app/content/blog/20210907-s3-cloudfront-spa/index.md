---
title: S3 + CloudFront + Route53 でNuxt.jsのSPAを配信する
date: "2021-09-07T22:12:03.284Z"
description: "S3 + CloudFront + Route53 でNuxt.jsのSPAを配信する"
---

タイトルにある通りですが今回は「Nuxt.jsのSPAをAWSのS3 + Cloudfront + Route53で配信」に挑戦してみました。※Nuxt.jsでSPAを作成する方法は割愛します。

先に完成したものをお見せします↓このブログのサブドメイン（nuxt-spa)で公開しました

<a href="https://nuxt-spa.ebato-tech-blog.tk/" target="_blank">`https://nuxt-spa.ebato-tech-blog.tk/`</a>

それでは、手順を記載していきます。

## S3にバケットを作成する

![Image](./img1.png)

![Image](./img2.png)

![Image](./img3.png)

## Nuxt.jsのSPAを作成する

詳細は割愛しますが、node.jsとnpxが入っている環境で「npx create-nuxt-app {プロジェクト名}」を実行し、途中でRendering modeはSPA or SSR？と聞かれるのでSPAを選択してください。こんな感じ↓

![Image](./img4.png)

![Image](./img5.png)

![Image](./img6.png)

![Image](./img7.png)

![Image](./img8.png)

## dist/ 以下をS3にアップロードします

![Image](./img9.png)

![Image](./img10.png)

![Image](./img11.png)

## CloudFrontを設定する

![Image](./img12.png)

![Image](./img13.png)

![Image](./img14.png)

![Image](./img15.png)

上記で証明書が何もプルダウンに出てこない場合は、AWS Certificate Managerで作成する必要があります。上の画像にも表示されている通り、リージョン（us-east-1）で作成する必要があるので要注意。以前「*.ebato-tech-blog.tk」で証明書を取得したので、今回の「nuxt-spa.ebato-tech-blog.tk」もカバーしていることになります。

![Image](./img16.png)

![Image](./img17.png)

![Image](./img18.png)

上記画像のドメイン名に表示されているが、CloudFrontが発行したドメイン名にhttpsでブラウザで表示してみます。今回は、「https://d2g1b4immm849y.cloudfront.net/sample」になります。先程S3にアップロードしたSPAが表示できればCloudFrontの設定は完了です。

## Route53でドメインを割り当てる

![Image](./img19.png)

上記の赤枠の部分が今回割り当てたサブドメインの設定です。AとAAAAの違いはIPv4 or IPv6ということみたいです。レコード名にサブドメインを含めたドメイン名を設定し、値/トラフィックルーティング先にCloudFrontで発行したドメイン名を設定し、しばらく待つと「https://nuxt-spa.ebato-tech-blog.tk/」が表示れました↓

![Image](./img20.png)

![Image](./img21.png)
