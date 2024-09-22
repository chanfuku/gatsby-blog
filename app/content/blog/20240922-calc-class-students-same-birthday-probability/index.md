---
title: 【直感に反する確率の世界】同じクラスに同じ誕生日の生徒が存在する確率を検証してみた
date: "2024-09-22T11:12:03.284Z"
description: "1クラス大体38人位だった記憶があります"
tags: ["Node.js", "その他"]
---

### 突然ですが、38人のクラスで、同じ誕生日の生徒が存在する確率は？

※ 1クラス大体38人位だった記憶があるので38人で話を進めていきます。

YouTubeか何かが元ネタなのですが、最初にこの問題を見た時、

「え？同じクラスに同じ誕生日の人なんていなくないか？相当少ないでしょ。確率的には10%位かな〜？」と直感的に思いました。

ところが正解は...

### 約86%

です...うそだろ!?!?

正解を聞いても納得出来なかった私は実際にJavascriptのコードを書いて検証してみました。

### 検証1: 数学的に確率を計算してみる

逆転の発想的に考えると、以下の考え方で`生徒の誕生日が重複する確率`を求められます。

`生徒の誕生日が重複する確率` = `1 - 全員の誕生日が異なる確率`

`全員の誕生日が異なる確率`を求めるには、

全員の誕生日が重複しないように日にちを選択していく必要があります。

つまり、

1人目の誕生日の候補(365/365)、2人目の誕生日の候補(364/365)、3人目の誕生日の候補(363/365).....38人目の誕生日の候補(328/365)を掛け合わせれば求められます。

これをJavascriptのコードで表すと、以下のようになります。

```js
// クラスの人数
const classSize = 38;
// 全員の誕生日が異なる確率
let probabilitySum;

for (i = 0; i < classSize; i++) {
  const result = (365 - i) / 365;
  // 1回目のループ
  if (!probabilitySum) {
    probabilitySum = result;
    continue;
  }
  probabilitySum = probabilitySum * result;
}

// 生徒の誕生日が重複している確率 = 1 - 全員の誕生日が異なる確率
const answer = ((1 - probabilitySum) * 100).toFixed(2);
console.log(`${classSize}人のクラスで同じ誕生日の生徒が存在する確率は${answer}%`);
```

このコードを実行すると、以下のように表示されました。

```bash
38人のクラスで同じ誕生日の生徒が存在する確率は86.41%
```

<strong>86.41%！！</strong>

しかし、まだ信用出来ない私は更にJavascriptのコードを書いてみました。

### 検証2: 実際に38人のクラスで1万回シミュレーションしてみる

実際に38人の生徒が1~365の間でランダムな値を選んで、重複する確率を出力してみました。

10000回実行してます。

```js
const classSize = 38;
function hasSameBirthday(classSize) {
  const birthdays = new Set();

  for (let i = 0; i < classSize; i++) {
    const birthday = Math.floor(Math.random() * 365) + 1; // 1~365までの乱数を生成
    if (birthdays.has(birthday)) {
      return true; // 同じ誕生日が見つかったらtrue
    }
    birthdays.add(birthday);
  }

  return false; // 全員異なる誕生日ならfalse
}

function calculateProbability(classSize, trials) {
  let sameBirthdayCount = 0;

  for (let i = 0; i < trials; i++) {
    if (hasSameBirthday(classSize)) {
      sameBirthdayCount++;
    }
  }

  return (sameBirthdayCount / trials) * 100; // 同じ誕生日の確率を百分率で返す
}

const classSize = 38;
const trials = 10000; // 1万回試行して確率を検証

const probability = calculateProbability(classSize, trials);
console.log(`38人のクラスで同じ誕生日の生徒がいる確率: ${probability.toFixed(2)}%`);
```

実行してみると、

```bash
38人のクラスで同じ誕生日の生徒がいる確率: 86.58%
```

<strong>また`86%!!`</strong>

2パターンのコードで共に約86%という数字が出てきたので、すみません私の感覚が間違ってましたと認めざるを得ません。

他にも`直感に反する確率`があればコードを書いて検証していきたいと思います。

