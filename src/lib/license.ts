// 前端与客户端卡密辅助处理工具

export const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const DEFAULT_SALT = 'UCARD_SALT_2026_SECURE_KEY_889F';
export const PREFIX = 'UCARD';

/**
 * 格式化用户输入的卡密，自动补全连字符 -
 */
export function formatLicenseKeyInput(input: string): string {
  if (!input) return '';
  // 移除非法字符并转为大写
  const clean = input.toUpperCase().replace(/[^2-9A-Z]/g, '');
  
  // 提取纯 16 位卡密主体
  let body = clean;
  if (body.startsWith(PREFIX)) {
    body = body.slice(PREFIX.length);
  }
  body = body.slice(0, 16); // 最多 16 位

  // 拼接成 UCARD-XXXX-XXXX-XXXX-XXXX
  const parts = [PREFIX];
  for (let i = 0; i < body.length; i += 4) {
    parts.push(body.slice(i, i + 4));
  }

  return parts.join('-');
}

/**
 * 验证卡密 Token (前端异步验算)
 */
export async function verifyLicenseTokenClient(
  token: string | null | undefined,
  salt: string = DEFAULT_SALT
): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const clean = token.toUpperCase().replace(/[^2-9A-Z]/g, '');
  const body = clean.startsWith(PREFIX) ? clean.slice(PREFIX.length) : clean;

  if (body.length !== 16) {
    return false;
  }

  const seed = body.slice(0, 8);
  const actualSig = body.slice(8, 16);

  try {
    const enc = new TextEncoder();
    const data = enc.encode(`${salt}:${seed}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = new Uint8Array(hashBuffer);

    let expectedSig = '';
    for (let i = 0; i < 8; i++) {
      const val = (hash[i] ^ hash[i + 8] ^ hash[i + 16] ^ hash[i + 24]) % 32;
      expectedSig += ALPHABET[val];
    }

    return actualSig === expectedSig;
  } catch (e) {
    console.error('Client token verification error:', e);
    return false;
  }
}
