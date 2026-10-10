'use client';

import React from 'react';
import {
  ArrowUpDown,
  Calculator,
  DollarSign,
  Shield,
  CreditCard,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { AdvancedFilterState } from '@/types/card';

export type ActiveTab = 'PAYMENT_SUPPORT' | 'FEES_AND_RATES' | 'KYC_REQUIREMENTS' | 'OPEN_REQUIREMENTS';
export type SortOption = 'DEFAULT' | 'FEE_LOWEST' | 'SUCCESS_HIGHEST' | 'ISSUE_FEE_LOWEST' | 'DEPOSIT_FEE_LOWEST';

interface HeaderTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  filters: AdvancedFilterState;
  onFilterChange: (filters: AdvancedFilterState) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  onOpenCalculator: () => void;
  onOpenFilterDrawer: () => void;
  onResetFilters: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  matchCount: number;
  totalCount: number;
}

export const HeaderTabs: React.FC<HeaderTabsProps> = ({
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  sortOption,
  onSortOptionChange,
  onOpenCalculator,
  onOpenFilterDrawer,
  onResetFilters,
  searchQuery = '',
  onSearchChange,
  matchCount,
  totalCount,
}) => {
  const safeFilters = filters || {
    kyc: { idCardOnly: false, noOverseasProof: false, noOverseasPhone: false },
    fees: { freeIssue: false, freeMonthly: false, zeroDepositFee: false, lowFxOnly: false },
    channels: { applePay: false, googlePay: false, chatgpt: false, claude: false, wechat: false, alipay: false },
    cardType: { network: 'ALL', currency: 'ALL', physicalSupported: false },
    activePersona: 'NONE',
  };
  // 快捷预设点击切换
  const handlePersonaClick = (persona: AdvancedFilterState['activePersona']) => {
    if (filters.activePersona === persona) {
      onResetFilters();
      return;
    }

    const next: AdvancedFilterState = {
      kyc: { idCardOnly: false, noOverseasProof: false, noOverseasPhone: false },
      fees: { freeIssue: false, freeMonthly: false, zeroDepositFee: false, lowFxOnly: false },
      channels: { applePay: false, googlePay: false, chatgpt: false, claude: false, wechat: false, alipay: false },
      cardType: { network: 'ALL', currency: 'ALL', physicalSupported: false },
      activePersona: persona,
    };

    if (persona === 'AI_SUBSCRIBE') {
      next.channels.chatgpt = true;
      next.channels.claude = true;
    } else if (persona === 'ID_CARD_ONLY') {
      next.kyc.idCardOnly = true;
      next.kyc.noOverseasProof = true;
    } else if (persona === 'ZERO_COST') {
      next.fees.freeIssue = true;
      next.fees.freeMonthly = true;
    } else if (persona === 'LOWEST_LOSS') {
      next.fees.zeroDepositFee = true;
      next.fees.lowFxOnly = true;
    } else if (persona === 'APPLE_PAY') {
      next.channels.applePay = true;
    }

    onFilterChange(next);
  };

  // 收集当前生效的标签
  const activeTags: { label: string; onRemove: () => void }[] = [];

  if (safeFilters.kyc.idCardOnly) {
    activeTags.push({
      label: '纯大陆身份证',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', kyc: { ...safeFilters.kyc, idCardOnly: false } }),
    });
  }
  if (safeFilters.kyc.noOverseasProof) {
    activeTags.push({
      label: '免海外地址证明',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', kyc: { ...safeFilters.kyc, noOverseasProof: false } }),
    });
  }
  if (safeFilters.kyc.noOverseasPhone) {
    activeTags.push({
      label: '免海外手机号',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', kyc: { ...safeFilters.kyc, noOverseasPhone: false } }),
    });
  }
  if (safeFilters.fees.freeIssue) {
    activeTags.push({
      label: '0元开卡',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', fees: { ...safeFilters.fees, freeIssue: false } }),
    });
  }
  if (safeFilters.fees.freeMonthly) {
    activeTags.push({
      label: '0月费/年费',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', fees: { ...safeFilters.fees, freeMonthly: false } }),
    });
  }
  if (safeFilters.fees.zeroDepositFee) {
    activeTags.push({
      label: '0%充值手续费',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', fees: { ...safeFilters.fees, zeroDepositFee: false } }),
    });
  }
  if (safeFilters.fees.lowFxOnly) {
    activeTags.push({
      label: '极低汇损(≤0.5%)',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', fees: { ...safeFilters.fees, lowFxOnly: false } }),
    });
  }
  if (safeFilters.channels.chatgpt) {
    activeTags.push({
      label: '支持 ChatGPT',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', channels: { ...safeFilters.channels, chatgpt: false } }),
    });
  }
  if (safeFilters.channels.claude) {
    activeTags.push({
      label: '支持 Claude',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', channels: { ...safeFilters.channels, claude: false } }),
    });
  }
  if (safeFilters.channels.applePay) {
    activeTags.push({
      label: '支持 Apple Pay',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', channels: { ...safeFilters.channels, applePay: false } }),
    });
  }
  if (safeFilters.channels.googlePay) {
    activeTags.push({
      label: '支持 Google Pay',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', channels: { ...safeFilters.channels, googlePay: false } }),
    });
  }
  if (safeFilters.channels.wechat) {
    activeTags.push({
      label: '支持 微信支付',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', channels: { ...safeFilters.channels, wechat: false } }),
    });
  }
  if (safeFilters.channels.alipay) {
    activeTags.push({
      label: '支持 支付宝',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', channels: { ...safeFilters.channels, alipay: false } }),
    });
  }
  if (safeFilters.cardType.network !== 'ALL') {
    activeTags.push({
      label: `卡组织: ${safeFilters.cardType.network}`,
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', cardType: { ...safeFilters.cardType, network: 'ALL' } }),
    });
  }
  if (safeFilters.cardType.currency !== 'ALL') {
    activeTags.push({
      label: `币种: ${safeFilters.cardType.currency}`,
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', cardType: { ...safeFilters.cardType, currency: 'ALL' } }),
    });
  }
  if (safeFilters.cardType.physicalSupported) {
    activeTags.push({
      label: '支持实体卡',
      onRemove: () =>
        onFilterChange({ ...safeFilters, activePersona: 'NONE', cardType: { ...safeFilters.cardType, physicalSupported: false } }),
    });
  }

  const activeFilterCount = activeTags.length;

  return (
    <div className="space-y-4">
      {/* 搜索栏 + 高级筛选抽屉入口 + 损耗精算器 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* 智能检索输入框 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="搜索卡名、发卡机构、BIN码 (如 540534) 或币种..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 高级筛选抽屉触发按钮 */}
          <button
            onClick={onOpenFilterDrawer}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition shadow-sm ${
              activeFilterCount > 0
                ? 'bg-indigo-600/25 border-indigo-500/60 text-indigo-300 shadow-indigo-950/50'
                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>高级筛选</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* 损耗精算器按钮 */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold shadow-sm transition"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">损耗测算</span>
          </button>
        </div>
      </div>

      {/* 四大主视角导航栏 (切换 Tab) */}
      <div className="flex justify-center">
        <div className="bg-slate-900/90 p-1.5 rounded-2xl flex items-center border border-white/10 shadow-2xl max-w-2xl w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('FEES_AND_RATES')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'FEES_AND_RATES'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>费用与汇率</span>
          </button>

          <button
            onClick={() => onTabChange('PAYMENT_SUPPORT')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'PAYMENT_SUPPORT'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>支付实测支持</span>
          </button>

          <button
            onClick={() => onTabChange('KYC_REQUIREMENTS')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'KYC_REQUIREMENTS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>证件认证条件</span>
          </button>

          <button
            onClick={() => onTabChange('OPEN_REQUIREMENTS')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'OPEN_REQUIREMENTS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>开卡准入门槛</span>
          </button>
        </div>
      </div>

      {/* 快捷人群与高频场景药丸 (Persona Quick Filter Chips) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onResetFilters()}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              filters.activePersona === 'NONE' && activeFilterCount === 0
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
          >
            全部档案
          </button>

          <button
            onClick={() => handlePersonaClick('AI_SUBSCRIBE')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              filters.activePersona === 'AI_SUBSCRIBE'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
          >
            <span>🤖 AI订阅首选 (GPT+Claude)</span>
          </button>

          <button
            onClick={() => handlePersonaClick('ID_CARD_ONLY')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              filters.activePersona === 'ID_CARD_ONLY'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
          >
            <span>🪪 纯大陆身份证 (免护照)</span>
          </button>

          <button
            onClick={() => handlePersonaClick('ZERO_COST')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              filters.activePersona === 'ZERO_COST'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
          >
            <span>🆓 0元开卡+免年费</span>
          </button>

          <button
            onClick={() => handlePersonaClick('LOWEST_LOSS')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              filters.activePersona === 'LOWEST_LOSS'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
          >
            <span>⚡ 0%充值费+低汇损</span>
          </button>

          <button
            onClick={() => handlePersonaClick('APPLE_PAY')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              filters.activePersona === 'APPLE_PAY'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
          >
            <span>🍏 Apple Pay 绑定</span>
          </button>
        </div>

        {/* 排序下拉 */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
            className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="DEFAULT">默认综合推荐</option>
            <option value="FEE_LOWEST">百U损耗最低 (费率最优)</option>
            <option value="ISSUE_FEE_LOWEST">开卡费最低</option>
            <option value="SUCCESS_HIGHEST">AI 订阅实测成功率最高</option>
          </select>
        </div>
      </div>

      {/* 活跃过滤条件胶囊栏 (Active Filter Badges) */}
      {activeFilterCount > 0 && (
        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">已生效条件:</span>
            {activeTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium group"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={tag.onRemove}
                  className="hover:text-white text-indigo-400/80 transition"
                  title="移除此条件"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition ml-auto"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>清空全部条件</span>
          </button>
        </div>
      )}
    </div>
  );
};
