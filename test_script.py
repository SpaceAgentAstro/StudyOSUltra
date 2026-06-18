with open('components/ChatInterface.tsx', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'handleSendRef' in line:
        print(f"{i+1}: {line.strip()}")
