const fs = require('fs');
let content = fs.readFileSync('components/FileUploader.tsx', 'utf8');

const searchRemove = `  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    setFileProgressMessages(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };`;

const replaceRemove = `  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file || !window.confirm(\`Are you sure you want to remove "\${file.name}"? This action cannot be undone.\`)) {
      return;
    }

    setFiles(files.filter(f => f.id !== id));
    setFileProgressMessages(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };`;

content = content.replace(searchRemove, replaceRemove);

const searchButton = `<button
                onClick={() => removeFile(file.id)}
                aria-label={\`Remove file \${file.name}\`}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >`;

const replaceButton = `<button
                onClick={() => removeFile(file.id)}
                aria-label={\`Remove file \${file.name}\`}
                title="Remove file"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg transition-all"
              >`;

content = content.replace(searchButton, replaceButton);

fs.writeFileSync('components/FileUploader.tsx', content);
console.log("UX improvements applied to FileUploader.tsx");
