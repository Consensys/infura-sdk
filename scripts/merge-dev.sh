#!/bin/bash

git checkout dev
git merge main --no-ff --no-commit
git push dev