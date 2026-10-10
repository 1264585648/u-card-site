'use client';

import React from 'react';
import { VirtualCard } from '@/types/card';
import { X, ExternalLink, ShieldCheck, Copy, Info, CreditCard, Lock, Sparkles } from 'lucide-react';

interface CardDetailModalProps {
  card: VirtualCard | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUnlock?: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onOpenUnlock,
}) => {
  if (!isOpen || !card) return null;

  const isLocked = Boolean(card.isLocked);

  const copyBin = () => {
    if (isLocked) {
      if (onOpenUnlock) {
        onClose();
        onOpenUnlock();
      } else {
        alert('该卡片为 VIP 专属卡档，请先输入卡密解锁完整 BIN 码');
      }
      return;
    }
    navigator.clipboard.writeText(card.bin);
    alert(`已复制卡段 BIN 码：${card.bin}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-gray-700/80 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
        {/* 头部卡面展示 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-16 h-10 rounded-lg bg-gradient-to-br ${card.cardArtColor} shadow-lg border border-white/20 flex flex-col justify-between p-1.5`}
            >
              <span className="text-[9px] font-mono text-white/90">{card.currency}</span>
              <span className="text-[9px] text-right text-white font-bold">
                {card.network}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{card.name}</h3>
                {card.promoBadge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                    {card.promoBadge}
                  </span>
                )}
                {isLocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                    <Lock className="w-2.5 h-2.5" />
                    <span>需解锁</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">发行机构：{card.issuer}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 核心卡段信息 */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">BIN 卡段</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-white">
              <span className={isLocked ? 'text-amber-300' : 'text-white'}>
                {card.bin}
              </span>
              <button
                onClick={copyBin}
                className="text-gray-500 hover:text-indigo-400 transition"
                title={isLocked ? '卡密解锁完整 BIN' : '复制 BIN 码'}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">卡种属性</span>
            <span className="font-medium text-white">{card.openRequirements.cardFormat} · {card.network}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">开卡 / 起充</span>
            <span className="font-medium text-emerald-400">
              {card.openRequirements.issueFeeText} · 起充 {card.openRequirements.minDepositText}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">充值损耗 / FX</span>
            <span className="font-medium text-white">
              充值 {(card.fees.depositFeeRate * 100).toFixed(1)}% · FX {(card.fees.fxRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 开卡条件与门槛 */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>开卡条件与账户要求</span>
          </h4>
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 space-y-1 leading-relaxed">
            <p>• 开卡费用：<strong className="text-emerald-400">{card.openRequirements.issueFeeText}</strong></p>
            <p>• 起充金额：<strong className="text-white">{card.openRequirements.minDepositText}</strong></p>
            <p>• 邀请码要求：{card.openRequirements.needInviteCode === 'NEED' ? '必须通过邀请码注册' : '非必填（选填）'}</p>
            <p>• 卡片类型：{card.openRequirements.cardFormat}（{card.openRequirements.ageLimit}）</p>
          </div>
        </div>

        {/* 认证条件 (KYC 审查) */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>认证条件 (KYC 审核清单)</span>
          </h4>
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 space-y-1 leading-relaxed">
            <p>• 身份证：{card.kycRequirements.idCard === 'NEED' ? '✅ 中国大陆身份证可用' : '❌ 不支持身份证'}</p>
            <p>• 护护：{card.kycRequirements.passport === 'NEED' ? '✅ 必须护照原件扫描' : '➖ 无需护照'}</p>
            <p>• 人脸识别：{card.kycRequirements.faceRecognition === 'NEED' ? '✅ 需要手机活体扫脸' : '➖ 无需人脸'}</p>
            <p>• 海外证明：{card.kycRequirements.overseasProof === 'NEED' ? '⚠️ 需要海外地址证明 (POA/水电账单)' : '➖ 无需海外地址'}</p>
            <p>• 海外手机号：{card.kycRequirements.overseasPhone === 'NEED' ? '⚠️ 需境外号码接收短信验证' : '➖ +86 国内手机号可用'}</p>
          </div>
        </div>

        {/* 防风控避坑指南 */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400" />
            <span>绑定 ChatGPT / 海外订阅防风控建议</span>
          </h4>
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-gray-300 space-y-1 leading-relaxed">
            <p>1. <strong>干净网络环境</strong>：请务必使用对应发行地（如美区/新加坡）的原生家庭宽带 IP，避免共享数据中心节点。</p>
            <p>2. <strong>免税州账单地址</strong>：绑定 OpenAI / Stripe 建议填写俄勒冈 (Oregon) 或特拉华 (Delaware) 邮编，免除附加税费。</p>
            <p>3. <strong>卡内预留余额</strong>：Stripe 预授权通常会试扣 1~5 USD，请确保卡内至少预留 5 USDT 余额。</p>
          </div>
        </div>

        {/* 底部行动 CTA 按钮 */}
        <div className="pt-2">
          {isLocked ? (
            <button
              onClick={() => {
                onClose();
                if (onOpenUnlock) onOpenUnlock();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>输入卡密解锁官方直达通道</span>
            </button>
          ) : (
            <a
              href={card.referralUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>立即申请开通 {card.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
