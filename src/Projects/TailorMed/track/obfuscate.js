// TailorMed 程式碼混淆工具
// 保護 CSS 類別名稱和 HTML 結構

const fs = require('fs');
const path = require('path');
const pug = require('pug');
const stylus = require('stylus');

// 混淆配置
const OBFUSCATION_CONFIG = {
  // CSS 類別名稱混淆
  cssClassPrefix: 'tm',
  cssClassLength: 6,

  // HTML 屬性混淆
  obfuscateAttributes: true,

  // 移除註解和空白
  minify: true,
};

// 生成隨機類別名稱
function generateObfuscatedClassName(originalName, classMap) {
  if (classMap.has(originalName)) {
    return classMap.get(originalName);
  }

  const randomId = Math.random()
    .toString(36)
    .substr(2, OBFUSCATION_CONFIG.cssClassLength);
  const obfuscatedName = `${OBFUSCATION_CONFIG.cssClassPrefix}${randomId}`;
  classMap.set(originalName, obfuscatedName);

  return obfuscatedName;
}

// CSS 混淆函數
function obfuscateCSS(cssContent, classMap) {
  // 混淆類別選擇器
  let obfuscatedCSS = cssContent.replace(
    /\.([a-zA-Z][a-zA-Z0-9_-]*)/g,
    (match, className) => {
      return '.' + generateObfuscatedClassName(className, classMap);
    }
  );

  // 混淆 ID 選擇器
  obfuscatedCSS = obfuscatedCSS.replace(
    /#([a-zA-Z][a-zA-Z0-9_-]*)/g,
    (match, idName) => {
      return '#' + generateObfuscatedClassName(idName, classMap);
    }
  );

  // 壓縮 CSS
  if (OBFUSCATION_CONFIG.minify) {
    obfuscatedCSS = obfuscatedCSS
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除註解
      .replace(/\s+/g, ' ') // 壓縮空白
      .replace(/;\s*}/g, '}') // 移除最後的分號
      .replace(/,\s+/g, ',') // 壓縮逗號後的空白
      .trim();
  }

  return obfuscatedCSS;
}

// HTML 混淆函數
function obfuscateHTML(htmlContent, classMap) {
  // 混淆 class 屬性
  let obfuscatedHTML = htmlContent.replace(
    /class="([^"]+)"/g,
    (match, classes) => {
      const obfuscatedClasses = classes
        .split(' ')
        .map((cls) => {
          return generateObfuscatedClassName(cls.trim(), classMap);
        })
        .join(' ');
      return `class="${obfuscatedClasses}"`;
    }
  );

  // 混淆 id 屬性
  obfuscatedHTML = obfuscatedHTML.replace(/id="([^"]+)"/g, (match, id) => {
    return `id="${generateObfuscatedClassName(id, classMap)}"`;
  });

  // 壓縮 HTML
  if (OBFUSCATION_CONFIG.minify) {
    obfuscatedHTML = obfuscatedHTML
      .replace(/\s+/g, ' ') // 壓縮空白
      .replace(/>\s+</g, '><') // 移除標籤間的空白
      .replace(/<!--[\s\S]*?-->/g, '') // 移除 HTML 註解
      .trim();
  }

  return obfuscatedHTML;
}

// 主要混淆函數
async function obfuscateProject() {
  console.log('🔒 開始混淆 TailorMed 專案...');

  const classMap = new Map();
  const distDir = path.join(__dirname, 'dist');
  const obfuscatedDir = path.join(__dirname, 'dist-obfuscated');

  // 創建混淆輸出目錄
  if (!fs.existsSync(obfuscatedDir)) {
    fs.mkdirSync(obfuscatedDir, { recursive: true });
  }

  try {
    // 1. 處理 Stylus 檔案
    console.log('📝 混淆 Stylus 樣式...');
    const stylusFiles = [
      'Styles/main.styl',
      'Styles/variables.styl',
      'Styles/components/lookupPanel.styl',
      'Styles/components/resultsPanel.styl',
      'Styles/components/timelinePanel.styl',
      'Styles/components/timelinePanel-v2.styl',
      'Styles/components/timelineTrack.styl',
    ];

    for (const stylFile of stylusFiles) {
      const filePath = path.join(__dirname, stylFile);
      if (fs.existsSync(filePath)) {
        const stylContent = fs.readFileSync(filePath, 'utf8');
        const obfuscatedCSS = obfuscateCSS(stylContent, classMap);

        const outputPath = path.join(
          obfuscatedDir,
          stylFile.replace('Styles/', 'css/')
        );
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, obfuscatedCSS);
        console.log(`  ✅ 已混淆 ${stylFile}`);
      }
    }

    // 2. 處理 Pug 檔案
    console.log('📝 混淆 Pug 模板...');
    const pugFiles = ['Templates/design_ui.pug', 'Templates/index.pug'];

    for (const pugFile of pugFiles) {
      const filePath = path.join(__dirname, pugFile);
      if (fs.existsSync(filePath)) {
        const compiled = pug.compileFile(filePath);
        const htmlContent = compiled();
        const obfuscatedHTML = obfuscateHTML(htmlContent, classMap);

        const outputPath = path.join(
          obfuscatedDir,
          pugFile.replace('Templates/', '').replace('.pug', '.html')
        );
        fs.writeFileSync(outputPath, obfuscatedHTML);
        console.log(`  ✅ 已混淆 ${pugFile}`);
      }
    }

    // 3. 複製其他資源
    console.log('📦 複製靜態資源...');
    const staticFiles = ['Assets/images', 'Javascript', 'admin.html'];

    for (const staticFile of staticFiles) {
      const srcPath = path.join(__dirname, staticFile);
      const destPath = path.join(obfuscatedDir, staticFile);

      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
        console.log(`  ✅ 已複製 ${staticFile}`);
      }
    }

    // 4. 生成類別對應表（用於除錯）
    const classMapFile = path.join(obfuscatedDir, 'class-mapping.json');
    const classMapping = Object.fromEntries(classMap);
    fs.writeFileSync(classMapFile, JSON.stringify(classMapping, null, 2));
    console.log(`  ✅ 已生成類別對應表: ${classMapFile}`);

    console.log('🎉 混淆完成！');
    console.log(`📁 混淆後的檔案位於: ${obfuscatedDir}`);
    console.log(`📊 總共混淆了 ${classMap.size} 個類別名稱`);
  } catch (error) {
    console.error('❌ 混淆過程中發生錯誤:', error);
  }
}

// 執行混淆
if (require.main === module) {
  obfuscateProject();
}

module.exports = { obfuscateProject, obfuscateCSS, obfuscateHTML };


