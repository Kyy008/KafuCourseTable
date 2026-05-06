/**
 * check.js —— 作业自检脚本
 * 用法：node tool/check.js
 * 检查 src/index.html 和 src/style.css 是否存在。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'src');

let passCount = 0;
let failCount = 0;

function pass(msg) {
  console.log(`  ✅  ${msg}`);
  passCount++;
}

function fail(msg) {
  console.error(`  ❌  ${msg}`);
  failCount++;
}

// ─────────────────────────────────────────────
// 1. 检查 index.html 是否存在
// ─────────────────────────────────────────────
console.log('\n📄 检查 src/index.html ...');
const htmlPath = path.join(SRC, 'index.html');
if (fs.existsSync(htmlPath)) {
  pass('index.html 文件存在');
} else {
  fail('index.html 文件不存在，请在 src/ 目录下创建该文件');
}

// ─────────────────────────────────────────────
// 2. 检查 style.css 是否存在
// ─────────────────────────────────────────────
console.log('\n🎨 检查 src/style.css ...');
const cssPath = path.join(SRC, 'style.css');
if (fs.existsSync(cssPath)) {
  pass('style.css 文件存在');
} else {
  fail('style.css 文件不存在，请在 src/ 目录下创建该文件');
}

// ─────────────────────────────────────────────
// 汇总结果
// ─────────────────────────────────────────────
console.log('\n─────────────────────────────────────────');
console.log(`📊 检查完成：${passCount} 项通过，${failCount} 项未通过\n`);
if (failCount === 0) {
  console.log('🎉 恭喜！所有检查项均通过，可以打包提交了。');
  console.log('   运行命令：node tool/pack.js\n');
} else {
  console.log('⚠️  请根据上方提示修改后，重新运行检查。\n');
}

