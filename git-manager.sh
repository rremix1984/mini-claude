#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "错误：当前目录不是 Git 仓库：$ROOT_DIR"
  exit 1
fi

current_branch() {
  git rev-parse --abbrev-ref HEAD
}

default_remote() {
  git remote | head -n 1
}

print_help() {
  cat <<'EOF'
用法：
  ./git-manager.sh <命令> [参数]

命令：
  status
      查看仓库状态

  pull [remote] [branch]
      拉取最新代码并 rebase（默认：origin + 当前分支）

  push [remote] [branch]
      推送当前分支（默认：origin + 当前分支）

  fetch [remote]
      获取远程更新（默认：origin）

  commit "<message>"
      执行 git add -A + git commit

  sync "<message>" [remote] [branch]
      一键同步：add/commit -> pull --rebase -> push

  log [n]
      查看最近提交（默认 10 条）

  branches
      查看本地/远程分支

  remote
      查看远程仓库信息

  help
      显示帮助
EOF
}

ensure_remote() {
  local remote="$1"
  if [[ -z "$remote" ]]; then
    echo "错误：没有可用的远程仓库，请先配置 remote。"
    exit 1
  fi
}

cmd="${1:-help}"

case "$cmd" in
  status)
    git status
    ;;

  pull)
    remote="${2:-$(default_remote)}"
    branch="${3:-$(current_branch)}"
    ensure_remote "$remote"
    echo "正在拉取：$remote/$branch"
    git pull --rebase "$remote" "$branch"
    ;;

  push)
    remote="${2:-$(default_remote)}"
    branch="${3:-$(current_branch)}"
    ensure_remote "$remote"
    echo "正在推送：$branch -> $remote/$branch"
    git push "$remote" "$branch"
    ;;

  fetch)
    remote="${2:-$(default_remote)}"
    ensure_remote "$remote"
    echo "正在获取远程更新：$remote"
    git fetch "$remote" --prune
    ;;

  commit)
    message="${2:-}"
    if [[ -z "$message" ]]; then
      echo '错误：请提供提交信息，例如：./git-manager.sh commit "feat: add xxx"'
      exit 1
    fi
    git add -A
    git commit -m "$message"
    ;;

  sync)
    message="${2:-}"
    remote="${3:-$(default_remote)}"
    branch="${4:-$(current_branch)}"
    if [[ -z "$message" ]]; then
      echo '错误：请提供提交信息，例如：./git-manager.sh sync "feat: update"'
      exit 1
    fi
    ensure_remote "$remote"
    echo "正在提交本地变更..."
    git add -A
    if ! git diff --cached --quiet; then
      git commit -m "$message"
    else
      echo "没有可提交内容，跳过 commit。"
    fi
    echo "正在拉取并 rebase：$remote/$branch"
    git pull --rebase "$remote" "$branch"
    echo "正在推送：$branch -> $remote/$branch"
    git push "$remote" "$branch"
    ;;

  log)
    n="${2:-10}"
    git log --oneline --decorate -n "$n"
    ;;

  branches)
    echo "本地分支："
    git branch
    echo
    echo "远程分支："
    git branch -r
    ;;

  remote)
    git remote -v
    ;;

  help|-h|--help)
    print_help
    ;;

  *)
    echo "未知命令：$cmd"
    echo
    print_help
    exit 1
    ;;
esac
