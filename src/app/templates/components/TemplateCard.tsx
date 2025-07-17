"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

export function TemplateCard({ template }: { template: Template }) {
  return (
    <Card className="bg-gray-800 border-gray-700 rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={template.imageUrl}
            alt={template.name}
            layout="fill"
            objectFit="cover"
            className="transition-opacity duration-300 hover:opacity-90"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
          <p className="text-sm text-gray-400 mb-4">{template.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {template.category}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Eye className="h-4 w-4 mr-1" />
                预览
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Download className="h-4 w-4 mr-1" />
                使用
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 