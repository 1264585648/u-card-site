'use client';

import React from 'react';
import { AdvancedFilterState } from '@/types/card';
import { X, RotateCcw, Check, Shield, DollarSign, Sparkles, CreditCard, Layers } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onFilterChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
  matchCount: number;
  totalCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  matchCount,
  totalCount,
}) => {
  if (!isOpen) return null;

  const updateKyc = (key: keyof AdvancedFilterState['kyc'], val: boolean) => {
    onFilterChange({
      ...filters,
      activePersona: 'NONE',
      kyc: { ...filters.kyc, [key]: val },
    });
  };

  const updateFees = (key: keyof AdvancedFilterState['fees'], val: boolean) => {
    onFilterChange({
      ...filters,
      activePersona: 'NONE',
      fees: { ...filters.fees, [key]: val },
    });
  };

  const updateChannel = (key: keyof AdvancedFilterState['channels'], val: boolean) => {
    onFilterChange({
      ...filters,
      activePersona: 'NONE',
      channels: { ...filters.channels, [key]: val },
    });
  };

  const updateCardType = <K extends keyof AdvancedFilterState['cardType']>(
    key: K,
    val: AdvancedFilterState['cardType'][K]
  ) => {
    onFilterChange({
      ...filters,
      activePersona: 'NONE',
      cardType: { ...filters.cardType, [key]: val },
    });
  };

  // 统计已激活的过滤条件数量
  const activeFilterCount =
    Object.values(filters.kyc).filter(Boolean).length +
    Object.values(filters.fees).filter(Boolean).length +
    Object.values(filters.channels).filter(Boolean).length +
    (filters.cardType.network !== 'ALL' ? 1 : 0) +
    (filters.cardType.currency !== 'ALL' ? 1 : 0) +
    (filters.cardType.physicalSupported ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#090D18] border-l border-white/10 shadow-2xl flex flex-col specular-border">
          {/* 抽屉头部 */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">高级多维筛选</h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                    已选 {activeFilterCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                实时匹配 <span className="text-emerald-400 font-mono font-bold">{matchCount}</span> / {totalCount} 张卡片
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 筛选选项主体内容 */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* 1. 身份认证与准入门槛 (KYC) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>身份认证门槛 (KYC)</span>
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">纯中国大陆身份证 (免护照)</span>
                    <span className="text-[11px] text-slate-400 block">仅需中国身份证认证，无需出国护照</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.kyc.idCardOnly}
                    onChange={(e) => updateKyc('idCardOnly', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">无需海外地址证明 (POA)</span>
                    <span className="text-[11px] text-slate-400 block">免水电账单、境外租房合同等地址要求</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.kyc.noOverseasProof}
                    onChange={(e) => updateKyc('noOverseasProof', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">无需海外手机号 (支持 +86)</span>
                    <span className="text-[11px] text-slate-400 block">可直接使用国内手机号接收验证码</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.kyc.noOverseasPhone}
                    onChange={(e) => updateKyc('noOverseasPhone', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 2. 费用与损耗预算 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>费用与损耗预算</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateFees('freeIssue', !filters.fees.freeIssue)}
                  className={`p-3 rounded-xl text-left border transition ${
                    filters.fees.freeIssue
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <div className="text-xs font-bold">0元免费开卡</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">免首次开卡申领费</div>
                </button>

                <button
                  type="button"
                  onClick={() => updateFees('freeMonthly', !filters.fees.freeMonthly)}
                  className={`p-3 rounded-xl text-left border transition ${
                    filters.fees.freeMonthly
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <div className="text-xs font-bold">0月费 / 0年费</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">长期闲置零持有成本</div>
                </button>

                <button
                  type="button"
                  onClick={() => updateFees('zeroDepositFee', !filters.fees.zeroDepositFee)}
                  className={`p-3 rounded-xl text-left border transition ${
                    filters.fees.zeroDepositFee
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <div className="text-xs font-bold">0% 充值手续费</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">充入多少到账多少</div>
                </button>

                <button
                  type="button"
                  onClick={() => updateFees('lowFxOnly', !filters.fees.lowFxOnly)}
                  className={`p-3 rounded-xl text-left border transition ${
                    filters.fees.lowFxOnly
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <div className="text-xs font-bold">极低汇损 (≤0.5%)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">跨境消费更少滑点</div>
                </button>
              </div>
            </div>

            {/* 3. 核心支付渠道兼容 (多选) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>支付渠道实测兼容 (满足任选或多选)</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'chatgpt', label: 'ChatGPT / OpenAI', icon: '🤖' },
                  { key: 'claude', label: 'Claude / Anthropic', icon: '🔮' },
                  { key: 'applePay', label: 'Apple Pay 钱包', icon: '🍏' },
                  { key: 'googlePay', label: 'Google Pay', icon: '📱' },
                  { key: 'wechat', label: '微信支付', icon: '💬' },
                  { key: 'alipay', label: '支付宝扫码/被扫', icon: '🛍️' },
                ].map((item) => {
                  const isChecked = filters.channels[item.key as keyof typeof filters.channels];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateChannel(item.key as keyof typeof filters.channels, !isChecked)}
                      className={`p-2.5 rounded-xl text-left border flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/15'
                      }`}
                    >
                      <span className="text-xs font-medium flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. 卡组织与形态 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>卡组织与卡片属性</span>
              </h3>
              
              <div className="space-y-2.5">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">发卡卡组织</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ALL', 'Visa', 'Mastercard'] as const).map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => updateCardType('network', net)}
                        className={`py-1.5 text-xs rounded-xl font-medium border transition ${
                          filters.cardType.network === net
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {net === 'ALL' ? '不限' : net}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">结算币种</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ALL', 'USD', 'EUR'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => updateCardType('currency', curr)}
                        className={`py-1.5 text-xs rounded-xl font-medium border transition ${
                          filters.cardType.currency === curr
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {curr === 'ALL' ? '不限' : curr}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">支持实体卡申领</span>
                    <span className="text-[11px] text-slate-400 block">可邮寄实体卡片并支持全球 ATM 取现</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.cardType.physicalSupported}
                    onChange={(e) => updateCardType('physicalSupported', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 抽屉底部操作条 */}
          <div className="p-4 border-t border-white/10 bg-[#0B101D] flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置条件</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
            >
              <span>查看匹配的 {matchCount} 张卡片</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
