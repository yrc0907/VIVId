import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface DownloadButtonProps {
  onDownload: () => void;
  isLoading: boolean;
  disabled: boolean;
}

/**
 * PPT下载按钮组件
 */
export function DownloadButton({
  onDownload,
  isLoading,
  disabled
}: DownloadButtonProps) {
  return (
    <Button
      variant="outline"
      className="bg-blue-600 hover:bg-blue-700 border-none text-white"
      onClick={onDownload}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          生成中...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          下载PPT
        </>
      )}
    </Button>
  );
} 