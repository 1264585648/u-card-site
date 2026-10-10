import { VirtualCard } from '@/types/card';
import previewCardsJson from './previewCards.json';

// 安全隔离：客户端仅保留少量推荐卡做骨架屏与离线兜底，全量数据通过后端 API (/api/cards) 安全按需拉取
export const INITIAL_CARDS: VirtualCard[] = previewCardsJson as VirtualCard[];
