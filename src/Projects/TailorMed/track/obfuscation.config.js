// TailorMed 混淆配置檔案
module.exports = {
  // 基本混淆設定
  basic: {
    // CSS 類別名稱混淆
    cssClasses: {
      enabled: true,
      prefix: 'tm',
      length: 8,
      exclude: ['btn', 'container', 'hero'], // 保留的類別名稱
    },

    // HTML 屬性混淆
    htmlAttributes: {
      enabled: true,
      obfuscate: ['class', 'id'],
      preserve: ['data-*', 'aria-*'], // 保留的屬性
    },

    // 壓縮設定
    minification: {
      enabled: true,
      removeComments: true,
      removeWhitespace: true,
      collapseInlineTags: true,
    },
  },

  // 進階混淆設定
  advanced: {
    // JavaScript 混淆
    javascript: {
      enabled: true,
      mangle: true,
      compress: true,
      dropConsole: true,
      dropDebugger: true,
    },

    // 字串混淆
    stringObfuscation: {
      enabled: true,
      method: 'base64', // 'base64', 'hex', 'unicode'
      exclude: ['src', 'href', 'alt'], // 保留的屬性值
    },

    // 控制流程混淆
    controlFlow: {
      enabled: false, // 可能影響功能，建議關閉
      complexity: 'medium',
    },
  },

  // 保護設定
  protection: {
    // 反除錯
    antiDebug: {
      enabled: true,
      methods: ['console.clear', 'debugger'],
    },

    // 反篡改
    antiTamper: {
      enabled: true,
      checkIntegrity: true,
    },

    // 域名鎖定
    domainLock: {
      enabled: false,
      allowedDomains: ['track.tailormed-intl.com', 'localhost'],
    },
  },

  // 輸出設定
  output: {
    // 混淆後檔案目錄
    directory: 'dist-obfuscated',

    // 是否生成 source map
    sourceMap: false,

    // 是否生成類別對應表
    classMapping: true,

    // 是否保留原始檔案
    keepOriginal: true,
  },

  // 排除檔案
  exclude: {
    // 不混淆的檔案
    files: ['node_modules/**', '*.config.js', '*.json'],

    // 不混淆的類別名稱
    classes: ['btn', 'container', 'hero', 'site-header', 'site-footer'],

    // 不混淆的 ID
    ids: ['app', 'root', 'main'],
  },
};


