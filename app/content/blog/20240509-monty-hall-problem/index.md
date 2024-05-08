---
title: 【GitHub Copilot】モンティーホール問題を検証してみた
date: "2024-05-09T11:12:03.284Z"
description: "モンティーホール問題とは..."
tags: ["GitHub", "その他"]
---

最近知って感動した「モンティーホール問題」について書こうと思います。

GitHub Copilotを使っての検証結果も記載します。

### モンティーホール問題とは

chatgptに聞いてみました。

```
モンティ・ホール問題は、確率論や統計学に関するパズルで、以下のような設定です。

1. 参加者には3つのドアがあり、1つのドアの後ろには賞（通常は車）があり、残りの2つのドアの後ろにはハズレ（通常はヤギなど）があります。
2. 参加者は最初に1つのドアを選択します。
3. 司会者は、参加者が選んだドア以外のドアのうち、ハズレのドアを開けて見せます。
4. この時点で、参加者には選んだドアともう1つのドアが残っています。
5. 司会者は参加者に、選んだドアを変えるか変えないかを選択する機会を与えます。
6. 最後に、参加者が選んだドアが開かれ、その後ろにある賞が与えられます。

この問題で興味深いのは、初めて選んだドアを変えるかどうかです。直感的には違いはないように感じられますが、確率的には違います。実際には、ドアを変えることで当たりの確率が上がります。この問題は確率論や認知心理学の分野でよく取り上げられ、初見の人々にとっては直感に反する結果をもたらすことで有名です。
```

### 検証してみた

GitHub Copilot Chatに以下のようなお願いをしてみました。

```
モンティーホール問題を検証するためのコードを書いてください。
その際下記の3つの条件を満たすようにしてください。

- javascriptで書く
- 1000回分のシミュレーションを行う
- 正解である確率が・不正解の回数をconsole.logで出力する
- do whileは使わない
```

do whileは個人的に好きじゃないので使わないようにしてもらいました。

出来上がったコードは下記になります。

```js
// シミュレーション回数
const simulationCount = 1000;

// 正解・不正解のカウンター
let correctCount = 0;
let incorrectCount = 0;

// シミュレーションを実行する
for (let i = 0; i < simulationCount; i++) {
  // ドアの選択
  const selectedDoor = Math.floor(Math.random() * 3);

  // 正解のドア
  const correctDoor = Math.floor(Math.random() * 3);

  // ホストが開けるドア
  const availableDoors = [0, 1, 2].filter((door) => door !== selectedDoor && door !== correctDoor);
  const openedDoor = availableDoors[Math.floor(Math.random() * availableDoors.length)];

  // ドアの交換
  const switchedDoor = [0, 1, 2].find((door) => door !== selectedDoor && door !== openedDoor);

  // 正解かどうか判定
  if (switchedDoor === correctDoor) {
    correctCount++;
  } else {
    incorrectCount++;
  }
}
console.log(`正解の回数: ${correctCount}`);
console.log(`不正解の回数: ${incorrectCount}`);
```

ふむふむ、なかなか良さそう、GitHub Copilotありがとー。

index.jsに保存し、早速以下の様に実行してみました。

```bash
$ node index.js
```

5回実行した結果

```bash
正解の回数: 676
不正解の回数: 324

正解の回数: 711
不正解の回数: 289

正解の回数: 647
不正解の回数: 353

正解の回数: 634
不正解の回数: 366

正解の回数: 667
不正解の回数: 333
```

大体2/3の確率で正解、1/3の確率で不正解になるはずなので想定通りの結果でした。

要は自分が選んだドアが正解である確率が1/3で、残りの２つのドアが正解である確率が2/3なので、変更すると1/3 から 2/3に 正解確率がUPするわけです。

モンティーホール問題なかなか面白い。アメリカのクイズ番組が元ネタらしいです。最初に気付いた数学者のスティーブン・セルヴィグ (Steve Selvin)さんすごい。
