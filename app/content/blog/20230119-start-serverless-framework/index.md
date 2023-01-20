---
title: 【AWS】Serverless Frameworkを使ったLambda開発
date: "2023-01-19T11:12:03.284Z"
description: "Serverless Frameworkを使ってみました"
tags: ["AWS", "Lambda", "Serverless Framework"]
---

### Serverless Framework
Serverless FrameworkとはLambda等のServerless Applicationの構成管理やデプロイをサポートしてくれるツールです。

<a href="https://www.serverless.com/">https://www.serverless.com/</a>

### gettering-started
https://www.serverless.com/framework/docs/getting-started

```bash
$ npm install -g serverless
```

`sls`は`serverless`のaliasなのでここからは`sls`を使っていきます。

`sls create --help`でどんなテンプレートが用意されているのか確認します。
```bash
$ sls create --help
create                          Create new Serverless service
--template / -t                 Template for the service. Available templates:
                                             "aws-clojure-gradle", "aws-clojurescript-gradle", "aws-nodejs", "aws-nodejs-docker", "aws-nodejs-typescript", "aws-alexa-typescript", "aws-nodejs-ecma-script", "aws-python"
                                             "aws-python3", "aws-python-docker", "aws-groovy-gradle", "aws-java-maven", "aws-java-gradle", "aws-kotlin-jvm-maven", "aws-kotlin-jvm-gradle", "aws-kotlin-jvm-gradle-kts"
                                             "aws-kotlin-nodejs-gradle", "aws-scala-sbt", "aws-csharp", "aws-fsharp", "aws-go", "aws-go-dep", "aws-go-mod", "aws-ruby"
                                             "aws-provided"
                                             "tencent-go", "tencent-nodejs", "tencent-python", "tencent-php"
                                             "azure-csharp", "azure-nodejs", "azure-nodejs-typescript", "azure-python"
                                             "cloudflare-workers", "cloudflare-workers-enterprise", "cloudflare-workers-rust"
                                             "fn-nodejs", "fn-go"
                                             "google-nodejs", "google-nodejs-typescript", "google-python", "google-go"
                                             "kubeless-python", "kubeless-nodejs"
                                             "knative-docker"
                                             "openwhisk-java-maven", "openwhisk-nodejs", "openwhisk-php", "openwhisk-python", "openwhisk-ruby", "openwhisk-swift"
                                             "spotinst-nodejs", "spotinst-python", "spotinst-ruby", "spotinst-java8"
                                             "twilio-nodejs"
                                             "aliyun-nodejs"
                                             "plugin"
                                             "hello-world"
```

下記の様に--pathでディレクトリ名が指定できます。

```bash
$ sls create -t aws-nodejs-typescript --path aws-nodejs-typescript
```

今回はテンプレートは指定せずに、`sls`のみで進めました。

### プロジェクトを作成する

`sls`を実行すると、色々と聞かれます。以下の様に選択 and 入力しました
```bash
$ sls
Creating a new serverless project
? What do you want to make? AWS - Node.js - HTTP API
? What do you want to call this project? aws-nodejs-http-api-sample
✔ Project successfully created in aws-nodejs-http-api-sample folder
? What org do you want to add this service to? [Skip]
? Do you want to deploy now? No
```

作成したプロジェクトに移動しnpm installします。

```bash
$ cd aws-nodejs-http-api-sample 

$ npm install
or
$ yarn
```

### デプロイ
serverless.ymlのproviderにregionとprofileを追記します。
東京だったら`ap-northeast-1`でprofileは↑でserverlessでデプロイするawsのprofileです。

```
provider:
  region: {{ your app region }}
  profile: {{ your profile }}
```

```bash
$ sls deploy
...
endpoint: GET - https://xxxxxxx.amazonaws.com/
```

deployコマンド一発で、API Gateway、Lambda、Cloud Watch、Cloud Formationの設定までやってくれます。

また、endpointのURLもコンソールに表示されるのでアクセスするとAPIのレスポンスが確認できます。

deployコマンドを実行後には、`.serverless`というディレクトリがプロジェクト直下に生成されます。

`.serverless`にcloudformationの設定が記載されています。

```bash
$ tree .serverless
.serverless
├── cloudformation-template-create-stack.json
├── cloudformation-template-update-stack.json
├── hello.zip
└── serverless-state.json
```

### aws cli の設定

今回のテーマからは外れてしまいますが、aws cliが未設定の場合は`aws configure`を実行して各項目を入力していきます。

aws cli設定に関する公式docは
<a href="https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-quickstart.html" target="_blank">
コチラ
</a>

