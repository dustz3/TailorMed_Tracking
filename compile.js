const fs = require('fs');
const path = require('path');
const pug = require('pug');
const stylus = require('stylus');

const ROOT_DIR = __dirname;
// track-v2 的源文件路徑
const TRACK_V2_DIR = path.join(ROOT_DIR, 'src/Projects/TailorMed/track-v2');
const TRACK_V2_TEMPLATE_DIR = path.join(TRACK_V2_DIR, 'Templates');
const TRACK_V2_STYLE_DIR = path.join(ROOT_DIR, 'Styles'); // 根目錄的 Styles
const TRACK_V2_ASSETS_DIR = path.join(TRACK_V2_DIR, 'Assets');
// 編譯到根目錄的 dist（Netlify 期望的路徑）
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  fs.readdirSync(srcDir).forEach((item) => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

console.log('🚚 開始編譯 TailorMed track-v2...');

// 確保 dist 目錄存在
ensureDir(DIST_DIR);

// 1. 編譯 Pug -> HTML (track-v2)
if (fs.existsSync(TRACK_V2_TEMPLATE_DIR)) {
  try {
    console.log('📝 編譯 Pug 模板...');
    
    function compilePugRecursive(dir, outputBaseDir) {
      const files = fs.readdirSync(dir);
      
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          compilePugRecursive(filePath, outputBaseDir);
        } else if (file.endsWith('.pug')) {
          try {
            const html = pug.renderFile(filePath, {
              pretty: true,
            });
            
            const relativePath = path.relative(TRACK_V2_TEMPLATE_DIR, filePath);
            const outputPath = path.join(outputBaseDir, relativePath.replace(/\.pug$/, '.html'));
            ensureDir(path.dirname(outputPath));
            
            fs.writeFileSync(outputPath, html);
            console.log(`  ✅ 已生成 ${path.relative(DIST_DIR, outputPath)}`);
          } catch (error) {
            console.error(`  ⚠️ 編譯失敗 ${filePath}:`, error.message);
          }
        }
      });
    }
    
    compilePugRecursive(TRACK_V2_TEMPLATE_DIR, DIST_DIR);
  } catch (error) {
    console.error('❌ Pug 編譯失敗:', error.message);
    // 不退出，繼續編譯其他文件
  }
} else {
  console.warn('⚠️ 未找到 Templates 目錄');
}

// 2. 編譯 Stylus -> CSS (track-v2)
if (fs.existsSync(TRACK_V2_STYLE_DIR)) {
  try {
    console.log('🎨 編譯 Stylus 樣式...');
    
    function compileStylusRecursive(dir, outputBaseDir) {
      const files = fs.readdirSync(dir);
      
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          compileStylusRecursive(filePath, outputBaseDir);
        } else if (file.endsWith('.styl')) {
          try {
            const stylusCode = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(TRACK_V2_STYLE_DIR, filePath);
            const outputPath = path.join(outputBaseDir, 'css', relativePath.replace(/\.styl$/, '.css'));
            ensureDir(path.dirname(outputPath));
            
            stylus(stylusCode)
              .set('filename', filePath)
              .render((err, css) => {
                if (err) {
                  console.error(`  ⚠️ 編譯失敗 ${filePath}:`, err.message);
                } else {
                  fs.writeFileSync(outputPath, css);
                  console.log(`  ✅ 已生成 ${path.relative(DIST_DIR, outputPath)}`);
                }
              });
          } catch (error) {
            console.error(`  ⚠️ 編譯失敗 ${filePath}:`, error.message);
          }
        }
      });
    }
    
    compileStylusRecursive(TRACK_V2_STYLE_DIR, DIST_DIR);
  } catch (error) {
    console.error('❌ Stylus 編譯失敗:', error.message);
    // 不退出，繼續編譯其他文件
  }
} else {
  console.warn('⚠️ 未找到 Styles 目錄');
}

// 3. 複製靜態資源
console.log('📦 複製靜態資源...');
if (fs.existsSync(TRACK_V2_ASSETS_DIR)) {
  copyDir(TRACK_V2_ASSETS_DIR, path.join(DIST_DIR, 'images'));
}

// 4. 複製 _redirects 文件（如果存在）
const redirectsSrc = path.join(DIST_DIR, '_redirects');
if (fs.existsSync(redirectsSrc)) {
  console.log('  ✅ _redirects 文件已存在');
} else {
  // 創建基本的 _redirects 文件
  const redirectsContent = `# Netlify Redirects for track-v2

/api/tracking  /.netlify/functions/tracking  200
/api/tracking-public  /.netlify/functions/tracking  200
/api/health  /.netlify/functions/tracking  200
/api/monitoring/stats  /.netlify/functions/tracking  200

/design  /design_ui.html  200
/basic  /basic.html  200
/standard  /standard.html  200
/admin  /admin.html  200

/*  /index.html  200
`;
  fs.writeFileSync(redirectsSrc, redirectsContent);
  console.log('  ✅ 已創建 _redirects 文件');
}

console.log('✅ 靜態資源已就緒');
console.log('🎉 編譯完成！可以在 dist/index.html 預覽貨件追蹤系統');
