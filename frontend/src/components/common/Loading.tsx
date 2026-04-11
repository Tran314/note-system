import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = '加载中...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
      <span className="text-sm text-stone-500">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(247,242,235,0.72)] backdrop-blur-md">
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
    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
      {icon && <div className="mb-4 opacity-50">{icon}</div>}
      <h3 className="mb-1 text-lg font-medium">{title}</h3>
      {description && <p className="mb-4 text-sm">{description}</p>}
      {action}
    </div>
  );
}