AWSのユーザー作成から必要な場合は<a href="https://www.youtube.com/watch?v=KngM5bfpttA" target="_blank">コチラ</a>に動画があります。

```
$ aws configure --profile {{ your aws profile }}
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json
```

例えば、以下のように`test`というprofileを作成すると、`~/.aws/config`や`~/.aws/credentials`に設定が追記されます。

```bash
$ aws configure --profile test
AWS Access Key ID [None]: hoge
AWS Secret Access Key [None]: fuga
Default region name [None]: us-east-1
Default output format [None]: json

$ less ~/.aws/config
[profile test]
region = us-east-1
output = json

$ less ~/.aws/credentials
[test]
aws_access_key_id = hoge
aws_secret_access_key = fuga
```

使うprofileそのものを切り替えるには

```bash
$ export AWS_PROFILE="{{ your profile name }}"
```

### serverless config コマンドで aws cliの設定をする方法
`aws configure --profile {{ your profile name }}`で設定することも出来ますが、以下のように`sls config credentials`コマンドでも出来ます。

```bash
sls config credentials --provider aws --key {{ your access key }} --secret {{ your secret access key }} --profile {{ your profile }}
```

しかしregionやoutputが設定出来ないので`aws configure --profile {{your profile}}`の方が良さそうです。

#### デプロイした関数をinvoke(呼び出す)するには

デプロイすると通常はAPI Gatewayが設定されてAPIのURLが発行されますが、URLがない関数の場合`sls invoku`コマンドで実行出来ます。

```bash
$ sls invoke -f hello
 
# Invoke and display logs:
$ sls invoke -f hello --log

# run your code locally
$ sls invoke local --function functionName
```

### デプロイした関数のlogをfetchしたい時

```bash
$ sls logs -f hello
 
# Tail logs
$ sls logs -f hello --tail
```

### Monitoring(監視)したい

既存のプロジェクト配下で、下記コマンドを実行すると色々聞かれるので進めていきます。

完了すると、<a href="http://app.serverless.com/" target="_blank">serverless dashboard</a>からログやデプロイ状況等を確認出来るようになります。

```bash
$ sls
Running "serverless" from node_modules

Onboarding "aws-nodejs-http-api-sample" to the Serverless Dashboard

? What org do you want to add this service to? xxxxxx
? What application do you want to add this to? [create a new app]
? What do you want to name this application? aws-nodejs-http-api-sample

✔ Your project is ready to be deployed to Serverless Dashboard (org: "xxxxxx", app: "aws-nodejs-http-api-sample")

? Do you want to deploy now? Yes

Deploying aws-nodejs-http-api-sample to stage dev (ap-northeast-1, "default" provider)

✔ Service deployed to stack aws-nodejs-http-api-sample-dev (71s)

dashboard: https://xxxxxxxx
endpoint: GET - https://xxxxxxx
functions:
  hello: aws-nodejs-http-api-sample-dev-hello (225 kB)

What next?
Run these commands in the project directory:

serverless deploy    Deploy changes
serverless info      View deployed endpoints and resources
serverless invoke    Invoke deployed functions
serverless --help    Discover more commands
```

### Serverless Offline
AWS Lambda や API Gatewayをローカル環境でemulate(再現)してくれるプラグインです。

これがあればわざわざデプロイせずに、ローカル環境でデバッグが出来るので開発速度がグッと上がりそうです。

<a href="https://www.serverless.com/plugins/serverless-offline" target="_blank">
https://www.serverless.com/plugins/serverless-offline
</a>

```
$ npm install serverless-offline --save-dev
or
$ yarn add serverless-offline --dev
```

serverlss.ymlの`plugins`に`serverless-offline`を追加してあげます。

#### serverless.yml
```yml
plugins:
  - serverless-offline
```

プロジェクトルートで下記コマンドを実行すると、ローカル環境のendpointが表示されます。

```bash
$ sls offline
Running "serverless" from node_modules

Starting Offline at stage dev (ap-northeast-1)

Offline [http for lambda] listening on http://localhost:3002
Function names exposed for local invocation by aws-sdk:
           * hello: aws-nodejs-http-api-sample-dev-hello

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                                                                         │
   │   GET | http://localhost:3000/                                          │
   │   POST | http://localhost:3000/2015-03-31/functions/hello/invocations   │
   │                                                                         │
   └─────────────────────────────────────────────────────────────────────────┘

Server ready: http://localhost:3000 🚀
```

### remove

プロジェクトルートでこれ↓。LambaからS3からCloudFormationから全部削除されるバルス的なコマンドです。

```
$ sls remove
```

Serverless Frameworkの他にもServerless ConsoleやServerless Cloudというツールもありますが、力尽きたのでここまで。
