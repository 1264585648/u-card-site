'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_CARDS } from '@/data/cards';
import { VirtualCard, SupportStatus, AdvancedFilterState, DEFAULT_FILTER_STATE } from '@/types/card';
import {
  HeaderTabs,
  ActiveTab,
  SortOption,
} from '@/components/HeaderTabs';
import { CardItem } from '@/components/CardItem';
import { FilterDrawer } from '@/components/FilterDrawer';
import { CostCalculatorDrawer } from '@/components/CostCalculatorDrawer';
import { LivenessVoteModal } from '@/components/LivenessVoteModal';
import { CardDetailModal } from '@/components/CardDetailModal';
import { UnlockModal } from '@/components/UnlockModal';
import { verifyLicenseTokenClient } from '@/lib/license';
import {
  CreditCard,
  Sparkles,
  Shield,
  RefreshCw,
  Layers,
  CheckCircle2,
  Zap,
  ChevronDown,
  ListFilter,
  AlertCircle,
  Loader2,
  KeyRound,
  Lock,
} from 'lucide-react';

const PAGE_CHUNK = 24;

export default function HomePage() {
  const [cards, setCards] = useState<VirtualCard[]>(INITIAL_CARDS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('FEES_AND_RATES');
  const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<AdvancedFilterState>(DEFAULT_FILTER_STATE);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_CHUNK);

  // VIP 卡密解锁状态
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);

  // 云端安全存储与分页状态
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [serverPage, setServerPage] = useState<number>(1);
  const [hasMoreServer, setHasMoreServer] = useState<boolean>(true);
  const [totalServerCards, setTotalServerCards] = useState<number>(INITIAL_CARDS.length);

  // 弹窗状态
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [votingContext, setVotingContext] = useState<{
    card: VirtualCard;
    key: string;
    label: string;
  } | null>(null);

  // 辅助函数：根据 Token 拉取首页数据
  const fetchCardsWithToken = useCallback(async (token: string) => {
    setIsLoadingCards(true);
    try {
      const url = token
        ? `/api/cards?page=1&limit=36&token=${encodeURIComponent(token)}`
        : '/api/cards?page=1&limit=36';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setCards(json.data);
          setTotalServerCards(json.total || json.data.length);
          setHasMoreServer(json.hasMore ?? false);
          setServerPage(1);
          if (json.isVipUnlocked !== undefined) {
            setIsUnlocked(Boolean(json.isVipUnlocked));
          }
        }
      }
    } catch (err) {
      console.warn('API fetch fallback to preview cards:', err);
    } finally {
      setIsLoadingCards(false);
    }
  }, []);

  // 1. 初始化安全加载：读取本地已存卡密并拉取云端数据
  useEffect(() => {
    async function initSession() {
      let activeKey = '';
      try {
        const savedKey = localStorage.getItem('ucard_license_key');
        if (savedKey) {
          const isValid = await verifyLicenseTokenClient(savedKey);
          if (isValid) {
            activeKey = savedKey;
            setLicenseKey(savedKey);
            setIsUnlocked(true);
          }
        }
      } catch (e) {
        console.warn('LocalStorage access warning:', e);
      }
      fetchCardsWithToken(activeKey);
    }

    initSession();
  }, [fetchCardsWithToken]);

  // 卡密激活成功回调
  const handleUnlockSuccess = (token: string) => {
    try {
      localStorage.setItem('ucard_license_key', token);
    } catch {}
    setLicenseKey(token);
    setIsUnlocked(true);
    fetchCardsWithToken(token);
  };

  // 卡密注销回调
  const handleUnlockReset = () => {
    try {
      localStorage.removeItem('ucard_license_key');
    } catch {}
    setLicenseKey('');
    setIsUnlocked(false);
    fetchCardsWithToken('');
  };

  // 2. 测活投票提交处理：乐观更新 UI + 后端持久化存储 (/api/vote)
  const handleVoteSubmit = async (
    cardId: string,
    scenarioKey: string,
    isSuccess: boolean,
    reason?: string
  ) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const targetScenario = c.scenarios[scenarioKey as keyof typeof c.scenarios];
        if (!targetScenario) return c;

        let newRate = targetScenario.successRate;
        let newStatus: SupportStatus = targetScenario.status;

        if (isSuccess) {
          newRate = Math.min(99, newRate + 1);
          if (newRate >= 80) newStatus = 'SUPPORTED';
        } else {
          newRate = Math.max(5, newRate - 6);
          if (newRate < 60) newStatus = 'NOT_SUPPORTED';
          else if (newRate < 80) newStatus = 'CONDITIONAL';
        }

        return {
          ...c,
          scenarios: {
            ...c.scenarios,
            [scenarioKey]: {
              ...targetScenario,
              successRate: newRate,
              status: newStatus,
              note: isSuccess ? '社区最新实测可用' : (reason || '近期有用户反馈被拒'),
            },
          },
        };
      })
    );

    // 异步同步到后端 D1 / 数据库
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, scenarioKey, isSuccess, reason }),
      });
    } catch (e) {
      console.warn('Vote submission sync error:', e);
    }
  };

  // 3. 加载更多处理：优先展开本地已拉取卡片，不够则向后端请求下一页
  const handleLoadMore = async () => {
    if (displayedCards.length > visibleCount) {
      setVisibleCount((prev) => Math.min(displayedCards.length, prev + PAGE_CHUNK));
      return;
    }
    if (!hasMoreServer || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = serverPage + 1;
      const url = licenseKey
        ? `/api/cards?page=${nextPage}&limit=36&token=${encodeURIComponent(licenseKey)}`
        : `/api/cards?page=${nextPage}&limit=36`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setCards((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newCards = json.data.filter((c: VirtualCard) => !existingIds.has(c.id));
            return [...prev, ...newCards];
          });
          setServerPage(nextPage);
          setHasMoreServer(json.hasMore ?? false);
          setVisibleCount((prev) => prev + PAGE_CHUNK);
        }
      }
    } catch (e) {
      console.error('Failed to load more cards from server:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 多维复合过滤谓词
  const displayedCards = cards
    .filter((card) => {
      // 1. 全局搜索关键词
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = card.name.toLowerCase().includes(q);
        const matchIssuer = card.issuer.toLowerCase().includes(q);
        const matchBin = card.bin.toLowerCase().includes(q);
        const matchCurrency = card.currency.toLowerCase().includes(q);
        const matchNetwork = card.network.toLowerCase().includes(q);
        if (!matchName && !matchIssuer && !matchBin && !matchCurrency && !matchNetwork) {
          return false;
        }
      }

      // 2. KYC 条件
      if (filters.kyc.idCardOnly && card.kycRequirements.idCard !== 'NEED') {
        return false;
      }
      if (filters.kyc.noOverseasProof && card.kycRequirements.overseasProof === 'NEED') {
        return false;
      }
      if (filters.kyc.noOverseasPhone && card.kycRequirements.overseasPhone === 'NEED') {
        return false;
      }

      // 3. 费用预算
      if (filters.fees.freeIssue && !card.fees.isFreeIssue) {
        return false;
      }
      if (filters.fees.freeMonthly && card.fees.monthlyFeeUSD > 0) {
        return false;
      }
      if (filters.fees.zeroDepositFee && card.fees.depositFeeRate > 0) {
        return false;
      }
      if (filters.fees.lowFxOnly && card.fees.fxRate > 0.005) {
        return false;
      }

      // 4. 支付渠道实测
      if (filters.channels.applePay && card.scenarios.applePay.status !== 'SUPPORTED') {
        return false;
      }
      if (filters.channels.googlePay && card.scenarios.googlePay.status !== 'SUPPORTED') {
        return false;
      }
      if (filters.channels.chatgpt && card.scenarios.chatgpt.status === 'NOT_SUPPORTED') {
        return false;
      }
      if (filters.channels.claude && card.scenarios.claude.status === 'NOT_SUPPORTED') {
        return false;
      }
      if (
        filters.channels.wechat &&
        card.scenarios.wechat.status !== 'SUPPORTED' &&
        card.scenarios.wechat.status !== 'CONDITIONAL'
      ) {
        return false;
      }
      if (
        filters.channels.alipay &&
        card.scenarios.alipay.status !== 'SUPPORTED' &&
        card.scenarios.alipay.status !== 'CONDITIONAL'
      ) {
        return false;
      }

      // 5. 卡组织与形态
      if (filters.cardType.network !== 'ALL') {
        if (!card.network.toLowerCase().includes(filters.cardType.network.toLowerCase())) {
          return false;
        }
      }
      if (filters.cardType.currency !== 'ALL') {
        if (card.currency.toUpperCase() !== filters.cardType.currency.toUpperCase()) {
          return false;
        }
      }
      if (filters.cardType.physicalSupported && !card.openRequirements.cardFormat.includes('实体')) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'FEE_LOWEST') {
        return a.fees.lossPer100USD - b.fees.lossPer100USD;
      }
      if (sortOption === 'ISSUE_FEE_LOWEST') {
        return a.fees.issueFeeUSD - b.fees.issueFeeUSD;
      }
      if (sortOption === 'SUCCESS_HIGHEST') {
        const avgA =
          (a.scenarios.chatgpt.successRate + a.scenarios.claude.successRate) / 2;
        const avgB =
          (b.scenarios.chatgpt.successRate + b.scenarios.claude.successRate) / 2;
        return avgB - avgA;
      }
      if (sortOption === 'DEFAULT') {
        const recA = a.isRecommended ? 1 : 0;
        const recB = b.isRecommended ? 1 : 0;
        if (recA !== recB) return recB - recA;
        return a.fees.lossPer100USD - b.fees.lossPer100USD;
      }
      return 0;
    });

  const pagedCards = displayedCards.slice(0, visibleCount);

  // 重置全部条件
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
    setSearchQuery('');
    setVisibleCount(PAGE_CHUNK);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-6">
      {/* 顶部 Brand 与 Hero 介绍区 */}
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 border border-white/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>CardRadar</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30">
                    U卡雷达
                  </span>
                </h1>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                全网加密虚拟卡实时智选 · 300+ 官网一手费率与合规审计 · 零商业返利偏差
              </p>
            </div>
          </div>

          {/* 实时状态与卡密解锁动作区 */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {isUnlocked ? (
              <button
                onClick={() => setIsUnlockModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-sm transition font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>VIP 完整特权已解锁</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUnlockModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 px-3.5 py-1.5 rounded-full shadow-lg shadow-indigo-600/20 transition font-bold cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-200" />
                <span>输入卡密解锁完整档案</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-emerald" />
              <span className="font-medium">
                {isLoadingCards ? '正在连接安全数据存储...' : `在线 (${totalServerCards} 卡)`}
              </span>
            </div>
          </div>
        </div>

        {/* 核心指标亮点横条 (Key Metrics Bar) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">官方收录卡档</div>
              <div className="text-sm font-bold text-white font-mono">{totalServerCards} 张</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">官网直连核验</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">100% 原文引证</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">真实扣款场景</div>
              <div className="text-sm font-bold text-purple-300 font-mono">7 大通道测活</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">隐形损耗测算</div>
              <div className="text-sm font-bold text-cyan-300 font-mono">充值+FX全透明</div>
            </div>
          </div>
        </div>

        {/* 游客试看提示横幅 (极佳的引流转化入口) */}
        {!isUnlocked && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>当前处于游客试看模式（已开放前 3 张精选卡试看）</span>
                </p>
                <p className="text-slate-400 mt-0.5">
                  输入专属卡密/Token 可立即解锁全部 300+ 虚拟卡完整 BIN 段、直达开卡通道与避坑指南
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUnlockModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              输入卡密解锁
            </button>
          </div>
        )}
      </header>

      {/* 导航、智能搜索、高级筛选与快捷药丸 */}
      <HeaderTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setVisibleCount(PAGE_CHUNK);
        }}
        filters={filters}
        onFilterChange={(next) => {
          setFilters(next);
          setVisibleCount(PAGE_CHUNK);
        }}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        onOpenCalculator={() => setIsCalcOpen(true)}
        onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        onResetFilters={handleResetFilters}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setVisibleCount(PAGE_CHUNK);
        }}
        matchCount={displayedCards.length}
        totalCount={cards.length}
      />

      {/* 卡片数量与状态计数条 */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            共匹配 <strong className="text-white font-mono">{displayedCards.length}</strong> / {cards.length} 张卡片档案
            {displayedCards.length > visibleCount && (
              <span className="text-slate-500">（已显示前 {visibleCount} 张）</span>
            )}
          </span>
        </div>
        {displayedCards.length > visibleCount && (
          <button
            onClick={() => setVisibleCount(displayedCards.length)}
            className="text-indigo-400 hover:text-indigo-300 transition text-[11px] underline"
          >
            一键展开全部 {displayedCards.length} 张
          </button>
        )}
      </div>

      {/* 卡片流列表 */}
      <section className="space-y-4 pt-1">
        {pagedCards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            activeTab={activeTab}
            onSelectCard={(c) => setSelectedCard(c)}
            onVoteScenario={(c, key, label) =>
              setVotingContext({ card: c, key, label })
            }
          />
        ))}

        {/* 加载更多按钮 */}
        {(displayedCards.length > visibleCount || hasMoreServer) && (
          <div className="text-center pt-4 pb-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-indigo-500/40 text-xs font-semibold shadow-lg transition disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>正在从云端安全存储加载...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-indigo-400" />
                  <span>
                    加载更多
                    {displayedCards.length > visibleCount
                      ? `（当前已解构 ${visibleCount} / 已获取 ${displayedCards.length} 张）`
                      : `（向云端数据库拉取更多档案）`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 智能空态与降级建议 (Smart Zero-Result State) */}
        {displayedCards.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-2xl text-slate-400 text-sm space-y-4 p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-base">暂无完全符合当前组合条件的卡片</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                建议尝试放宽筛选条件，或在上方搜索框直接检索卡片名称 / 发卡机构 / BIN 卡段。
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              一键重置所有筛选
            </button>
          </div>
        )}
      </section>

      {/* 底部说明与免责 */}
      <footer className="text-center py-8 text-xs text-slate-500 space-y-3 border-t border-white/5">
        <div className="flex justify-center gap-6 text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> 真实官网原文直采
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> 社区动态实测验活
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> 零中介商业干扰
          </span>
        </div>
        <p className="max-w-xl mx-auto leading-relaxed text-slate-500 text-[11px]">
          © 2026 CardRadar. 本站数据直连发卡机构官方费率表及帮助中心，仅供消费损耗对比与技术测活参考。
          请根据各大发卡行最新风控政策合理合规使用。
        </p>
      </footer>

      {/* 高级多维筛选抽屉 */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        matchCount={displayedCards.length}
        totalCount={cards.length}
      />

      {/* 损耗计算器抽屉 */}
      <CostCalculatorDrawer
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        cards={cards}
        onSelectCard={(c) => setSelectedCard(c)}
      />

      {/* 渠道测活上报弹窗 */}
      <LivenessVoteModal
        isOpen={!!votingContext}
        onClose={() => setVotingContext(null)}
        card={votingContext?.card || null}
        scenarioKey={votingContext?.key || ''}
        scenarioLabel={votingContext?.label || ''}
        onSubmitVote={handleVoteSubmit}
      />

      {/* 卡片详情与开卡指南抽屉 */}
      <CardDetailModal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        card={selectedCard}
        onOpenUnlock={() => setIsUnlockModalOpen(true)}
      />

      {/* 算法卡密 VIP 解锁弹窗 */}
      <UnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        isUnlocked={isUnlocked}
        currentKey={licenseKey}
        onSuccess={handleUnlockSuccess}
        onReset={handleUnlockReset}
      />
    </main>
  );
}
