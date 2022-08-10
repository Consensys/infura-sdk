#!/bin/bash

LAST_TAG=$(git tag --sort=-version:refname --no-contains HEAD | grep -E '^v([0-9]).([0-9]).([0-9]*)$' | head -1)
NB_OF_FEAT=$(git log ^"${LAST_TAG}" HEAD --pretty=format:%s | grep -oE '^(feat((.?))?:|PTP-\d)' | wc -l)
echo KIND=$(if [ "$NB_OF_FEAT" -gt 3 ]; then echo "minor"; else echo "patch"; fi) >> $GITHUB_ENV