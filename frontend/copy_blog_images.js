const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Aryan\\.gemini\\antigravity-ide\\brain\\e7943aa7-d39f-4956-97eb-c271b7c1f68a';
const destDir = path.join(__dirname, 'public', 'images', 'blogs');

fs.mkdirSync(destDir, { recursive: true });

const images = [
  { src: 'blog_aptitude_1781005888110.png', dest: 'blog_aptitude.png' },
  { src: 'blog_interview_1781005900642.png', dest: 'blog_interview.png' },
  { src: 'blog_company_1781005915915.png', dest: 'blog_company.png' },
  { src: 'blog_coding_1781005929430.png', dest: 'blog_coding.png' },
];

images.forEach(img => {
  const srcPath = path.join(srcDir, img.src);
  const destPath = path.join(destDir, img.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${img.dest} to public/images/blogs/`);
  } else {
    console.log(`❌ Missing ${srcPath}`);
  }
});
console.log('Done!');
