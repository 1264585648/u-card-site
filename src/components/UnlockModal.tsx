'use client';

import React, { useState, useEffect } from 'react';
import { X, KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Lock, ArrowRight, MessageCircle } from 'lucide-react';
import { formatLicenseKeyInput, verifyLicenseTokenClient } from '@/lib/license';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  currentKey: string;
  onSuccess: (token: string) => void;
  onReset: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  currentKey,
  onSuccess,
  onReset,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputKey('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setErrorMsg('');
    setInputKey(formatLicenseKeyInput(raw));
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputKey.trim()) {
      setErrorMsg('请输入卡密或 Token');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      // 1. 前端先行即时验算
      const localValid = await verifyLicenseTokenClient(inputKey);
      
      // 2. 服务端 /api/verify 双重兜底核验
      let serverValid = localValid;
      try {
        const res = await fetch(`/api/verify?token=${encodeURIComponent(inputKey)}`);
        if (res.ok) {
          const json = await res.json();
          serverValid = json.valid;
        }
      } catch (err) {
        // 网络异常时，以前端算法验算为准
        console.warn('API verify fallback to client check:', err);
      }

      if (serverValid) {
        setSuccessMsg('🎉 卡密激活成功！全网卡片档案已完全解锁');
        setTimeout(() => {
          onSuccess(inputKey);
          onClose();
        }, 800);
      } else {
        setErrorMsg('无效的卡密激活码，请核对是否输入正确或已过期');
      }
    } catch {
      setErrorMsg('验算服务异常，请稍后再试');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-gray-700/80 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
        {/* 背景光斑 */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 头部标题与关闭按钮 */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>解锁 VIP 完整卡片库</span>
                {isUnlocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    已激活
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                输入专属卡密，解锁 300+ 虚拟卡完整 BIN 与开卡通道
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 当前如果已经解锁，显示状态与更换选项 */}
        {isUnlocked ? (
          <div className="space-y-4 pt-1 relative z-10">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">您当前已享有 VIP 完整访问特权</p>
                <p className="text-xs text-emerald-400/90 font-mono mt-0.5">
                  已绑定卡密：{currentKey ? `${currentKey.slice(0, 10)}****` : '永久已激活'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  onReset();
                  setInputKey('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 transition underline"
              >
                注销此卡密
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
              >
                我知道了
              </button>
            </div>
          </div>
        ) : (
          /* 未解锁：卡密输入表单 */
          <form onSubmit={handleVerify} className="space-y-4 pt-1 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                卡密兑换码 / Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputKey}
                  onChange={handleInputChange}
                  placeholder="UCARD-XXXX-XXXX-XXXX-XXXX"
                  maxLength={29}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isVerifying ? (
                <span>正在验算卡密特征...</span>
              ) : (
                <>
                  <span>立即验证并解锁</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 引流转化板块 (Lead-Gen Box) */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/20 relative z-10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>如何获取专属激活卡密？</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              限时引流特惠
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            加入社区群或联系官方客服，发送暗号「<strong className="text-white">U卡雷达</strong>」，即可免费获取全站解锁卡密 / 专属 VIP 访问码。
          </p>
          <div className="pt-1 flex items-center gap-2">
            <div className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800/80 border border-white/5 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">官方微信/TG客服：</span>
              <span className="font-mono text-indigo-400 font-bold select-all">@ucard_radar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
