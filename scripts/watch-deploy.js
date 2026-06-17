const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const targetFiles = [
  path.join(__dirname, '..', 'db.json'),
  path.join(__dirname, '..', 'src', 'data', 'matches.json'),
  path.join(__dirname, '..', 'src', 'data', 'users.json')
];

// Ensure src/data exists
const dataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure matches.json and users.json exist so they can be watched and tracked
targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf-8');
  }
});

console.log('Watching files for auto-deployment:');
targetFiles.forEach(file => console.log(` - ${path.relative(path.join(__dirname, '..'), file)}`));

// Simple debounce to prevent duplicate commits on multiple rapid saves
let timeoutId = null;

targetFiles.forEach(file => {
  fs.watch(file, (eventType, filename) => {
    if (eventType === 'change') {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log(`Change detected in ${path.basename(file)}. Committing and pushing to trigger Vercel deployment...`);
        const gitCmd = `git add "${file}" && git commit -m "Auto-deploy: updated ${path.basename(file)}" && git push`;
        
        // Load environment path to find git
        const envPath = process.env.Path || process.env.PATH;
        const options = {
          cwd: path.join(__dirname, '..'),
          env: { ...process.env, PATH: envPath }
        };

        exec(gitCmd, options, (err, stdout, stderr) => {
          if (err) {
            console.error('Failed to auto-deploy:', err);
            return;
          }
          console.log('Auto-deploy completed successfully!');
          console.log(stdout);
        });
      }, 2000); // 2 seconds debounce
    }
  });
});
