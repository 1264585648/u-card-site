// Cloudflare Pages Function: /api/verify
// 快速验证卡密 Token 状态

import { verifyLicenseToken, DEFAULT_SALT } from './_license';

interface Env {
  LICENSE_SALT?: string;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const salt = context.env.LICENSE_SALT || DEFAULT_SALT;

  let token = '';

  if (context.request.method === 'POST') {
    try {
      const body: any = await context.request.json();
      token = body?.token || '';
    } catch {
      token = '';
    }
  } else {
    const url = new URL(context.request.url);
    token = url.searchParams.get('token') || '';
  }

  // 也可以从 Authorization 头拉取
  if (!token) {
    const authHeader = context.request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  const isValid = await verifyLicenseToken(token, salt);

  if (isValid) {
    return new Response(
      JSON.stringify({
        valid: true,
        code: 0,
        message: '卡密验证成功，VIP 特权已解锁',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      valid: false,
      code: 401,
      message: '无效或已失效的卡密，请检查是否拼写有误',
    }),
    {
      status: 200, // 返回 200 携带 valid: false，便于前端无报错友好处理
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
