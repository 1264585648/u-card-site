import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '虚拟卡 & 加密 U 卡聚合对比平台 | 最全开卡门槛与支付测活',
  description: '实时更新各大加密U卡、虚拟信用卡开卡条件（身份证/护照）、微信支付宝与ChatGPT/Claude真实扣款测活及到手损耗对比。',
  keywords: ['虚拟信用卡', '加密U卡', 'Bybit卡', 'MEXC卡', 'ChatGPT绑卡', 'Claude支付', '微信出金', 'USDT消费'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-gray-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
