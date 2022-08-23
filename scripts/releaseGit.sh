#!/bin/bash

VERSION=$(node -e 'console.log(require("../package.json").version)')

git config user.name github-actions[bot]
git config user.email github-actions[bot]@users.noreply.github.com
git add . && git commit -m "chore(release): publish v${VERSION}"
git tag -a "v${VERSION}" -m "v${VERSION}"
git push
git push --tags