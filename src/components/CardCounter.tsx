import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CardCounterProps {
  count: number;
  onClear: () => void;
}

export default function CardCounter({ count, onClear }: CardCounterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white focus:outline-none"
        aria-label="Card options"
      >
        <span>{count > 0 ? `${count} Cards` : "No cards"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {count > 0 ? (
              <button
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Clear all cards
              </button>
            ) : (
              <div className="block px-4 py-2 text-sm text-gray-500">
                No actions available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 