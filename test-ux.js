const fs = require('fs');
const files = fs.readdirSync('components').filter(f => f.endsWith('.tsx'));
for (const file of files) {
  const content = fs.readFileSync('components/' + file, 'utf8');
  if (content.match(/<button[^>]*>[^<]*<[A-Z][a-zA-Z]*Icon[^>]*>[^<]*<\/button>/)) {
    console.log(file, 'has icon-only button');
  }
}
