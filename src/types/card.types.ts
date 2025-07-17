/**
 * 卡片相关类型定义
 */

/**
 * 卡片项数据结构
 */
export interface CardItem {
  id: string;
  content: string;
}

/**
 * 拖拽卡片组件属性
 */
export interface DraggableCardsProps {
  initialCards?: CardItem[];
  onCardsChange?: (cards: CardItem[]) => void;
}

/**
 * 单个可排序卡片组件属性
 */
export interface SortableCardProps {
  card: CardItem;
  index: number;
  isEditing: boolean;
  editContent: string;
  onEditStart: (id: string) => void;
  onEditChange: (content: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
} 