// Cloudflare Pages Function: POST /api/vote
// 处理测活投票持久化与社区实测状态自适应更新

interface Env {
  DB?: any; // Cloudflare D1Database
}

// 简易哈希计算 (用于 IP 脱敏存储与频控)
async function hashString(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  if (!context.env.DB) {
    return new Response(
      JSON.stringify({ error: 'D1 database binding [DB] not found.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await context.request.json().catch(() => null);
    if (!body || !body.cardId || !body.scenarioKey || typeof body.isSuccess !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. cardId, scenarioKey, and isSuccess are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { cardId, scenarioKey, isSuccess, reason } = body;
    const db = context.env.DB;

    // 1. 获取客户端 IP 并哈希脱敏 (保护隐私并防止重复刷票)
    const clientIp = context.request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    const ipHash = await hashString(clientIp + '_salt_vote');

    // 2. 频控检查：同一个 IP 在 5 分钟内对同一张卡的同一个场景只能投 1 票
    const recentVote = await db.prepare(`
      SELECT id FROM votes
      WHERE card_id = ? AND scenario_key = ? AND ip_hash = ?
        AND created_at >= datetime('now', '-5 minutes')
      LIMIT 1
    `).bind(cardId, scenarioKey, ipHash).first();

    if (recentVote) {
      return new Response(
        JSON.stringify({
          code: 429,
          error: 'Rate limit exceeded: 您最近已对此场景进行过反馈，请稍后再试。'
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. 记录投票入库
    await db.prepare(`
      INSERT INTO votes (card_id, scenario_key, is_success, reason, ip_hash)
      VALUES (?, ?, ?, ?, ?)
    `).bind(cardId, scenarioKey, isSuccess ? 1 : 0, reason || null, ipHash).run();

    // 4. 读取该卡当前的 scenarios_json 并更新状态
    const cardRow = await db.prepare('SELECT scenarios_json FROM cards WHERE id = ?').bind(cardId).first();
    if (!cardRow) {
      return new Response(
        JSON.stringify({ error: 'Card not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let scenarios = JSON.parse(cardRow.scenarios_json || '{}');
    let targetScenario = scenarios[scenarioKey];
    if (targetScenario) {
      let newRate = targetScenario.successRate || 60;
      let newStatus = targetScenario.status || 'UNCONFIRMED';

      if (isSuccess) {
        newRate = Math.min(99, newRate + 1);
        if (newRate >= 80) newStatus = 'SUPPORTED';
      } else {
        newRate = Math.max(5, newRate - 6);
        if (newRate < 60) newStatus = 'NOT_SUPPORTED';
        else if (newRate < 80) newStatus = 'CONDITIONAL';
      }

      targetScenario.successRate = newRate;
      targetScenario.status = newStatus;
      targetScenario.note = isSuccess ? '社区最新实测可用' : (reason || '近期有用户反馈被拒');
      scenarios[scenarioKey] = targetScenario;

      // 更新写回 cards 表
      await db.prepare('UPDATE cards SET scenarios_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(JSON.stringify(scenarios), cardId)
        .run();
    }

    return new Response(
      JSON.stringify({
        code: 0,
        message: 'Vote submitted successfully',
        updatedScenario: targetScenario,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
