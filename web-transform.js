const fs = require('fs');
const path = require('path');

// Post-export script to fix index.html for ES modules
const indexPath = path.join(__dirname, 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Add type="module" to the script tag
  html = html.replace(
    /<script src="([^"]+)" defer><\/script>/,
    '<script type="module" src="$1"></script>'
  );
  
  fs.writeFileSync(indexPath, html);
  console.log('✓ Fixed index.html script tag for ES modules');
}
