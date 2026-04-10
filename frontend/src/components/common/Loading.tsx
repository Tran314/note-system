import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = '加载中...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-gray-500 text-sm">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

interface EmptyProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Empty({ 
  icon, 
  title = '暂无数据', 
  description,
  action 
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      {icon && <div className="mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}