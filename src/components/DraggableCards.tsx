import { DraggableCardList } from './cards';
import { DraggableCardsProps } from '@/types/card.types';

/**
 * 可拖拽卡片组件 - 兼容旧的API
 * 这是一个包装组件，保持向后兼容性
 */
export default function DraggableCards(props: DraggableCardsProps) {
  return <DraggableCardList {...props} />;
}

// 重新导出类型以保持兼容性
export type { CardItem } from '@/types/card.types'; 