export type RequirementStatus = 'NEED' | 'NO_NEED' | 'CONDITIONAL' | 'UNKNOWN';

export type SupportStatus = 'SUPPORTED' | 'CONDITIONAL' | 'NOT_SUPPORTED' | 'UNCONFIRMED';

// 认证条件 (KYC 身份核实)
export interface KycRequirements {
  idCard: RequirementStatus;          // 身份证 (中国大陆)
  passport: RequirementStatus;        // 护照
  faceRecognition: RequirementStatus; // 人脸活体识别
  overseasProof: RequirementStatus;   // 海外地址证明 (POA)
  overseasPhone: RequirementStatus;   // 海外手机号 (非+86)
  summary: string;
}

// 开卡门槛 (平台规则与准入)
export interface OpenRequirements {
  needInviteCode: RequirementStatus;  // 邀请码
  issueFeeText: string;               // 开卡费显示
  minDepositText: string;             // 起充门槛显示
  cardFormat: '虚拟卡' | '实体卡' | '虚拟+实体';
  ageLimit: string;                   // 年龄限制: 18+
  promoText: string;                  // 活动赠金
  summary: string;
}

// 支付支持兼容
export interface ScenarioSupport {
  status: SupportStatus;
  label: string;
  successRate: number; // 0 - 100
  note: string;
}

export interface CardScenarios {
  wechat: ScenarioSupport;
  alipay: ScenarioSupport;
  applePay: ScenarioSupport;
  googlePay: ScenarioSupport;
  chatgpt: ScenarioSupport;
  claude: ScenarioSupport;
}

// 费用与汇率详情 (专属费率 TAB)
export interface CardFeeDetail {
  issueFeeUSD: number;          // 开卡费数值
  issueFeeText: string;         // 开卡费文案: 0 USD (限免) / 10 USD
  isFreeIssue: boolean;         // 是否免开卡费
  depositFeeRate: number;       // 充值费率数值: 0.01 = 1%
  depositFeeText: string;       // 充值费文案: 0% 交易所内扣 / 1.0%
  fxRate: number;               // 跨境汇损 FX 数值: 0.009 = 0.9%
  fxRateText: string;           // 汇损文案: 0.9% 极低 / 1.5%
  monthlyFeeUSD: number;        // 月费/年费数值
  monthlyFeeText: string;       // 月费文案: 0 USD 免年费 / 1 USD/月
  atmFeeText: string;           // ATM 提现费: 2% / 不支持
  lossPer100USD: number;        // 消费 100 美元综合磨损估算 (USDT)
  summary: string;
}

// 虚拟卡实体定义
export interface VirtualCard {
  id: string;
  name: string;
  network: 'Visa' | 'Mastercard' | 'UnionPay' | 'Visa / Mastercard' | string;
  issuer: string;
  currency: string;
  bin: string;
  cardArtColor: string;
  cardImage?: string;
  fees: CardFeeDetail;                // 费用与汇率
  kycRequirements: KycRequirements;   // 认证条件
  openRequirements: OpenRequirements; // 开卡门槛
  scenarios: CardScenarios;           // 支付支持
  referralUrl: string;
  promoBadge?: string;
  isRecommended?: boolean;
  isLocked?: boolean;                 // 算法卡密保护：未解锁状态
}

// 高级多维筛选状态接口
export interface AdvancedFilterState {
  // 1. KYC / 证件门槛
  kyc: {
    idCardOnly: boolean;          // 纯中国身份证 (免护照)
    noOverseasProof: boolean;     // 无需海外地址证明
    noOverseasPhone: boolean;     // 无需海外手机号
  };
  // 2. 费用与损耗预算
  fees: {
    freeIssue: boolean;           // 0元免费开卡
    freeMonthly: boolean;         // 0月费/0年费
    zeroDepositFee: boolean;      // 0% 充值手续费
    lowFxOnly: boolean;           // 汇损 <= 0.5%
  };
  // 3. 核心渠道实测兼容 (多选)
  channels: {
    applePay: boolean;
    googlePay: boolean;
    chatgpt: boolean;
    claude: boolean;
    wechat: boolean;
    alipay: boolean;
  };
  // 4. 卡组织与形态
  cardType: {
    network: 'ALL' | 'Visa' | 'Mastercard';
    currency: 'ALL' | 'USD' | 'EUR';
    physicalSupported: boolean;
  };
  // 5. 快捷人群画像
  activePersona: 'NONE' | 'AI_SUBSCRIBE' | 'ID_CARD_ONLY' | 'ZERO_COST' | 'LOWEST_LOSS' | 'APPLE_PAY';
}

export const DEFAULT_FILTER_STATE: AdvancedFilterState = {
  kyc: {
    idCardOnly: false,
    noOverseasProof: false,
    noOverseasPhone: false,
  },
  fees: {
    freeIssue: false,
    freeMonthly: false,
    zeroDepositFee: false,
    lowFxOnly: false,
  },
  channels: {
    applePay: false,
    googlePay: false,
    chatgpt: false,
    claude: false,
    wechat: false,
    alipay: false,
  },
  cardType: {
    network: 'ALL',
    currency: 'ALL',
    physicalSupported: false,
  },
  activePersona: 'NONE',
};

