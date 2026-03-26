#!/bin/bash
set -e

# ensure we are on main
git checkout main

# get list of branches
branches=$(git branch -r | grep origin/ | grep -v 'merge-' | grep -v 'main' | grep -v 'HEAD' | sed 's/^[ \t]*//' | sed 's/^origin\///')

for branch in $branches; do
  echo "Attempting to merge origin/$branch..."
  git merge --abort > /dev/null 2>&1 || true
  if ! git merge --no-edit --allow-unrelated-histories origin/$branch; then
    echo "Conflict detected! Attempting to resolve with -X ours..."
    git merge --abort > /dev/null 2>&1 || true
    git merge -X ours --no-edit --allow-unrelated-histories origin/$branch || {
      echo "Still conflict, aborting merge for $branch"
      git merge --abort > /dev/null 2>&1 || true
      git reset --hard HEAD
    }
  fi
done

echo "Done merging!"
