const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify: htmlMinify } = require('html-minifier-terser');
const CleanCSS = require('clean-css');

const isProduction = process.argv.includes('--production');

// Configuration
const SOURCE_DIR = path.join(__dirname);
const DIST_DIR = path.join(__dirname, 'dist');

// Files to process
const HTML_FILES = [
  'index.html',
  'admin-panel.html',
  'Hillsonwheels — The World of Uttarakhand.html'
];
const CSS_FILES = ['assets/css/ecommerce.css'];
const JS_FILES = [
  'assets/js/security.js',
  'assets/js/config.js',
  'assets/js/auth.js',
  'assets/js/ecommerce.js',
  'assets/js/admin.js'
];

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Copy directories recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Minify HTML
async function minifyHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const result = await htmlMinify(content, {
    removeComments: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: false,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    keepClosingSlash: true
  });
  return result;
}

// Minify CSS
function minifyCSS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const result = new CleanCSS().minify(content);
  return result.styles;
}

// Obfuscate JavaScript
async function obfuscateJS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (isProduction) {
    // Production: Full obfuscation
    const obfuscationResult = JavaScriptObfuscator.obfuscate(content, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 4000,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayIndexShift: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 4,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    });
    return obfuscationResult.getObfuscatedCode();
  } else {
    // Development: Just minify
    const result = await minify(content, {
      compress: true,
      mangle: true,
      toplevel: true,
      format: {
        comments: false
      }
    });
    return result.code;
  }
}

// Process files
async function build() {
  console.log(`Building in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`);

  // Copy all non-processed files to dist
  const allFiles = fs.readdirSync(SOURCE_DIR, { withFileTypes: true });
  for (const file of allFiles) {
    const srcPath = path.join(SOURCE_DIR, file.name);
    const destPath = path.join(DIST_DIR, file.name);
    
    if (file.isDirectory() && file.name !== 'dist' && file.name !== 'node_modules' && file.name !== '.git' && file.name !== '.nodeenv' && file.name !== '.gemini' && file.name !== 'scratch' && file.name !== '.vercel' && file.name !== '.tempmediaStorage' && file.name !== 'api') {
      copyDirectory(srcPath, destPath);
    } else if (file.isFile() && !HTML_FILES.includes(file.name) && !file.name.endsWith('.js') && !file.name.endsWith('.css') && file.name !== 'build.js' && file.name !== 'package.json' && file.name !== 'package-lock.json') {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // Process HTML files
  for (const file of HTML_FILES) {
    const srcPath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DIST_DIR, file);
    const minified = await minifyHTML(srcPath);
    fs.writeFileSync(destPath, minified);
    console.log(`✓ Minified: ${file}`);
  }

  // Process CSS files
  for (const file of CSS_FILES) {
    const srcPath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DIST_DIR, file);
    const minified = minifyCSS(srcPath);
    fs.writeFileSync(destPath, minified);
    console.log(`✓ Minified: ${file}`);
  }

  // Process JavaScript files
  for (const file of JS_FILES) {
    const srcPath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DIST_DIR, file);
    const processed = await obfuscateJS(srcPath);
    fs.writeFileSync(destPath, processed);
    console.log(`✓ ${isProduction ? 'Obfuscated' : 'Minified'}: ${file}`);
  }

  // Create static route aliases for admin panel
  const adminPanelSrc = path.join(DIST_DIR, 'admin-panel.html');
  if (fs.existsSync(adminPanelSrc)) {
    fs.copyFileSync(adminPanelSrc, path.join(DIST_DIR, 'vendor-admin.html'));
    fs.copyFileSync(adminPanelSrc, path.join(DIST_DIR, 'admin.html'));

    const vendorAdminFolder = path.join(DIST_DIR, 'vendor-admin');
    if (!fs.existsSync(vendorAdminFolder)) fs.mkdirSync(vendorAdminFolder, { recursive: true });
    fs.copyFileSync(adminPanelSrc, path.join(vendorAdminFolder, 'index.html'));

    const adminFolder = path.join(DIST_DIR, 'admin');
    if (!fs.existsSync(adminFolder)) fs.mkdirSync(adminFolder, { recursive: true });
    fs.copyFileSync(adminPanelSrc, path.join(adminFolder, 'index.html'));
    console.log('✓ Created admin panel routes: /vendor-admin, /admin, and /admin-panel');
  }

  console.log(`\nBuild complete! Output in ${DIST_DIR}/`);
  console.log(`Mode: ${isProduction ? 'Production (obfuscated)' : 'Development (minified)'}`);
}

build().catch(console.error);
