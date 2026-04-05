import fs from 'fs';
import path from 'path';

const SRC_DIR = 'C:/Users/user/Desktop/Year2_Semester_2/Collaborative Development/academic_management_system/client/src';

const replacements = [
  { match: /#006496/g, replace: '#6a5182' }, // primary button, text, border
  { match: /#0d3349/g, replace: '#4b3f68' }, // dark headings
  { match: /#e6f7f9/g, replace: '#f3eff7' }, // active background
  { match: /#f0fbfc/g, replace: '#f8f6fb' }, // hover background
  { match: /rounded-\[23\.74px\]/g, replace: 'rounded-sm' }, // buttons
  { match: /rounded-2xl/g, replace: 'rounded-sm' }, // cards
  { match: /rounded-xl/g, replace: 'rounded-sm' },
  { match: /rounded-lg/g, replace: 'rounded-sm' },
  { match: /rounded-full/g, replace: 'rounded-sm' } // Calendar active days, etc
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { match, replace } of replacements) {
        content = content.replace(match, replace);
      }

      // Update Tailwind CSS theme
      if (fullPath.endsWith('index.css')) {
        if (!content.includes('--font-sans')) {
          content = content.replace('@theme {', '@theme {\n  --font-sans: "Inter", sans-serif;\n  --color-primary: #6a5182;');
        }
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log('Done replacement.');
