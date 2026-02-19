import sys

with open('components/ChatInterface.tsx', 'r') as f:
    content = f.read()

# Import replacement
import_search = "import { generateId } from '../utils';"
import_replace = "import { generateId } from '../utils';\nimport { AGENTS_CONFIG as AGENTS } from '../constants';"

if "import { AGENTS_CONFIG as AGENTS } from '../constants';" not in content:
    content = content.replace(import_search, import_replace)

# Remove constant definition
const_start = "const AGENTS: {role: AgentRole, label: string, color: string}[] = ["
const_end = "];"

start_idx = content.find(const_start)
if start_idx != -1:
    end_idx = content.find(const_end, start_idx)
    if end_idx != -1:
        # Remove from start_idx to end_idx + len(const_end)
        # Verify it looks correct by printing or checking context
        # Check if the block is indeed the one we want
        content = content[:start_idx] + content[end_idx + len(const_end):]

# Clean up potential extra newlines before ChatInterface component definition
content = content.replace("\n\n\nconst ChatInterface", "\n\nconst ChatInterface")
# In case there was only one newline left or different spacing
content = content.replace("\n\n\n\nconst ChatInterface", "\n\nconst ChatInterface")

with open('components/ChatInterface.tsx', 'w') as f:
    f.write(content)
