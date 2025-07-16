import Link from "next/link";
import { Home, LayoutTemplate, Trash2, Settings, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className={`fixed z-20 inset-y-0 left-0 w-60 bg-black border-r border-gray-800 p-4 flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-md"></div>
            <h1 className="text-xl font-bold">Vivid</h1>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-gray-800">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link href="/templates" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800">
            <LayoutTemplate className="h-5 w-5" />
            <span>Templates</span>
          </Link>
          <Link href="/trash" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800">
            <Trash2 className="h-5 w-5" />
            <span>Trash</span>
          </Link>
        </nav>

        <div className="mt-auto">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={onClose}></div>}
    </>
  );
}
