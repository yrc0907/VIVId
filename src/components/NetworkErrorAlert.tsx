import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface NetworkErrorAlertProps {
  visible: boolean;
  sessionId: string;
  onRetry: (sessionId: string) => void;
}

const NetworkErrorAlert: React.FC<NetworkErrorAlertProps> = ({
  visible,
  sessionId,
  onRetry
}) => {
  if (!visible) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex items-start justify-between">
        <div>
          <AlertTitle>网络连接已断开</AlertTitle>
          <AlertDescription>
            生成过程中网络连接断开，请检查网络连接后重试。
          </AlertDescription>
        </div>
        <Button
          variant="destructive"
          className="ml-4 whitespace-nowrap"
          onClick={() => onRetry(sessionId)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          重新连接
        </Button>
      </div>
    </Alert>
  );
};

export default NetworkErrorAlert; 