#!/bin/bash

# Get list of remote branches, excluding HEAD, main, and current branch
current_branch=$(git branch --show-current)
echo "Current branch: $current_branch"

# Fetch all remotes
git fetch --all

# Get branches
branches=$(git branch -r | grep -v 'origin/HEAD' | grep -v 'origin/main' | grep -v "origin/$current_branch" | sed 's/origin\///')

for branch in $branches; do
    echo "=========================================="
    echo "Merging $branch..."
    if git merge "origin/$branch" --no-edit --allow-unrelated-histories -X ours; then
        echo "Merged $branch successfully."
    else
        echo "Conflict merging $branch. Resolving using 'ours'..."

        # Get list of unmerged files
        unmerged=$(git diff --name-only --diff-filter=U)

        if [ -n "$unmerged" ]; then
            echo "$unmerged" | xargs git checkout --ours
            git add .
            if git commit --no-edit -m "Merge $branch with strategy ours for conflicts"; then
                echo "Resolved conflicts for $branch."
            else
                echo "Commit failed for $branch. Aborting merge."
                git merge --abort
                continue
            fi
        else
            echo "Merge failed but no unmerged files? Aborting."
            # If merge failed without unmerged files, it means it didn't even start properly (e.g. dirty working tree)
            # But we are committing the script now, so dirty working tree shouldn't be an issue unless other files are dirty.
            git merge --abort
            continue
        fi
    fi
done
echo "All branches processed."
