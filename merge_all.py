import subprocess
import sys

def run_command(command, check=True):
    try:
        result = subprocess.run(command, shell=True, check=check, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        raise e

def get_remote_branches():
    result = run_command("git branch -r")
    branches = []
    for line in result.stdout.splitlines():
        branch = line.strip()
        if "origin/HEAD" in branch or "origin/main" in branch:
            continue
        branches.append(branch)
    return branches

def merge_branches():
    branches = get_remote_branches()
    print(f"Found {len(branches)} branches to merge.")

    success_count = 0
    fail_count = 0

    for branch in branches:
        print(f"Merging {branch}...")
        try:
            # Attempt standard merge
            subprocess.run(f"git merge {branch} --no-edit", shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print(f"Successfully merged {branch}")
            success_count += 1
        except subprocess.CalledProcessError:
            print(f"Conflict merging {branch}. Attempting to resolve...")
            try:
                # Resolve conflicts: prefer theirs for everything EXCEPT vite.config.ts
                run_command("git checkout --theirs .", check=False) # Checkout theirs for all conflicts
                run_command("git checkout HEAD -- vite.config.ts", check=False) # Keep our vite.config.ts (with API key)

                # Verify that checkout HEAD worked for vite.config.ts?
                # Actually, git checkout HEAD -- file will restore it to HEAD state regardless of conflict status.

                # Add resolved files
                run_command("git add .")

                # Commit merge
                run_command(f"git commit --no-edit -m 'Merge {branch} into main with conflict resolution'")

                print(f"Successfully resolved and merged {branch}")
                success_count += 1
            except Exception as e:
                print(f"Failed to resolve merge for {branch}: {e}")
                run_command("git merge --abort", check=False)
                fail_count += 1

    print(f"\nMerge process complete.")
    print(f"Successful merges: {success_count}")
    print(f"Failed merges: {fail_count}")

if __name__ == "__main__":
    merge_branches()
