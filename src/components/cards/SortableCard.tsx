import React, { useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortableCardProps } from '@/types/card.types';

/**
 * 可排序卡片组件
 */
export function SortableCard({
  card,
  index,
  isEditing,
  editContent,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isEditing,
  });

  // 修复变换处理以避免抖动问题
  const style = {
    transform: CSS.Translate.toString(transform ? {
      x: 0, // 始终为0以防止水平移动
      y: transform.y,
      scaleX: 1,
      scaleY: 1,
    } : { x: 0, y: 0, scaleX: 1, scaleY: 1 }),
    transition: transition || undefined,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 当编辑开始时自动聚焦并调整文本区域高度
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      adjustTextareaHeight(textareaRef.current);
    }
  }, [isEditing]);

  /**
   * 调整文本区域高度以适应内容
   */
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  /**
   * 处理文本区域内容变化
   */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onEditChange(e.target.value);
    adjustTextareaHeight(e.target);
  };

  /**
   * 处理事件，阻止冒泡并调用回调
   */
  const createEventHandler = (callback: Function) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900 border border-gray-700 rounded-xl mb-4 flex items-center overflow-hidden shadow-lg transition-colors duration-200 hover:border-gray-600"
    >
      {/* 拖拽手柄 - 位于前面 */}
      {!isEditing && (
        <div
          className="flex items-center justify-center w-12 h-14 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing transition-colors duration-200"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      {/* 索引编号 */}
      <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-gray-300 rounded-lg h-8 w-8 flex items-center justify-center font-bold shadow-inner">
          {index + 1}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 py-4 pr-4">
        {isEditing ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              value={editContent}
              onChange={handleTextareaChange}
              aria-label="Edit card content"
              placeholder="Enter card content"
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                onClick={createEventHandler(onEditCancel)}
              >
                取消
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-500 to-fuchsia-500 hover:from-red-600 hover:to-fuchsia-600 text-white border-none rounded-md"
                onClick={createEventHandler(onEditSave)}
              >
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-white">
            {card.content}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {!isEditing && (
        <div className="flex-shrink-0 flex h-14">
          {/* 编辑按钮 */}
          <button
            className="flex items-center justify-center w-12 h-full text-gray-400 hover:text-white transition-colors duration-200"
            onClick={createEventHandler(() => onEditStart(card.id))}
            aria-label="编辑卡片"
          >
            <Pencil className="h-5 w-5" />
          </button>

          {/* 删除按钮 */}
          <button
            className="flex items-center justify-center w-12 h-full text-gray-400 hover:text-red-500 transition-colors duration-200"
            onClick={createEventHandler(() => onDelete(card.id))}
            aria-label="删除卡片"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
} 