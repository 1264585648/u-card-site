// Cloudflare Pages Function: GET /api/cards
// 提供带算法卡密鉴权、防爬脱敏与按需查询的卡片检索接口

import { verifyLicenseToken, DEFAULT_SALT } from './_license';

interface Env {
  DB?: any; // Cloudflare D1Database
  LICENSE_SALT?: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const url = new URL(context.request.url);
  const searchParams = url.searchParams;

  // 1. 卡密验算：从 URL 参数或 Authorization 请求头获取
  let token = searchParams.get('token') || '';
  if (!token) {
    const authHeader = context.request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  const salt = context.env.LICENSE_SALT || DEFAULT_SALT;
  const isVipUnlocked = await verifyLicenseToken(token, salt);

  // 2. 防刷与分页参数限制
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(36, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
  const offset = (page - 1) * limit;

  const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();
  const network = searchParams.get('network') || 'ALL';
  const currency = searchParams.get('currency') || 'ALL';

  // 检查是否绑定了 D1 数据库
  if (!context.env.DB) {
    return new Response(
      JSON.stringify({
        error: 'D1 database binding [DB] not found. Please bind D1 in Cloudflare Pages settings.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const db = context.env.DB;

    // 构建过滤条件
    let whereClauses: string[] = ['is_active = 1'];
    let params: any[] = [];

    if (searchQuery) {
      whereClauses.push('(LOWER(name) LIKE ? OR LOWER(issuer) LIKE ? OR bin LIKE ?)');
      const wild = `%${searchQuery}%`;
      params.push(wild, wild, wild);
    }

    if (network !== 'ALL') {
      whereClauses.push('LOWER(network) LIKE ?');
      params.push(`%${network.toLowerCase()}%`);
    }

    if (currency !== 'ALL') {
      whereClauses.push('UPPER(currency) = ?');
      params.push(currency.toUpperCase());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 统计总数
    const countQuery = `SELECT COUNT(*) as total FROM cards ${whereSql}`;
    const countStmt = db.prepare(countQuery);
    const countRes = await (params.length > 0 ? countStmt.bind(...params) : countStmt).first();
    const total = countRes?.total || 0;

    // 查询卡片列表
    const selectQuery = `
      SELECT id, name, network, issuer, currency, bin, card_art_color, card_image,
             fees_json, kyc_json, open_json, scenarios_json, referral_url, promo_badge, is_recommended
      FROM cards
      ${whereSql}
      ORDER BY is_recommended DESC, id ASC
      LIMIT ? OFFSET ?
    `;

    const selectParams = [...params, limit, offset];
    const { results } = await db.prepare(selectQuery).bind(...selectParams).all();

    // 格式化输出为前端标准 VirtualCard 结构，并根据卡密解锁状态执行核心数据脱敏保护
    const formattedCards = (results || []).map((row: any, index: number) => {
      const globalIndex = offset + index;
      // 允许前 3 张推荐卡公开试看（增强真实感与引流转化），其余卡片未输入卡密时加锁保护
      const shouldLock = !isVipUnlocked && globalIndex >= 3;

      const maskedBin = shouldLock
        ? (row.bin ? `${row.bin.slice(0, 3)}***` : '***')
        : row.bin;

      const referralUrl = shouldLock ? '' : row.referral_url;

      return {
        id: row.id,
        name: row.name,
        network: row.network,
        issuer: row.issuer,
        currency: row.currency,
        bin: maskedBin,
        cardArtColor: row.card_art_color,
        cardImage: row.card_image,
        fees: JSON.parse(row.fees_json || '{}'),
        kycRequirements: JSON.parse(row.kyc_json || '{}'),
        openRequirements: JSON.parse(row.open_json || '{}'),
        scenarios: JSON.parse(row.scenarios_json || '{}'),
        referralUrl,
        promoBadge: row.promo_badge,
        isRecommended: Boolean(row.is_recommended),
        isLocked: shouldLock,
      };
    });

    const responsePayload = {
      code: 0,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
      isVipUnlocked,
      data: formattedCards,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': isVipUnlocked ? 'private, no-cache' : 'public, max-age=60, s-maxage=120',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
