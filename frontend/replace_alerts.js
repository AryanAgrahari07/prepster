import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync(SRC_DIR);
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    // Determine type of toast based on alert content roughly
    content = content.replace(/alert\((.*?(?:Failed|failed|Error|error|No valid).*?)\)/g, 'toast.error($1)');
    content = content.replace(/alert\((.*?)\)/g, 'toast.success($1)');
    
    // add import if not there
    if (!content.includes("import toast from")) {
      // Find the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + "import toast from '@/utils/toast';\n" + content.slice(endOfLine + 1);
      } else {
        content = "import toast from '@/utils/toast';\n" + content;
      }
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    count++;
  }
}

console.log(`Replaced alerts in ${count} files.`);
