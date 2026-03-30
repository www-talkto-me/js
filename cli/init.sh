#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -x

if [ ! -d "openclaw" ]; then
  git clone --depth=1 git@github.com:openclaw/openclaw.git
else
  cd openclaw
  git pull
fi
