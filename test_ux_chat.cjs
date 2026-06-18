const fs = require('fs');
let content = fs.readFileSync('components/ChatInterface.tsx', 'utf8');

const searchButton = `<button
              onClick={() => setImageAttachment(null)}
              className="ml-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Remove attached image"
            >
              <div className="w-4 h-4 font-bold flex items-center justify-center">×</div>
            </button>`;

const replaceButton = `<button
              onClick={() => setImageAttachment(null)}
              className="ml-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full transition-colors"
              aria-label="Remove attached image"
              title="Remove attached image"
            >
              <div className="w-4 h-4 font-bold flex items-center justify-center">×</div>
            </button>`;

content = content.replace(searchButton, replaceButton);
fs.writeFileSync('components/ChatInterface.tsx', content);
console.log("UX improvements applied to ChatInterface.tsx");
