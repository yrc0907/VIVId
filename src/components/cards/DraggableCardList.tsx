import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { SortableCard } from './SortableCard';
import { CardItem, DraggableCardsProps } from '@/types/card.types';

/**
 * 可拖拽卡片列表组件
 */
export function DraggableCardList({
  initialCards = [],
  onCardsChange,
}: DraggableCardsProps) {
  // 卡片状态
  const [cards, setCards] = useState<CardItem[]>(initialCards);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 最小拖拽距离以激活
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * 处理拖拽开始
   */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newCards = arrayMove(items, oldIndex, newIndex);
        // 通知父组件卡片已更改
        if (onCardsChange) {
          onCardsChange(newCards);
        }
        return newCards;
      });
    }
  };

  /**
   * 开始编辑卡片
   */
  const handleEditStart = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (card) {
      setEditingId(id);
      setEditContent(card.content);
    }
  };

  /**
   * 更新编辑内容
   */
  const handleEditChange = (content: string) => {
    setEditContent(content);
  };

  /**
   * 保存编辑内容
   */
  const handleEditSave = () => {
    if (editingId) {
      const newCards = cards.map((card) =>
        card.id === editingId ? { ...card, content: editContent } : card
      );
      setCards(newCards);
      if (onCardsChange) {
        onCardsChange(newCards);
      }
    }
    setEditingId(null);
    setEditContent('');
  };

  /**
   * 取消编辑
   */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  /**
   * 删除卡片
   */
  const handleDelete = (id: string) => {
    const newCards = cards.filter((card) => card.id !== id);
    setCards(newCards);
    if (onCardsChange) {
      onCardsChange(newCards);
    }
  };

  /**
   * 添加新卡片
   */
  const handleAddCard = () => {
    const newCard: CardItem = {
      id: `card-${Date.now()}`,
      content: '新的要点',
    };

    const newCards = [...cards, newCard];
    setCards(newCards);

    if (onCardsChange) {
      onCardsChange(newCards);
    }

    // 自动开始编辑新卡片
    handleEditStart(newCard.id);
  };

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card, index) => (
            <SortableCard
              key={card.id}
              card={card}
              index={index}
              isEditing={editingId === card.id}
              editContent={editingId === card.id ? editContent : ''}
              onEditStart={handleEditStart}
              onEditChange={handleEditChange}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* 添加卡片按钮 */}
      <button
        onClick={handleAddCard}
        className="w-full py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-400 hover:text-white transition-colors mt-4 flex items-center justify-center"
      >
        + 添加新要点
      </button>
    </div>
  );
} 