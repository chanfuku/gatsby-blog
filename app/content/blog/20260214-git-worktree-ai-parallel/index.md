---
title: "【Git Worktree】 AIエージェントに並列実装してもらうための必須技術"
date: "2026-02-14T09:55:00.000Z"
description: "CursorやClaude Codeで並列実装する前に押さえたい、git worktreeの実践メモ"
tags: ["Git", "AIエージェント"]
---

# Cursor/Claude Codeで並列実装するなら、まずgit worktreeを使う

CursorやClaude CodeなどのAIエージェントを使って並列実装を進めるなら、`git worktree` はほぼ必須だと感じました。

実際に触って学んだことを、忘れないうちにメモしておきます。

## 新しいブランチを作成しながらworktreeを追加
パスに設定した名前のディレクトリが作成される。../を付ける理由は、プロジェクトのディレクトリと同階層にworktreeのディレクトリを作成した方が混乱しにくいから、../を付ける場合が多い。

```bash
git worktree add -b <新ブランチ名> <パス>
```

実際使う場合はこんな感じ
```
git worktree add -b feature/git-worktree-1 ../gatsby-blog-feature-git-worktree-1
git worktree add -b feature/git-worktree-2 ../gatsby-blog-feature-git-worktree-2
cd ../gatsby-blog-feature-git-worktree-1 ←feature/git-worktree-1をcheckoutした状態になる
cd ../gatsby-blog-feature-git-worktree-2 ←feature/git-worktree-2をcheckoutした状態になる
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

## 感想

- `node_modules` や `dist` など `.gitignore` 管理のファイルはコピーされないので、worktree追加後に個別で環境構築が必要。
- worktreeを切り替える専用コマンドはなく、実態としてはディレクトリ移動するだけ。シンプルで直感的。
- 複数プロジェクトでworktreeを使うなら、worktree名に `<プロジェクト名>` のprefixを付けるほうが混乱しにくい。
- もしくは、プロジェクトの上位にworktree専用の親ディレクトリを作る運用もわかりやすい。

```text
├── my-app-worktree
│   ├── my-app            ← git cloneした本体(main, master)
│   ├── feature-xxx       ← worktree
│   ├── feature-yyy       ← worktree
│   ├── feature-zzz       ← worktree
```

- なぜか何回も `worktree` を `workspace` と打ち間違えやすい。
