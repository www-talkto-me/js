#!/usr/bin/env bash

set -e
DIR=$(realpath "$0") && DIR=${DIR%/*}
cd "$DIR"

cleanup() {
  echo "正在关闭相关进程..."
  kill $(jobs -p) 2>/dev/null || true
}

trap cleanup EXIT INT TERM

set -x
openclaw gateway stop
bun x conc 'openclaw dashboard' 'openclaw gateway'
