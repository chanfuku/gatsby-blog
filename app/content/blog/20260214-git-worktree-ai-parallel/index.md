---
title: "【Git Worktree】 AIエージェントに並列実装してもらうための必須技術"
date: "2026-02-14T09:55:00.000Z"
description: "CursorやClaude Codeで並列実装する前に押さえたい、git worktreeの実践メモ"
tags: ["Git", "AIエージェント"]
---

## Cursor/Claude Codeで並列実装するなら、まずgit worktreeを使う

CursorやClaude CodeなどのAIエージェントを使って並列実装を進めるなら、`git worktree` はほぼ必須だと感じました。

実際に触って学んだことを、忘れないうちにメモしておきます。

## 新しいブランチを作成しながらworktreeを追加
```bash
git worktree add -b <新ブランチ名> <パス>
```

パスに設定した名前のディレクトリが作成される。../を付ける理由は、プロジェクトのディレクトリと同階層にworktreeのディレクトリを作成した方が混乱しにくいから、../を付ける場合が多い。


実際使う場合はこんな感じ
```bash
# worktreeを2つ作成
git worktree add -b feature/git-worktree-1 ../gatsby-blog-feature-git-worktree-1
git worktree add -b feature/git-worktree-2 ../gatsby-blog-feature-git-worktree-2

# worktreeに移動するとブランチをチェックアウトした状態になる
cd ../gatsby-blog-feature-git-worktree-1
cd ../gatsby-blog-feature-git-worktree-2
```

## 現在のworktreeをリスト表示

```bash
git worktree list
```

## worktreeの詳細情報を表示

```bash
git worktree list --porcelain
```

## worktreeを削除

```bash
git worktree remove <パス>
```

フォルダをrm -rfで手動削除すると残骸が残るので、その場合は`git worktree prune`を実行すると綺麗になる。

## 感想

- `node_modules` や `dist` など `.gitignore` 管理のファイルはコピーされないので、worktree追加後に個別で環境構築が必要。
- worktreeを切り替える専用コマンドはなく、実態としてはディレクトリ移動するだけ。シンプルで直感的。
- worktreeを切り替えた状態で、他のworktreeで使用中のブランチをチェックアウトしようとすると、`xxx is already used by worktree` エラーになる。要は、同じブランチを複数のworktreeでチェックアウトできない。
- 複数プロジェクトでworktreeを使うなら、worktree名に `<プロジェクト名>` のprefixを付けるほうが混乱しにくい。
- もしくは、プロジェクトの上位にworktree専用の親ディレクトリを作る運用もわかりやすい。

```text
├── my-app-worktree
│   ├── my-app            ← git cloneした本体(main, master)
│   ├── feature-xxx       ← worktree
│   ├── feature-yyy       ← worktree
│   ├── feature-zzz       ← worktree
```

- どうでもいいが、なぜか何回も `worktree` を `workspace` と打ち間違えてしまう。
