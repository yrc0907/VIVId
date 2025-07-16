import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DropAnimation,
  defaultDropAnimation,
  DragStartEvent,
  UniqueIdentifier,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Card item interface
export interface CardItem {
  id: string;
  content: string;
}

// Props for each sortable card
interface SortableCardProps {
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

// Component for each sortable card
function SortableCard({
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

  // Fix the bouncing issue with proper transform handling
  const style = {
    transform: CSS.Translate.toString(transform ? {
      x: 0, // Always 0 for x-axis to prevent horizontal movement
      y: transform.y,
      scaleX: 1,
      scaleY: 1,
    } : { x: 0, y: 0, scaleX: 1, scaleY: 1 }),
    transition: transition || undefined,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus and adjust height of textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  // Handle textarea height adjustment
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onEditChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleEditButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEditStart(card.id);
  };

  const handleDeleteButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(card.id);
  };

  const handleSaveButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEditSave();
  };

  const handleCancelButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEditCancel();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900 border border-gray-700 rounded-xl mb-4 flex items-center overflow-hidden shadow-lg transition-colors duration-200 hover:border-gray-600"
    >
      {/* Drag Handle - Now at the front */}
      {!isEditing && (
        <div
          className="flex items-center justify-center w-12 h-14 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing transition-colors duration-200"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      {/* Index number */}
      <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-gray-300 rounded-lg h-8 w-8 flex items-center justify-center font-bold shadow-inner">
          {index + 1}
        </div>
      </div>

      {/* Content area */}
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
                onClick={handleCancelButtonClick}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-500 to-fuchsia-500 hover:from-red-600 hover:to-fuchsia-600 text-white border-none rounded-md"
                onClick={handleSaveButtonClick}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-white">
            {card.content}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isEditing && (
        <div className="flex-shrink-0 flex h-14">
          {/* Edit button */}
          <button
            className="flex items-center justify-center w-12 h-full text-gray-400 hover:text-white transition-colors duration-200"
            onClick={handleEditButtonClick}
            aria-label="Edit card"
          >
            <Pencil className="h-5 w-5" />
          </button>

          {/* Delete button */}
          <button
            className="flex items-center justify-center w-12 h-full text-gray-400 hover:text-red-400 transition-colors duration-200"
            onClick={handleDeleteButtonClick}
            aria-label="Delete card"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Props for the DraggableCards component
export interface DraggableCardsProps {
  initialCards?: CardItem[];
  onCardsChange?: (cards: CardItem[]) => void;
}

// Main DraggableCards component
export default function DraggableCards({
  initialCards = [],
  onCardsChange,
}: DraggableCardsProps) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Initialize cards only once on mount or when initialCards changes
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // Configure sensors with proper settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Notify parent component if needed
        if (onCardsChange) {
          setTimeout(() => onCardsChange(newItems), 0);
        }

        return newItems;
      });
    }
  };

  // Handle edit card
  const handleEditStart = (id: string) => {
    const cardToEdit = cards.find((card) => card.id === id);
    if (cardToEdit) {
      setEditingCardId(id);
      setEditingContent(cardToEdit.content);
    }
  };

  // Handle edit content change
  const handleEditChange = (content: string) => {
    setEditingContent(content);
  };

  // Handle save edit
  const handleEditSave = () => {
    if (editingCardId) {
      setCards((prevCards) => {
        const updatedCards = prevCards.map((card) =>
          card.id === editingCardId
            ? { ...card, content: editingContent }
            : card
        );

        // Notify parent component if needed
        if (onCardsChange) {
          setTimeout(() => onCardsChange(updatedCards), 0);
        }

        return updatedCards;
      });

      setEditingCardId(null);
      setEditingContent('');
    }
  };

  // Handle cancel edit
  const handleEditCancel = () => {
    setEditingCardId(null);
    setEditingContent('');
  };

  // Handle delete card
  const handleDelete = (id: string) => {
    setCards((prevCards) => {
      const newCards = prevCards.filter((card) => card.id !== id);

      // Notify parent component if needed
      if (onCardsChange) {
        setTimeout(() => onCardsChange(newCards), 0);
      }

      return newCards;
    });
  };

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          },
        }}
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
              isEditing={editingCardId === card.id}
              editContent={editingCardId === card.id ? editingContent : ''}
              onEditStart={handleEditStart}
              onEditChange={handleEditChange}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
} 