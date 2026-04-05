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
    # Make sure we commit the initial changes to server.js first
    try:
        run_command("git add server.js")
        run_command("git commit -m 'chore: add JULES_API_KEY fallback to server.js before merging'")
    except Exception:
        pass # If there's nothing to commit, that's fine

    branches = get_remote_branches()
    print(f"Found {len(branches)} branches to merge.")

    success_count = 0
    fail_count = 0

    for branch in branches:
        print(f"==========================================")
        print(f"Merging {branch}...")
        try:
            # First attempt a standard merge with theirs strategy. We want to accept the incoming changes usually.
            subprocess.run(f"git merge {branch} --no-edit --allow-unrelated-histories -X theirs", shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print(f"Successfully merged {branch}")

            # Since the merge succeeded, there might not be conflicts, but 'theirs' might have overwritten our API keys!
            # We MUST forcefully restore our keys even if the merge succeeded cleanly.
            run_command("git checkout HEAD@{1} -- vite.config.ts server.js services/geminiService.ts", check=False)

            # Check if there are any changes to commit after checking out
            status = run_command("git status --porcelain").stdout.strip()
            if status:
                run_command("git commit --amend --no-edit")

            success_count += 1
        except subprocess.CalledProcessError:
            print(f"Conflict or error merging {branch}. Attempting to resolve...")
            try:
                # If there are still unmerged files (e.g. modify/delete conflicts), checkout theirs
                run_command("git checkout --theirs .", check=False)

                # Check out the protected files from before the merge started
                run_command("git checkout HEAD -- vite.config.ts server.js services/geminiService.ts", check=False)

                # If they were somehow deleted in the working tree, try HEAD@{1}
                run_command("git checkout HEAD@{1} -- vite.config.ts server.js services/geminiService.ts", check=False)

                run_command("git add .")
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
