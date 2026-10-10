'use client';

import React from 'react';
import { VirtualCard, RequirementStatus, SupportStatus } from '@/types/card';
import { ChevronRight, CreditCard, TrendingDown, Wifi, Sparkles, AlertCircle } from 'lucide-react';
import { ActiveTab } from './HeaderTabs';

interface CardItemProps {
  card: VirtualCard;
  activeTab: ActiveTab;
  onSelectCard: (card: VirtualCard) => void;
  onVoteScenario: (card: VirtualCard, scenarioKey: string, scenarioLabel: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  activeTab,
  onSelectCard,
  onVoteScenario,
}) => {
  // 渲染认证条件圆标 (大号高对比度圆形徽章)
  const renderReqCircle = (status: RequirementStatus) => {
    switch (status) {
      case 'NEED':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xs shadow-sm">
            ✓
          </div>
        );
      case 'NO_NEED':
        return (
          <div className="w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-400 font-bold text-xs">
            -
          </div>
        );
      case 'CONDITIONAL':
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-xs shadow-sm">
            ?
          </div>
        );
    }
  };

  // 渲染支付支持渠道徽章
  const renderScenarioBadge = (
    key: string,
    label: string,
    status: SupportStatus,
    note: string,
    successRate: number
  ) => {
    let icon = '✓';
    let statusText = '畅通';
    let badgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
    let iconClass = 'bg-emerald-500 text-slate-950 font-black';
    let isHighSuccess = true;

    if (status === 'CONDITIONAL') {
      icon = '!';
      statusText = '有限';
      badgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      iconClass = 'bg-amber-400 text-slate-950 font-black';
      isHighSuccess = false;
    } else if (status === 'NOT_SUPPORTED') {
      icon = '✕';
      statusText = '拦截';
      badgeClass = 'text-slate-400 bg-slate-800/40 border-slate-700/40';
      iconClass = 'bg-slate-700 text-slate-200 font-black';
      isHighSuccess = false;
    } else if (status === 'UNCONFIRMED') {
      icon = '?';
      statusText = '待确认';
      badgeClass = 'text-slate-400 bg-slate-800/20 border-slate-700/30';
      iconClass = 'bg-slate-600 text-slate-200 font-black';
      isHighSuccess = false;
    }

    return (
      <div
        key={key}
        onClick={(e) => {
          e.stopPropagation();
          onVoteScenario(card, key, label);
        }}
        className="flex flex-col items-center justify-between py-2.5 px-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group relative"
      >
        <div className="relative mb-1.5 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/90 text-slate-200 border border-white/5 shadow-inner">
          <span className="text-[11px] font-bold tracking-tight">{label.slice(0, 2)}</span>
          <span
            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shadow-sm ${iconClass}`}
          >
            {icon}
          </span>
          {isHighSuccess && (
            <span className="absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full bg-emerald-400 live-pulse-emerald" />
          )}
        </div>

        <span className="text-[11px] text-slate-300 font-medium">{label}</span>
        
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${badgeClass} font-mono`}>
            {statusText}
          </span>
          <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">
            {successRate}%
          </span>
        </div>

        {/* 悬停提示 */}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-slate-950/95 text-[10px] text-slate-200 border border-slate-700 shadow-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-30">
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-400 font-semibold">{label}实测：</span>
            <span>{note}</span>
            <span className="text-slate-400 font-mono">({successRate}% 成功率)</span>
          </div>
        </div>
      </div>
    );
  };

  // 根据当前视图渲染不同的副标题文案
  const getSubtitle = () => {
    if (activeTab === 'FEES_AND_RATES') {
      return card.fees.summary;
    }
    if (activeTab === 'KYC_REQUIREMENTS') {
      return card.kycRequirements.summary;
    }
    if (activeTab === 'OPEN_REQUIREMENTS') {
      return card.openRequirements.summary;
    }
    return card.fees.summary;
  };

  return (
    <div
      onClick={() => onSelectCard(card)}
      className="glass-panel glass-panel-hover rounded-2xl p-4 md:p-5 cursor-pointer relative overflow-hidden specular-border"
    >
      {/* 推荐或活动角标 */}
      {card.promoBadge && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-purple-600 text-white text-[10px] font-semibold px-3 py-0.5 rounded-bl-xl shadow-sm tracking-wide">
          {card.promoBadge}
        </div>
      )}

      {/* 卡片头部行 */}
      <div className="flex items-center justify-between pb-3.5">
        <div className="flex items-center gap-3.5">
          {/* 拟物化微型 3D 拟态卡面 */}
          <div
            className={`w-14 h-9 rounded-lg bg-gradient-to-br ${card.cardArtColor} shadow-lg border border-white/20 flex flex-col justify-between p-1.5 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}
          >
            {/* 卡面金属反光与微型高光线条 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-center text-[8px] text-white/90 relative z-10">
              <span className="font-mono text-[8px] font-bold tracking-wider">{card.currency}</span>
              <Wifi className="w-2.5 h-2.5 text-white/70 rotate-90" />
            </div>

            <div className="flex justify-between items-end relative z-10">
              {/* 金色金属芯片仿真实体 */}
              <div className="w-3 h-2 rounded-[2px] bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-600/50 shadow-inner" />
              <span className="text-right text-[8px] text-white font-extrabold tracking-tight">
                {card.network}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base md:text-lg tracking-tight">
                {card.name}
              </h3>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                  card.isLocked
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700/50'
                }`}
              >
                {card.isLocked ? `BIN ${card.bin} 🔒` : `BIN ${card.bin}`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
              {getSubtitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-indigo-400/80 font-medium hidden sm:inline group-hover:text-indigo-300 transition">
            查看详情
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
        </div>
      </div>

      {/* 核心展示区切换 (4 大模式) */}

      {/* 视图 1: 费用与汇率 */}
      {activeTab === 'FEES_AND_RATES' && (
        <div className="space-y-2.5 pt-3 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 mb-1">开卡费用</span>
              <span className={`text-xs font-semibold ${card.fees.isFreeIssue ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                {card.fees.issueFeeText}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 mb-1">充值手续费</span>
              <span className={`text-xs font-semibold ${card.fees.depositFeeRate === 0 ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                {card.fees.depositFeeText}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 mb-1">跨境汇损 (FX)</span>
              <span className={`text-xs font-semibold ${card.fees.fxRate <= 0.005 ? 'text-emerald-400 font-bold' : 'text-amber-300'}`}>
                {card.fees.fxRateText}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 mb-1">月费 / 年费</span>
              <span className="text-xs font-medium text-slate-300">
                {card.fees.monthlyFeeText}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col justify-between col-span-2 sm:col-span-1 shadow-inner">
              <span className="text-[11px] text-indigo-300 flex items-center gap-1 mb-1 font-medium">
                <TrendingDown className="w-3 h-3 text-indigo-400" />
                <span>百U损耗估算</span>
              </span>
              <div className="text-xs font-bold text-white font-mono tabular-nums">
                +{card.fees.lossPer100USD.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">USDT</span>
              </div>
            </div>
          </div>

          {/* 可视化损耗结构条 */}
          <div className="p-2 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-[11px] text-slate-400 px-3">
            <span className="text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> 损耗构成：
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                充值扣点 {(card.fees.depositFeeRate * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                汇损 (FX) {(card.fees.fxRate * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1 text-slate-300 font-mono font-medium">
                消费 $100 实际支出 ≈ ${(100 + card.fees.lossPer100USD).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 视图 2: 认证条件 (KYC 身份核实) */}
      {activeTab === 'KYC_REQUIREMENTS' && (
        <div className="grid grid-cols-5 gap-2 pt-3 border-t border-white/5">
          <div className="flex flex-col items-center gap-1.5 py-1">
            <span className="text-xs text-slate-400 font-medium">邀请码</span>
            {renderReqCircle(card.openRequirements.needInviteCode)}
          </div>
          <div className="flex flex-col items-center gap-1.5 py-1">
            <span className="text-xs text-slate-400 font-medium">大陆身份证</span>
            {renderReqCircle(card.kycRequirements.idCard)}
          </div>
          <div className="flex flex-col items-center gap-1.5 py-1">
            <span className="text-xs text-slate-400 font-medium">护照要求</span>
            {renderReqCircle(card.kycRequirements.passport)}
          </div>
          <div className="flex flex-col items-center gap-1.5 py-1">
            <span className="text-xs text-slate-400 font-medium">海外地址证明</span>
            {renderReqCircle(card.kycRequirements.overseasProof)}
          </div>
          <div className="flex flex-col items-center gap-1.5 py-1">
            <span className="text-xs text-slate-400 font-medium">海外手机号</span>
            {renderReqCircle(card.kycRequirements.overseasPhone)}
          </div>
        </div>
      )}

      {/* 视图 3: 开卡门槛 */}
      {activeTab === 'OPEN_REQUIREMENTS' && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-3 border-t border-white/5 text-center">
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 mb-0.5">开卡费用</span>
            <span className="text-xs font-semibold text-emerald-400">
              {card.openRequirements.issueFeeText}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 mb-0.5">起充门槛</span>
            <span className="text-xs font-semibold text-white">
              {card.openRequirements.minDepositText}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 mb-0.5">卡片形态</span>
            <span className="text-xs font-medium text-slate-200">
              {card.openRequirements.cardFormat}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 mb-0.5">邀请码</span>
            <span className={`text-xs font-medium ${card.openRequirements.needInviteCode === 'NEED' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
              {card.openRequirements.needInviteCode === 'NEED' ? '必须填写' : '可选/无需'}
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 mb-0.5">年龄准入</span>
            <span className="text-xs font-semibold text-indigo-300">
              {card.openRequirements.ageLimit}
            </span>
          </div>
        </div>
      )}

      {/* 视图 4: 支付支持 (微信/支付宝/ApplePay/GooglePay/ChatGPT/Claude) */}
      {activeTab === 'PAYMENT_SUPPORT' && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-white/5">
          {renderScenarioBadge(
            'wechat',
            '微信支付',
            card.scenarios.wechat.status,
            card.scenarios.wechat.note,
            card.scenarios.wechat.successRate
          )}
          {renderScenarioBadge(
            'alipay',
            '支付宝',
            card.scenarios.alipay.status,
            card.scenarios.alipay.note,
            card.scenarios.alipay.successRate
          )}
          {renderScenarioBadge(
            'applePay',
            'Apple Pay',
            card.scenarios.applePay.status,
            card.scenarios.applePay.note,
            card.scenarios.applePay.successRate
          )}
          {renderScenarioBadge(
            'googlePay',
            'Google Pay',
            card.scenarios.googlePay.status,
            card.scenarios.googlePay.note,
            card.scenarios.googlePay.successRate
          )}
          {renderScenarioBadge(
            'chatgpt',
            'ChatGPT',
            card.scenarios.chatgpt.status,
            card.scenarios.chatgpt.note,
            card.scenarios.chatgpt.successRate
          )}
          {renderScenarioBadge(
            'claude',
            'Claude',
            card.scenarios.claude.status,
            card.scenarios.claude.note,
            card.scenarios.claude.successRate
          )}
        </div>
      )}
    </div>
  );
};
