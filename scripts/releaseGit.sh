#!/bin/bash

VERSION=$(npm pkg get version | sed 's/"//g')

git config user.name github-actions[bot]
git config user.email github-actions[bot]@users.noreply.github.com
git add . && git commit -m "chore(release): publish v${VERSION}"
git tag -a "v${VERSION}" -m "v${VERSION}"
git push
git push --tags