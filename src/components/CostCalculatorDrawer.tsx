'use client';

import React, { useState } from 'react';
import { VirtualCard } from '@/types/card';
import { X, Sparkles, Calculator, ArrowRight, Zap, TrendingDown } from 'lucide-react';

interface CostCalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cards: VirtualCard[];
  onSelectCard: (card: VirtualCard) => void;
}

export const CostCalculatorDrawer: React.FC<CostCalculatorDrawerProps> = ({
  isOpen,
  onClose,
  cards,
  onSelectCard,
}) => {
  const [targetAmount, setTargetAmount] = useState<number>(20);
  const [networkFee, setNetworkFee] = useState<number>(0);
  const [includeIssueFee, setIncludeIssueFee] = useState<boolean>(false);

  if (!isOpen) return null;

  // 计算每张卡的综合到账成本
  const calculatedCards = cards.map((card) => {
    const issueCost = includeIssueFee ? card.fees.issueFeeUSD : 0;
    const fxCost = targetAmount * card.fees.fxRate;
    const subtotal = targetAmount + fxCost;
    // 反算充值扣费
    const totalDepositNeed = card.fees.depositFeeRate < 1 ? subtotal / (1 - card.fees.depositFeeRate) : subtotal;
    const depositCost = totalDepositNeed - subtotal;
    const finalCost = totalDepositNeed + networkFee + issueCost;
    const totalLoss = finalCost - targetAmount;
    const lossPercent =
      targetAmount > 0 ? ((totalLoss / targetAmount) * 100).toFixed(1) : '0.0';

    return {
      ...card,
      depositCost: depositCost.toFixed(2),
      fxCost: fxCost.toFixed(2),
      finalCost: finalCost.toFixed(2),
      totalLoss: totalLoss.toFixed(2),
      lossPercent,
      details: `充值费 ${(card.fees.depositFeeRate * 100).toFixed(1)}% + FX ${(
        card.fees.fxRate * 100
      ).toFixed(1)}%`,
    };
  });

  // 按成本升序排序
  calculatedCards.sort((a, b) => parseFloat(a.finalCost) - parseFloat(b.finalCost));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B101D] border border-white/10 rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden specular-border">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>真实综合损耗精算器</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  全链路反算
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                精确反算充值扣点、链上 Gas 费与跨境 FX 汇损后的净支出 USDT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 控制面板 */}
        <div className="p-5 bg-slate-900/60 border-b border-white/5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                消费目标金额 (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 text-sm font-semibold">$</span>
                <input
                  type="number"
                  value={targetAmount}
                  min={1}
                  onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-7 pr-3 py-1.5 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                链上网络转账 Gas
              </label>
              <select
                value={networkFee}
                onChange={(e) => setNetworkFee(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={0}>交易所现货内转 (0 U)</option>
                <option value={0.5}>Arbitrum/Polygon (~0.5 U)</option>
                <option value={1.0}>TRC20 外部转账 (~1.0 U)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                首年开卡费均摊
              </label>
              <select
                value={includeIssueFee ? '1' : '0'}
                onChange={(e) => setIncludeIssueFee(e.target.value === '1')}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="0">仅计单次消费</option>
                <option value="1">计入初始开卡费</option>
              </select>
            </div>
          </div>

          {/* 快捷场景按钮 */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> 预设场景:
            </span>
            <button
              onClick={() => setTargetAmount(20)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                targetAmount === 20
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'
              }`}
            >
              $20 (ChatGPT/Claude)
            </button>
            <button
              onClick={() => setTargetAmount(30)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                targetAmount === 30
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'
              }`}
            >
              $30 (Midjourney)
            </button>
            <button
              onClick={() => setTargetAmount(100)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                targetAmount === 100
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'
              }`}
            >
              $100 (AWS/海外服务器)
            </button>
            <button
              onClick={() => setTargetAmount(300)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                targetAmount === 300
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'
              }`}
            >
              $300 (海淘大额消费)
            </button>
          </div>
        </div>

        {/* 排序结果列表 */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          <div className="flex justify-between items-center text-xs text-slate-400 px-1 pb-1">
            <span>性价比排行（实际需消耗 USDT 由少到多）</span>
            <span>实际支付总计</span>
          </div>

          {calculatedCards.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectCard(item);
                onClose();
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                idx === 0
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 shadow-md shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-white/5 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* 排名徽标 */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    idx === 0
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : idx === 1
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm tracking-tight">{item.name}</span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        最优性价比
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{item.details}</span>
                    {includeIssueFee && item.fees.issueFeeUSD > 0 && (
                      <span className="text-amber-400 font-mono">(含开卡费 {item.fees.issueFeeUSD}U)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {item.finalCost}{' '}
                  <span className="text-xs text-slate-400 font-normal">USDT</span>
                </div>
                <div
                  className={`text-[11px] font-mono font-medium ${
                    idx === 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  +{item.lossPercent}% 损耗 (${item.totalLoss})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
