const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  "dev": "next dev --port 5000",
  "build": "next build",
  "start": "next start --port 5000",
  "lint": "next lint"
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Updated package.json scripts');
