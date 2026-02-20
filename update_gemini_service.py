import re

with open('services/geminiService.ts', 'r') as f:
    content = f.read()

# Add import
import_line = 'import { extractJsonText, parseJsonSafely } from "../utils";'
content = import_line + '\n' + content

# Remove function definitions
# Using regex to match the exact blocks we identified earlier
# extractJsonText
pattern_extract = r'const extractJsonText = \(raw: string\): string \| null => \{[\s\S]*?return null;\n\};'
content = re.sub(pattern_extract, '', content)

# parseJsonSafely
pattern_parse = r'const parseJsonSafely = <T>\(raw: string, fallback: T\): T => \{[\s\S]*?\}\n\};'
content = re.sub(pattern_parse, '', content)

with open('services/geminiService.ts', 'w') as f:
    f.write(content)
