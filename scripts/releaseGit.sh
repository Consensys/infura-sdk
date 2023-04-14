#!/bin/bash

# Git Configuration
git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"

# Add all changes to Git
git add .

# Commit changes with provided message
git commit -m "chore(release): release v$1"

# Push changes and tag to remote repository
git push origin main
git push --tags