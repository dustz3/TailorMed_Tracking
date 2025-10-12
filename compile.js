const fs = require('fs');
const path = require('path');
const pug = require('pug');
const stylus = require('stylus');

const ROOT_DIR = __dirname;
const STYLE_DIR = path.join(ROOT_DIR, 'Styles');
const SCRIPT_DIR = path.join(ROOT_DIR, 'Javascript');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TEMPLATE_DIR = path.join(ROOT_DIR, 'Templates');
const ASSETS_DIR = path.join(ROOT_DIR, 'Assets');
// 修正：使用相對路徑，避免權限問題
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

console.log('🚚 開始編譯 TailorMed 貨件追蹤 MVP...');

// 1. 編譯 Pug -> HTML
try {
  console.log('📝 編譯 Pug 模板...');
  const pugFiles = fs
    .readdirSync(TEMPLATE_DIR)
    .filter((file) => file.endsWith('.pug'));

  if (pugFiles.length === 0) {
    console.warn('⚠️ 未找到任何 Pug 檔案');
  }

  ensureDir(DIST_DIR);

  pugFiles.forEach((file) => {
    const templatePath = path.join(TEMPLATE_DIR, file);
    const html = pug.renderFile(templatePath, {
      pretty: true,
    });

    const outputName = file.replace(/\.pug$/, '.html');
    fs.writeFileSync(path.join(DIST_DIR, outputName), html);
    console.log(`  ✅ 已生成 dist/Projects/TailorMed/track/${outputName}`);
  });
} catch (error) {
  console.error('❌ Pug 編譯失敗:', error.message);
  process.exit(1);
}

// 2. 編譯 Stylus -> CSS
try {
  console.log('🎨 編譯 Stylus 樣式...');
  const stylusFiles = fs
    .readdirSync(STYLE_DIR)
    .filter((file) => file.endsWith('.styl'));

  if (stylusFiles.length === 0) {
    console.warn('⚠️ 未找到任何 Stylus 檔案');
  }

  const cssDir = path.join(DIST_DIR, 'css');
  ensureDir(cssDir);

  stylusFiles.forEach((file) => {
    const stylusPath = path.join(STYLE_DIR, file);
    const stylusCode = fs.readFileSync(stylusPath, 'utf8');

    stylus(stylusCode)
      .set('filename', stylusPath)
      .render((err, css) => {
        if (err) {
          console.error('❌ Stylus 編譯失敗:', err.message);
          process.exit(1);
        }

        const outputName = file.replace(/\.styl$/, '.css');
        fs.writeFileSync(path.join(cssDir, outputName), css);
        console.log(
          `  ✅ 已生成 dist/Projects/TailorMed/track/css/${outputName}`
        );
      });
  });
} catch (error) {
  console.error('❌ Stylus 編譯失敗:', error.message);
  process.exit(1);
}

// 3. 複製腳本與資料
console.log('📦 複製靜態資源...');
copyDir(SCRIPT_DIR, path.join(DIST_DIR, 'js'));
copyDir(DATA_DIR, path.join(DIST_DIR, 'data'));
copyDir(ASSETS_DIR, path.join(DIST_DIR, 'images'));

console.log('✅ 靜態資源已就緒');

console.log(
  '🎉 編譯完成！可以在 dist/Projects/TailorMed/track/index.html 預覽貨件追蹤 MVP'
);
