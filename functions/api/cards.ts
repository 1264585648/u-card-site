// Cloudflare Pages Function: GET /api/cards
// 提供带防爬分页、按需查询与数据字段隔离脱敏的卡片检索接口

interface Env {
  DB?: any; // Cloudflare D1Database
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const url = new URL(context.request.url);
  const searchParams = url.searchParams;

  // 1. 防刷与分页参数限制 (单次最多拉取 36 条，防止一键扒库)
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

    // 分页查询卡片，对私密字段进行隔离（例如内部合作商ID、内部结算成本不在公开展现）
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

    // 格式化输出为前端标准 VirtualCard 结构
    const formattedCards = (results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      network: row.network,
      issuer: row.issuer,
      currency: row.currency,
      bin: row.bin,
      cardArtColor: row.card_art_color,
      cardImage: row.card_image,
      fees: JSON.parse(row.fees_json || '{}'),
      kycRequirements: JSON.parse(row.kyc_json || '{}'),
      openRequirements: JSON.parse(row.open_json || '{}'),
      scenarios: JSON.parse(row.scenarios_json || '{}'),
      referralUrl: row.referral_url,
      promoBadge: row.promo_badge,
      isRecommended: Boolean(row.is_recommended),
    }));

    const responsePayload = {
      code: 0,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
      data: formattedCards,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=180',
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
