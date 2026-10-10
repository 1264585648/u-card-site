'use client';

import React, { useState } from 'react';
import { VirtualCard } from '@/types/card';
import { X, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface LivenessVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard | null;
  scenarioKey: string;
  scenarioLabel: string;
  onSubmitVote: (
    cardId: string,
    scenarioKey: string,
    isSuccess: boolean,
    reason?: string
  ) => void;
}

export const LivenessVoteModal: React.FC<LivenessVoteModalProps> = ({
  isOpen,
  onClose,
  card,
  scenarioKey,
  scenarioLabel,
  onSubmitVote,
}) => {
  const [voteType, setVoteType] = useState<'SUCCESS' | 'FAIL'>('SUCCESS');
  const [failReason, setFailReason] = useState<string>(
    'Stripe 提示 "Your card was declined"'
  );

  if (!isOpen || !card) return null;

  const handleSubmit = () => {
    onSubmitVote(card.id, scenarioKey, voteType === 'SUCCESS', failReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-gray-700/80 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm">
              提交实测验活：{card.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">渠道：{scenarioLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-300">
            你最近 24 小时内在该渠道的使用结果如何？
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setVoteType('SUCCESS')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                voteType === 'SUCCESS'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm ring-1 ring-emerald-500'
                  : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:text-gray-200'
              }`}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-semibold">扣款顺畅</span>
            </button>

            <button
              type="button"
              onClick={() => setVoteType('FAIL')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                voteType === 'FAIL'
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm ring-1 ring-rose-500'
                  : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:text-gray-200'
              }`}
            >
              <XCircle className="w-6 h-6 text-rose-400" />
              <span className="text-xs font-semibold">支付被拒</span>
            </button>
          </div>

          {voteType === 'FAIL' && (
            <div className="space-y-1.5 pt-1 animate-in fade-in duration-100">
              <label className="text-[11px] text-gray-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>被拒原因（帮助他人避坑）</span>
              </label>
              <select
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value='Stripe 提示 "Your card was declined"'>
                  Stripe 提示 &quot;Your card was declined&quot;
                </option>
                <option value="触发 3DS 验证但收不到验证码">
                  触发 3DS 验证但收不到验证码
                </option>
                <option value="平台提示该 BIN 属于高风险发行地">
                  平台提示该 BIN 属于高风险发行地
                </option>
                <option value="要求匹配账单国家（如仅限美区卡）">
                  要求匹配账单国家（如仅限美区卡）
                </option>
                <option value="其他原因">其他未知原因</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-sm"
          >
            提交反馈
          </button>
        </div>
      </div>
    </div>
  );
};
