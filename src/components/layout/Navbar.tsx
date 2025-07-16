import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Moon, Sun, Upload, Plus, Menu } from "lucide-react";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="border-b border-gray-800 p-4 flex justify-between items-center h-16 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open sidebar</span>
        </Button>
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="bg-gray-900 border-gray-700 pl-10 text-sm rounded-lg w-full h-10"
              placeholder="Search by title"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 border border-gray-700 rounded-full p-1">
          <button className="p-1 rounded-full" title="Switch to dark mode">
            <Moon className="h-5 w-5 text-gray-400" />
          </button>
          <button className="p-1 rounded-full bg-gray-700" title="Switch to light mode">
            <Sun className="h-5 w-5 text-white" />
          </button>
        </div>
        <Button variant="outline" className="hidden md:flex border-gray-700 bg-gray-900 text-white hover:bg-gray-800 hover:text-white h-10">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button className="hidden md:flex bg-white text-black hover:bg-gray-200 h-10">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

