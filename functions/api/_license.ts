// Cloudflare Pages Functions: 卡密/Token 密码学签名与离线验算核心模块
// 采用 Base32-Crockford 字符集（剔除容易混淆的 0/O/1/I），杜绝用户输入错误

export const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const DEFAULT_SALT = 'UCARD_SALT_2026_SECURE_KEY_889F';

/**
 * 根据 8 位随机种子和盐值，计算 8 位 SHA-256 折叠签名校验码
 */
export async function computeSignature(seed: string, salt: string = DEFAULT_SALT): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${seed}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hash = new Uint8Array(hashBuffer); // 32 字节哈希

  let sig = '';
  for (let i = 0; i < 8; i++) {
    // 跨 4 组字节 (32 字节 / 8) 异或混淆计算，保证雪崩效应（任何 1 bit 变动都会彻底改变特征）
    const val = (hash[i] ^ hash[i + 8] ^ hash[i + 16] ^ hash[i + 24]) % 32;
    sig += ALPHABET[val];
  }
  return sig;
}

/**
 * 验证卡密 Token 是否合法有效
 * 格式支持：
 * - 标准带前缀带横杠：UCARD-XXXX-XXXX-XXXX-XXXX
 * - 纯 16 位字符：XXXXXXXXXXXXXXXX
 * - 小写输入或空格混入均自动兼容清洗
 */
export async function verifyLicenseToken(
  token: string | null | undefined,
  salt: string = DEFAULT_SALT
): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  // 1. 规范化清洗：大写并仅保留合法 Base32 字符
  const clean = token.toUpperCase().replace(/[^2-9A-Z]/g, '');
  const body = clean.startsWith('UCARD') ? clean.slice(5) : clean;

  if (body.length !== 16) {
    return false;
  }

  const seed = body.slice(0, 8);
  const actualSig = body.slice(8, 16);
  const expectedSig = await computeSignature(seed, salt);

  return actualSig === expectedSig;
}
