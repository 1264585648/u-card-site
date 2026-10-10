/**
 * U-Card 雷达专属离线算法卡密生成工具
 * 使用方式：
 *   node scripts/gen-keys.js [生成数量]
 *   例如：
 *   npm run gen-keys 20
 *   node scripts/gen-keys.js 100
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 字符集：Base32 Crockford（剔除易混淆的 0/O/1/I，避免用户输入错误与售后咨询）
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const DEFAULT_SALT = 'UCARD_SALT_2026_SECURE_KEY_889F';
const PREFIX = 'UCARD';

// 计算签名
function computeSignature(seed, salt = DEFAULT_SALT) {
  const hash = crypto.createHash('sha256').update(`${salt}:${seed}`).digest();
  let sig = '';
  for (let i = 0; i < 8; i++) {
    const val = (hash[i] ^ hash[i + 8] ^ hash[i + 16] ^ hash[i + 24]) % 32;
    sig += ALPHABET[val];
  }
  return sig;
}

// 生成单个卡密
function generateKey(salt = DEFAULT_SALT) {
  let seed = '';
  for (let i = 0; i < 8; i++) {
    seed += ALPHABET[crypto.randomInt(0, 32)];
  }
  const sig = computeSignature(seed, salt);
  return `${PREFIX}-${seed.slice(0, 4)}-${seed.slice(4, 8)}-${sig.slice(0, 4)}-${sig.slice(4, 8)}`;
}

// 自检验证函数
function verifyKey(key, salt = DEFAULT_SALT) {
  if (!key) return false;
  const clean = key.toUpperCase().replace(/[^2-9A-Z]/g, '');
  const body = clean.startsWith(PREFIX) ? clean.slice(PREFIX.length) : clean;
  if (body.length !== 16) return false;
  const seed = body.slice(0, 8);
  const actualSig = body.slice(8, 16);
  const expectedSig = computeSignature(seed, salt);
  return actualSig === expectedSig;
}

// 主入口
function main() {
  const countArg = process.argv[2];
  const count = parseInt(countArg, 10) > 0 ? parseInt(countArg, 10) : 10;

  console.log('\n========================================================');
  console.log('       🛡️  U-Card 雷达专属离线算法卡密生成器 (引流版)       ');
  console.log('========================================================');
  console.log(`[+] 目标生成数量：${count} 张`);
  console.log(`[+] 算法规则：SHA-256 加盐双重数字签名 (离线验算，0数据库依赖)`);
  console.log(`[+] 字符标准：Base32 防错字符集（无 0/O/1/I 混淆）`);
  console.log('--------------------------------------------------------');

  const generatedKeys = [];
  for (let i = 0; i < count; i++) {
    const key = generateKey();
    if (!verifyKey(key)) {
      console.error(`[!] 致命错误：生成的卡密未通过内置验算：${key}`);
      process.exit(1);
    }
    generatedKeys.push(key);
  }

  // 写入导出文件
  const exportPath = path.resolve(__dirname, '..', 'keys_export.txt');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const header = `\n# --- 批量生成时间：${now} (${count} 个) ---\n`;
  fs.appendFileSync(exportPath, header + generatedKeys.join('\n') + '\n', 'utf-8');

  // 控制台打印
  const showCount = Math.min(count, 15);
  for (let i = 0; i < showCount; i++) {
    console.log(`  ${String(i + 1).padStart(2, '0')}. ${generatedKeys[i]}`);
  }
  if (count > showCount) {
    console.log(`  ... 以及其余 ${count - showCount} 个卡密`);
  }

  console.log('--------------------------------------------------------');
  console.log(`[✔] 生成完毕！所有卡密已自动追加保存至：\n    ${exportPath}`);
  console.log('========================================================\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  ALPHABET,
  DEFAULT_SALT,
  PREFIX,
  computeSignature,
  generateKey,
  verifyKey,
};
