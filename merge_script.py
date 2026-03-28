import os
import subprocess

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

code, stdout, _ = run_cmd("git branch -r")
branches = [b.strip() for b in stdout.split('\n') if b.strip() and '->' not in b and 'origin/main' not in b]

print("Branches to merge:")
for b in branches:
    print(b)

for branch in branches:
    print(f"\nMerging {branch}...")
    code, out, err = run_cmd(f"git merge {branch} --allow-unrelated-histories --no-edit -m 'Merge {branch}'")
    if code != 0:
        print(f"Conflict in {branch}, resolving with theirs...")
        run_cmd("git checkout --theirs .")
        run_cmd("git add .")
        run_cmd(f"git commit -m 'Merge {branch} with conflicts resolved'")
    print(f"Successfully merged {branch}")
