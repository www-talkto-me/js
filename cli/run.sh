#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -x

. .env.sh
rm -rf ~/.config/talkto.me/
./cli.js init
exec ./cli.js run
